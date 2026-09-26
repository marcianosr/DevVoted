import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runStatesTable,
	runsTable,
	userConfigUnlocksTable,
	userServiceUnlocksTable,
	userObjectiveProgressTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import { STORAGE_UNITS } from "~/shared/lib/storage";

import { storageCreditRate } from "~/modules/run/run/domain/rules.model";

import {
	isExclusive,
	type Title,
	TITLE_METRICS,
	titlesEarnedBy,
} from "~/modules/account/profile/domain/title.model";

import {
	configsUnlockedBy,
	type ObjectiveCount,
	type ObjectiveMetric,
	type UnlockGrant,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	servicesUnlockedBy,
	type ServiceUnlockGrant,
} from "~/modules/run/shop/domain/registryControl.model";
import { objectiveIncrementsFor } from "~/modules/run/run/domain/objectiveProgress.model";
import { gateSliceOf } from "~/modules/run/run/domain/rebase.model";

import {
	archiveCreditBytes,
	isRunOver,
	type RunState,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import {
	type RunAction,
	runReducer,
} from "~/modules/run/run/domain/runAction.model";
import {
	answerOutcome,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	hydrateRunState,
	type RunSnapshot,
	toRunSnapshot,
} from "~/modules/run/run/domain/runSnapshot.model";
import {
	liveAuditsFor,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	fetchRunPollsForRun,
	getOrCreateDailyRunSeed,
	insertRunPolls,
	rewriteRunPollOrder,
	rollSegmentForward,
} from "~/modules/run/run/infrastructure/runPolls.repository";

export type SessionRunRecord = typeof runsTable.$inferSelect;

export const findActiveSessionRun = async (
	userId: string
): Promise<SessionRunRecord | null> => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, "session"),
				eq(runsTable.status, "active")
			)
		)
		.orderBy(desc(runsTable.id))
		.limit(1);
	return run ?? null;
};

export const findSessionRunByDate = async (
	userId: string,
	seedDate: string
): Promise<SessionRunRecord | null> => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(
			and(
				eq(runsTable.user_id, userId),
				eq(runsTable.mode, "session"),
				eq(runsTable.seed_date, seedDate)
			)
		)
		.orderBy(desc(runsTable.id))
		.limit(1);
	return run ?? null;
};

export const findSessionRunById = async (
	runId: number
): Promise<SessionRunRecord | null> => {
	const [run] = await db
		.select()
		.from(runsTable)
		.where(and(eq(runsTable.id, runId), eq(runsTable.mode, "session")))
		.limit(1);
	return run ?? null;
};

export const fetchAnsweredPollIdsForDay = async (
	userId: string,
	date: string
): Promise<Set<number>> => {
	const rows = await db
		.select({ poll_id: pollResponsesTable.poll_id })
		.from(pollResponsesTable)
		.where(
			and(
				eq(pollResponsesTable.user_id, userId),
				eq(pollResponsesTable.mode, "session"),
				eq(pollResponsesTable.answer_date, date)
			)
		);
	return new Set(rows.map((row) => row.poll_id));
};

export const fetchRunSnapshot = async (
	runId: number
): Promise<RunSnapshot | null> => {
	const [row] = await db
		.select({ state: runStatesTable.state })
		.from(runStatesTable)
		.where(eq(runStatesTable.run_id, runId))
		.limit(1);
	return row?.state ?? null;
};

const configsNewlyInstalled = (
	before: Pick<RunState, "build">,
	after: Pick<RunState, "build">
): readonly string[] => {
	const held = new Set(before.build.configs.map((config) => config.id));
	return after.build.configs
		.map((config) => config.id)
		.filter((configId) => !held.has(configId));
};

const stampFirstInstalls = async (
	tx: Pick<typeof db, "update">,
	userId: string,
	configIds: readonly string[]
): Promise<void> => {
	if (configIds.length === 0) return;
	await tx
		.update(userConfigUnlocksTable)
		.set({ first_installed_at: sql`now()` })
		.where(
			and(
				eq(userConfigUnlocksTable.user_id, userId),
				inArray(userConfigUnlocksTable.config_id, configIds),
				isNull(userConfigUnlocksTable.first_installed_at)
			)
		);
};

const gatesNewlyEarned = (
	before: Pick<RunState, "swatchGatesEarned">,
	after: Pick<RunState, "swatchGatesEarned">
): readonly number[] => {
	const held = before.swatchGatesEarned ?? [];
	return (after.swatchGatesEarned ?? []).filter((gate) => !held.includes(gate));
};

const awardGateSwatch = async (
	tx: Pick<typeof db, "update">,
	userId: string,
	gate: number
): Promise<void> => {
	const swatch = swatchForGate(gate);
	if (!swatch) return;
	await tx
		.update(usersTable)
		.set({
			owned_swatch_ids: sql`array_append(${usersTable.owned_swatch_ids}, ${swatch.id})`,
		})
		.where(
			and(
				eq(usersTable.id, userId),
				sql`NOT (${usersTable.owned_swatch_ids} @> ARRAY[${swatch.id}]::text[])`
			)
		);
};

const recordObjectiveProgress = async (
	tx: Pick<typeof db, "insert">,
	userId: string,
	metrics: readonly ObjectiveMetric[]
): Promise<readonly ObjectiveCount[]> =>
	tx
		.insert(userObjectiveProgressTable)
		.values(metrics.map((metric) => ({ user_id: userId, metric, count: 1 })))
		.onConflictDoUpdate({
			target: [
				userObjectiveProgressTable.user_id,
				userObjectiveProgressTable.metric,
			],
			set: {
				count: sql`${userObjectiveProgressTable.count} + 1`,
				updated_at: new Date(),
			},
		})
		.returning({
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		});

const awardConfigUnlocks = async (
	tx: Pick<typeof db, "insert">,
	userId: string,
	grants: readonly UnlockGrant[]
): Promise<readonly string[]> => {
	const rows = await tx
		.insert(userConfigUnlocksTable)
		.values(
			grants.map((grant) => ({
				user_id: userId,
				config_id: grant.configId,
				via_metric: grant.viaMetric,
			}))
		)
		.onConflictDoNothing()
		.returning({ config_id: userConfigUnlocksTable.config_id });
	return rows.map((row) => row.config_id);
};

const awardServiceUnlocks = async (
	tx: Pick<typeof db, "insert">,
	userId: string,
	grants: readonly ServiceUnlockGrant[]
): Promise<void> => {
	await tx
		.insert(userServiceUnlocksTable)
		.values(
			grants.map((grant) => ({
				user_id: userId,
				service_id: grant.serviceId,
				via_metric: grant.viaMetric,
			}))
		)
		.onConflictDoNothing();
};

const awardTitles = async (
	tx: Pick<typeof db, "insert">,
	userId: string,
	titles: readonly Title[]
): Promise<readonly string[]> => {
	const rows = await tx
		.insert(userTitlesTable)
		.values(
			titles.map((title) => ({
				user_id: userId,
				title_id: title.id,
				exclusive: isExclusive(title),
			}))
		)
		.onConflictDoNothing()
		.returning({ title_id: userTitlesTable.title_id });
	return rows.map((row) => row.title_id);
};

const grantEarnedTitles = async (
	tx: Pick<typeof db, "select" | "insert">,
	userId: string
): Promise<readonly string[]> => {
	const counts = await tx
		.select({
			metric: userObjectiveProgressTable.metric,
			count: userObjectiveProgressTable.count,
		})
		.from(userObjectiveProgressTable)
		.where(
			and(
				eq(userObjectiveProgressTable.user_id, userId),
				inArray(userObjectiveProgressTable.metric, [...TITLE_METRICS])
			)
		);
	const earned = titlesEarnedBy(counts);
	if (earned.length === 0) return [];
	return awardTitles(tx, userId, earned);
};

const grantObjectiveUnlocks = async (
	tx: Pick<typeof db, "insert">,
	userId: string,
	metrics: readonly ObjectiveMetric[]
): Promise<readonly string[]> => {
	const counts = await recordObjectiveProgress(tx, userId, metrics);
	const grants = configsUnlockedBy(counts);
	const unlocked =
		grants.length === 0 ? [] : await awardConfigUnlocks(tx, userId, grants);
	const services = servicesUnlockedBy(counts);
	if (services.length > 0) await awardServiceUnlocks(tx, userId, services);
	return unlocked;
};

const raiseStorageWatermark = async (
	tx: Pick<typeof db, "update">,
	userId: string,
	peakKb: number
): Promise<void> => {
	await tx
		.update(usersTable)
		.set({
			peak_storage_kb: sql`GREATEST(${usersTable.peak_storage_kb}, ${peakKb})`,
		})
		.where(eq(usersTable.id, userId));
};

export const createSessionRunWithState = async (
	userId: string,
	seedDate: string,
	initialState: RunState
): Promise<{ runId: number }> =>
	db.transaction(async (tx) => {
		const [run] = await tx
			.insert(runsTable)
			.values({
				user_id: userId,
				mode: "session",
				seed_date: seedDate,
				status: "active",
			})
			.returning({ id: runsTable.id });

		await tx.insert(runStatesTable).values({
			run_id: run.id,
			state: toRunSnapshot(initialState),
			engine_status: initialState.status,
			gates_cleared: initialState.gatesCleared,
			coverage: initialState.coverage,
			polls_answered: initialState.currentIndex,
		});

		await insertRunPolls(tx, run.id, initialState.polls, seedDate);

		return { runId: run.id };
	});

export type RunTx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Tx = RunTx;

export type RunSettlement = (
	tx: RunTx,
	before: RunState,
	after: RunState
) => Promise<RunState>;

export const ensureTodaysSegment = async (
	runId: number,
	today: string
): Promise<void> => {
	await getOrCreateDailyRunSeed(today);
	return db.transaction(async (tx) => {
		const [stateRow] = await tx
			.select({ polls_answered: runStatesTable.polls_answered })
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, runId))
			.for("update");
		if (!stateRow) throw new Error("Run state not found");
		await rollSegmentForward(tx, runId, today, stateRow.polls_answered);
	});
};

const toSelectedOptionRecordIds = (
	poll: RunPoll,
	optionIds: readonly string[]
): number[] =>
	poll.options
		.filter((option) => optionIds.includes(option.id))
		.map((option) => Number(option.id));

const recordSessionAnswer = async (
	tx: Tx,
	args: { runId: number; userId: string; today: string },
	poll: RunPoll,
	optionIds: readonly string[],
	elapsedMs?: number,
	mirrored = false
): Promise<void> => {
	const [response] = await tx
		.insert(pollResponsesTable)
		.values({
			poll_id: Number(poll.id),
			user_id: args.userId,
			run_id: args.runId,
			mode: "session",
			answer_date: args.today,
			answer_time_ms: elapsedMs ?? null,
			mirrored,
			outcome: answerOutcome(poll, optionIds),
		})
		.returning({ response_id: pollResponsesTable.response_id });

	if (!response) throw new Error("Failed to record session answer");

	const selectedIds = toSelectedOptionRecordIds(poll, optionIds);
	if (selectedIds.length === 0) return;

	await tx.insert(pollResponseOptionsTable).values(
		selectedIds.map((option_id) => ({
			response_id: response.response_id,
			option_id,
		}))
	);
};

const finishSessionRun = async (
	tx: Tx,
	runId: number,
	userId: string,
	state: RunState
): Promise<void> => {
	const reason = state.status === "won" ? "victory" : "dead";
	const wonAt =
		state.status === "won" ? { victory_achieved_at: new Date() } : {};
	await tx
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
			completion_reason: reason,
			...wonAt,
		})
		.where(eq(runsTable.id, runId));

	const creditBytes = archiveCreditBytes(state);
	if (creditBytes > 0) {
		await tx
			.update(usersTable)
			.set({
				archived_storage: sql`${usersTable.archived_storage} + ${creditBytes}`,
			})
			.where(eq(usersTable.id, userId));
	}
};

export const fetchArchivedStorageKb = async (
	userId: string
): Promise<number> => {
	const [row] = await db
		.select({ bytes: usersTable.archived_storage })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);

	return Math.round((row?.bytes ?? 0) / STORAGE_UNITS.KB);
};

export const abandonSessionRun = async (
	runId: number,
	userId: string
): Promise<void> =>
	db.transaction(async (tx) => {
		const [stateRow] = await tx
			.select({ state: runStatesTable.state })
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, runId))
			.for("update");

		const updated = await tx
			.update(runsTable)
			.set({
				status: "finished",
				finished_at: new Date(),
				completion_reason: "abandoned",
			})
			.where(and(eq(runsTable.id, runId), eq(runsTable.status, "active")))
			.returning({ id: runsTable.id });
		if (updated.length === 0) throw new Error("Run is already over");

		const creditBytes = Math.round(
			(stateRow?.state.storage ?? 0) *
				STORAGE_UNITS.KB *
				storageCreditRate("abandoned", stateRow?.state.gatesCleared ?? 0)
		);
		if (creditBytes > 0) {
			await tx
				.update(usersTable)
				.set({
					archived_storage: sql`${usersTable.archived_storage} + ${creditBytes}`,
				})
				.where(eq(usersTable.id, userId));
		}
	});

const persistPinnedGate = async (
	tx: Pick<typeof db, "update">,
	userId: string,
	pinnedGate: number
): Promise<void> => {
	await tx
		.update(usersTable)
		.set({ pinned_gate: pinnedGate })
		.where(eq(usersTable.id, userId));
};

export const consumePinnedGate = async (userId: string): Promise<number> =>
	db.transaction(async (tx) => {
		const [row] = await tx
			.select({ pinnedGate: usersTable.pinned_gate })
			.from(usersTable)
			.where(eq(usersTable.id, userId))
			.for("update");
		const pinnedGate = row?.pinnedGate ?? null;
		if (pinnedGate === null) return 0;
		await tx
			.update(usersTable)
			.set({ pinned_gate: null })
			.where(eq(usersTable.id, userId));
		return pinnedGate;
	});

export const fetchStorageWatermark = async (
	userId: string
): Promise<number> => {
	const [row] = await db
		.select({ peakStorageKb: usersTable.peak_storage_kb })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);
	return row?.peakStorageKb ?? 0;
};

export const fetchOwnedSwatchIds = async (
	userId: string
): Promise<readonly string[]> => {
	const [row] = await db
		.select({ ownedSwatchIds: usersTable.owned_swatch_ids })
		.from(usersTable)
		.where(eq(usersTable.id, userId))
		.limit(1);
	return row?.ownedSwatchIds ?? [];
};

export const loadRunState = async (runId: number): Promise<RunState> => {
	const snapshot = await fetchRunSnapshot(runId);
	if (!snapshot) throw new Error("Run state not found");
	const polls = await fetchRunPollsForRun(runId);
	return hydrateRunState(snapshot, polls);
};

export type RunDispatchResult = {
	readonly state: RunState;
	readonly unlockedConfigIds: readonly string[];
	readonly earnedTitleIds: readonly string[];
};

export const applyActionToRun = async (args: {
	runId: number;
	userId: string;
	today: string;
	action: RunAction;
	settle?: RunSettlement;
}): Promise<RunDispatchResult> => {
	await getOrCreateDailyRunSeed(args.today);
	return db.transaction(async (tx) => {
		const [stateRow] = await tx
			.select()
			.from(runStatesTable)
			.where(eq(runStatesTable.run_id, args.runId))
			.for("update");

		if (!stateRow) throw new Error("Run state not found");
		if (isRunOver(stateRow.engine_status)) {
			throw new Error("Run is already over");
		}

		await rollSegmentForward(
			tx,
			args.runId,
			args.today,
			stateRow.polls_answered
		);
		const polls = await fetchRunPollsForRun(args.runId, tx);
		const state = hydrateRunState(stateRow.state, polls);
		const next = runReducer(state, args.action);
		if (next === state)
			return { state, unlockedConfigIds: [], earnedTitleIds: [] };

		const touched = objectiveIncrementsFor(state, next, args.action);
		const unlockedConfigIds =
			touched.length === 0
				? []
				: await grantObjectiveUnlocks(tx, args.userId, touched);

		if (args.action.type === "rebase")
			await rewriteRunPollOrder(
				tx,
				args.runId,
				state.currentIndex,
				gateSliceOf(next)
			);

		if (args.action.type === "answer") {
			await recordSessionAnswer(
				tx,
				args,
				state.polls[state.currentIndex],
				args.action.optionIds,
				args.action.elapsedMs,
				mirrorsPolls(
					liveAuditsFor(
						state.build.configs,
						state.gatesCleared,
						scheduleOf(state)
					)
				)
			);
		}

		for (const gate of gatesNewlyEarned(state, next))
			await awardGateSwatch(tx, args.userId, gate);

		if (
			next.pinPlantedAtGate !== undefined &&
			next.pinPlantedAtGate !== state.pinPlantedAtGate
		)
			await persistPinnedGate(tx, args.userId, next.pinPlantedAtGate);

		const settled =
			args.settle === undefined ? next : await args.settle(tx, state, next);

		await stampFirstInstalls(
			tx,
			args.userId,
			configsNewlyInstalled(state, settled)
		);

		await tx
			.update(runStatesTable)
			.set({
				state: toRunSnapshot(settled),
				engine_status: settled.status,
				gates_cleared: settled.gatesCleared,
				coverage: settled.coverage,
				polls_answered: settled.currentIndex,
			})
			.where(eq(runStatesTable.run_id, args.runId));

		const earnedTitleIds = isRunOver(settled.status)
			? await grantEarnedTitles(tx, args.userId)
			: [];

		if (isRunOver(settled.status)) {
			await finishSessionRun(tx, args.runId, args.userId, settled);
		}

		if ((settled.peakStorageKb ?? 0) > (state.peakStorageKb ?? 0))
			await raiseStorageWatermark(tx, args.userId, settled.peakStorageKb ?? 0);

		return { state: settled, unlockedConfigIds, earnedTitleIds };
	});
};

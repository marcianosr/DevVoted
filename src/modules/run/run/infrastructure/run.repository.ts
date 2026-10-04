import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runStatesTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { STORAGE_UNITS } from "~/shared/lib/storage";
import { CHAMPION_BORDER_ID } from "~/modules/account/profile/domain/border.model";

import { accountGrantsOf } from "~/modules/run/run/domain/accountGrant.model";
import { objectiveIncrementsFor } from "~/modules/run/run/domain/objectiveProgress.model";
import { gateSliceOf } from "~/modules/run/run/domain/rebase.model";
import { recordGains } from "~/modules/run/run/domain/closeGains.model";
import {
	applyAccountGrants,
	applyObjectiveGrants,
	grantEarnedTitles,
} from "~/modules/run/run/infrastructure/accountGrant.repository";

import {
	archiveCreditBytes,
	entersHallOfFame,
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
	const credit =
		creditBytes > 0
			? {
					archived_storage: sql`${usersTable.archived_storage} + ${creditBytes}`,
				}
			: {};
	const championBorder = entersHallOfFame(state)
		? {
				owned_border_ids: sql`array_append(array_remove(${usersTable.owned_border_ids}, ${CHAMPION_BORDER_ID}), ${CHAMPION_BORDER_ID})`,
			}
		: {};
	const grants = { ...credit, ...championBorder };
	if (Object.keys(grants).length === 0) return;

	await tx.update(usersTable).set(grants).where(eq(usersTable.id, userId));
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

export const debitArchivedStorage = async (
	tx: RunTx,
	userId: string,
	bytes: number
): Promise<number | null> => {
	const [row] = await tx
		.update(usersTable)
		.set({
			archived_storage: sql`${usersTable.archived_storage} - ${bytes}`,
		})
		.where(
			and(eq(usersTable.id, userId), gte(usersTable.archived_storage, bytes))
		)
		.returning({ archivedStorage: usersTable.archived_storage });

	return row?.archivedStorage ?? null;
};

export const abandonSessionRun = async (runId: number): Promise<void> => {
	const updated = await db
		.update(runsTable)
		.set({
			status: "finished",
			finished_at: new Date(),
			completion_reason: "abandoned",
		})
		.where(and(eq(runsTable.id, runId), eq(runsTable.status, "active")))
		.returning({ id: runsTable.id });
	if (updated.length === 0) throw new Error("Run is already over");
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

export const countSessionRuns = async (userId: string): Promise<number> => {
	const [row] = await db
		.select({ runs: count().mapWith(Number) })
		.from(runsTable)
		.where(and(eq(runsTable.user_id, userId), eq(runsTable.mode, "session")));
	return row?.runs ?? 0;
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
				: await applyObjectiveGrants(tx, args.userId, touched);

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

		const settled =
			args.settle === undefined ? next : await args.settle(tx, state, next);
		const grants = accountGrantsOf(state, settled);
		await applyAccountGrants(tx, args.userId, grants);
		const earnedTitleIds = grants.titlesDue
			? await grantEarnedTitles(tx, args.userId)
			: [];
		const recorded = recordGains(state, settled, {
			unlockedConfigIds,
			earnedTitleIds,
		});

		await tx
			.update(runStatesTable)
			.set({
				state: toRunSnapshot(recorded),
				engine_status: settled.status,
				gates_cleared: settled.gatesCleared,
				coverage: settled.coverage,
				polls_answered: settled.currentIndex,
			})
			.where(eq(runStatesTable.run_id, args.runId));

		if (isRunOver(settled.status)) {
			await finishSessionRun(tx, args.runId, args.userId, settled);
		}

		return { state: recorded, unlockedConfigIds, earnedTitleIds };
	});
};

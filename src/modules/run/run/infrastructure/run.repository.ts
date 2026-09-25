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

/** The user's persistent run-in-progress (ADR-011) — at most one exists. */
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

/** Latest run started on `seedDate` — several may exist since same-day restart (DVTD-li9i). */
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

/**
 * One run by id, whoever owns it. The caller checks ownership — a permalink
 * takes its id from the URL, so the row has to come back before it can be
 * judged against the session.
 */
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

/**
 * Every poll the user answered today across ALL their runs. New runs start
 * from today's seed minus these, so a same-day restart can never re-answer a
 * poll — one vote per player per poll per day stays true for the community.
 */
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

/**
 * Config ids in the build after the action and not before. Keyed on the state
 * diff rather than on `action.type === "install"` because a config also enters
 * the build through the shop's draft — one predicate that cannot go stale as
 * transitions are added.
 */
const configsNewlyInstalled = (
	before: Pick<RunState, "build">,
	after: Pick<RunState, "build">
): readonly string[] => {
	const held = new Set(before.build.configs.map((config) => config.id));
	return after.build.configs
		.map((config) => config.id)
		.filter((configId) => !held.has(configId));
};

/**
 * ADR-064's unplayed queue is "granted but never installed", so the stamp is
 * write-once: the IS NULL guard makes re-installing on a later run a no-op
 * rather than a rewrite. No row is ever created here — a config the account
 * does not own cannot be installed in the first place.
 */
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

/**
 * A flawless window earns that gate's swatch permanently, account-wide
 * (ADR-080). The guard makes it idempotent: earning Boulder again on a later
 * run matches no row, so the array never collects duplicates.
 */
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

/**
 * The objective ledger's upsert (ADR-051): every touched metric gains one, and
 * RETURNING hands back the fresh lifetime counts so the grant check reads what
 * this very transaction wrote.
 */
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

/**
 * A grant is a row with its provenance (ADR-064). ON CONFLICT DO NOTHING makes
 * re-crossing a target idempotent, and RETURNING yields only the rows this
 * insert actually created — exactly the just-unlocked ids the client announces.
 */
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

/**
 * A service grant is the same row shape as a config grant (ADR-116): permanent,
 * with its provenance, idempotent through ON CONFLICT DO NOTHING.
 */
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

/**
 * A title is permanent, so the insert — not a predicate — is what decides one
 * is new. ON CONFLICT DO NOTHING covers both keys at once: the primary key
 * stops a second copy reaching the same account, and the partial unique index
 * on an exclusive title stops a second account reaching the title at all. Every
 * other row in the same batch still lands.
 */
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

/**
 * Titles settle when the run ends, not when the counter moves. Two reasons:
 * "a correct answer in every category" cannot be read off an upsert's
 * RETURNING, which holds only the metrics this one action touched, and the
 * run-over screen is the only place a title is announced anyway. So the ledger
 * is read wide once per run rather than once per answer.
 */
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

/**
 * Raises the account's KB high-water mark. `GREATEST` rather than a read and a
 * write, so two runs settling at once cannot lower it between them.
 */
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

/**
 * The one seam after the reducer and before the write. Whatever it returns is
 * what persists, so a rival's incident can lock into the snapshot without a
 * second write path (ADR-099).
 */
export type RunSettlement = (
	tx: RunTx,
	before: RunState,
	after: RunState
) => Promise<RunState>;

/** Standalone rollover for read paths (getTodaysRun). Dispatch rolls over inside its own transaction. */
export const ensureTodaysSegment = async (
	runId: number,
	today: string
): Promise<void> => {
	// Before the lock, not inside it: the seed opens its own transaction, and
	// taking it while holding run_states FOR UPDATE inverts the lock order.
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

/**
 * Maps engine option ids (strings) back to DB option ids for the answered
 * poll. The engine tolerates unknown ids (they count as a wrong pick), so the
 * persistence layer must not be stricter than the game authority.
 */
const toSelectedOptionRecordIds = (
	poll: RunPoll,
	optionIds: readonly string[]
): number[] =>
	poll.options
		.filter((option) => optionIds.includes(option.id))
		.map((option) => Number(option.id));

/**
 * Session answers double as real polls_responses rows (slice 2, ADR-005) so
 * answer data is queryable by the social layer — even for abandoned runs.
 * Runs inside the dispatch transaction: the response row commits iff the
 * state advance commits. score_breakdown/coverage_delta stay null; session
 * scoring lives in run_states.
 */
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

	// Economy bridge: leftover run storage becomes persistent meta-currency.
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

/**
 * The account archive, in KB. The finish credit is applied inside the same
 * transaction that ends a run, so by the time the run-over screen asks, this
 * already reads as the balance *after* the run banked.
 */
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

/**
 * Walking away: the run finishes as "abandoned" and its leftover storage is
 * banked at STORAGE_CREDIT_RATE.abandoned (currently nothing — abandoning is
 * not a cash-out). Locks the state row like dispatch does, so an in-flight
 * answer and an abandon cannot interleave.
 */
export const abandonSessionRun = async (
	runId: number,
	userId: string
): Promise<void> =>
	db.transaction(async (tx) => {
		// A missing state row means a corrupt, unplayable run (seen once on
		// dev) — abandoning is exactly how it gets cleaned up, with 0 credit.
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

/**
 * The git tag's persistence (ADR-036). Planting writes the account column so
 * the tag outlives the run that bought it; starting the rescued run consumes
 * it atomically (UPDATE … RETURNING) — burn on use, one rescue per tag.
 */
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

/** Swatch ids the player has earned across every run — the collection surface. */
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

/**
 * The dispatch hot path. One transaction: lock the state row (serializes
 * double-submits), rehydrate, run the engine as authority, persist. Returns
 * the next state — identical to the previous state when the action was
 * illegal for the current status (the reducer's no-op contract) — plus the
 * config ids this very action unlocked (ADR-051's grant seam).
 */
/**
 * A run's hydrated engine state. The snapshot and the day's polls live in
 * different tables (ADR-009: the sequence is shared, so it is stored once), and
 * putting the join here keeps callers from having to know that — or the order
 * to do it in.
 */
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
	// Same ordering as ensureTodaysSegment: today's shared sequence must exist
	// before the rollover inside the lock goes looking for it, and a missing
	// seed makes that rollover a silent no-op rather than an error.
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

		// The objective ledger ticks at the seam (ADR-051): the reducer stays
		// pure, the counters live on the account, and a crossed target grants
		// inside the same transaction as the action that crossed it.
		const touched = objectiveIncrementsFor(state, next, args.action);
		const unlockedConfigIds =
			touched.length === 0
				? []
				: await grantObjectiveUnlocks(tx, args.userId, touched);

		// `rebase` rewrites only `RunState.polls`, which the snapshot drops, so
		// the new order has to reach `run_polls` or it dies with this request
		// (DVTD-mkhg). `state.currentIndex` because a rebase never moves the
		// cursor, matching how the answer branch below sources its poll.
		if (args.action.type === "rebase")
			await rewriteRunPollOrder(
				tx,
				args.runId,
				state.currentIndex,
				gateSliceOf(next)
			);

		if (args.action.type === "answer") {
			// The answered poll comes from the PRE-action state: `next` has either
			// advanced currentIndex past it, or held it for the gate's close.
			await recordSessionAnswer(
				tx,
				args,
				state.polls[state.currentIndex],
				args.action.optionIds,
				args.action.elapsedMs,
				// Which question was asked, recorded beside the answer: the picks
				// alone cannot say, and every reader downstream needs to know
				// (ADR-038).
				mirrorsPolls(
					liveAuditsFor(
						state.build.configs,
						state.gatesCleared,
						scheduleOf(state)
					)
				)
			);
		}

		// The swatch rides the window, not the clear: the close stamps the gate
		// whose five polls all landed, and only a fresh stamp pays out (ADR-080).
		for (const gate of gatesNewlyEarned(state, next))
			await awardGateSwatch(tx, args.userId, gate);

		// A freshly planted tag mirrors onto the account, where it outlives the
		// run (ADR-036).
		if (
			next.pinPlantedAtGate !== undefined &&
			next.pinPlantedAtGate !== state.pinPlantedAtGate
		)
			await persistPinnedGate(tx, args.userId, next.pinPlantedAtGate);

		const settled =
			args.settle === undefined ? next : await args.settle(tx, state, next);

		// Against `settled`, not `next`: this is the state actually persisted, so
		// the stamp can never disagree with the build that got written.
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

		// After the objective upsert above, so a summit read here already counts
		// the clear that just happened.
		const earnedTitleIds = isRunOver(settled.status)
			? await grantEarnedTitles(tx, args.userId)
			: [];

		if (isRunOver(settled.status)) {
			await finishSessionRun(tx, args.runId, args.userId, settled);
		}

		// The account remembers the best KB any run ever held, which is what
		// opens storage rungs. Every earner counts, not only a clear, and a run
		// that dies still keeps the mark it reached.
		if ((settled.peakStorageKb ?? 0) > (state.peakStorageKb ?? 0))
			await raiseStorageWatermark(tx, args.userId, settled.peakStorageKb ?? 0);

		return { state: settled, unlockedConfigIds, earnedTitleIds };
	});
};

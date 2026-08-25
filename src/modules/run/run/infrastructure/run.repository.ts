import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "~/database/db";
import {
	pollResponseOptionsTable,
	pollResponsesTable,
	runStatesTable,
	runsTable,
	usersTable,
} from "~/database/schema";
import { STORAGE_UNITS } from "~/shared/lib/storage";

import { storageCreditRate } from "~/modules/run/run/domain/rules.model";

import {
	isRunOver,
	type RunAction,
	type RunState,
	runReducer,
} from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
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
 * Clearing a gate earns that gate's swatch permanently, account-wide (ADR-019).
 * The guard makes it idempotent: re-clearing gate 1 on a later run matches no
 * row, so the array never collects duplicates.
 */
const awardGateSwatch = async (
	tx: Pick<typeof db, "update">,
	userId: string,
	clearedGate: number
): Promise<void> => {
	const swatch = swatchForGate(clearedGate);
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

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

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

	// Economy bridge: leftover run storage becomes persistent meta-currency,
	// at a rate proportional to how far the climb got (storageCreditRate).
	// Only gates actually climbed count — a tag-rescued run banks nothing for
	// the gates its checkpoint skipped (ADR-036). Engine storage is KB;
	// archived_storage is bytes.
	const creditBytes = Math.round(
		state.storage *
			STORAGE_UNITS.KB *
			storageCreditRate(reason, state.gatesCleared - (state.startedAtGate ?? 0))
	);
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
 * illegal for the current status (the reducer's no-op contract).
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
	return hydrateRunState(snapshot, await fetchRunPollsForRun(runId));
};

export const applyActionToRun = async (args: {
	runId: number;
	userId: string;
	today: string;
	action: RunAction;
}): Promise<RunState> => {
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
		if (next === state) return state;

		if (args.action.type === "answer") {
			// The answered poll comes from the PRE-action state — the reducer
			// has already advanced currentIndex past it in `next`.
			await recordSessionAnswer(
				tx,
				args,
				state.polls[state.currentIndex],
				args.action.optionIds,
				args.action.elapsedMs,
				// Which question was asked, recorded beside the answer: the picks
				// alone cannot say, and every reader downstream needs to know
				// (ADR-038).
				mirrorsPolls(liveAuditsFor(state.pipeline.configs, state.gatesCleared))
			);
		}

		// A clear advances gatesCleared by one, and `clearedGate` names the gate it
		// beat — the badge that clear awarded (ADR-019).
		if (
			next.gatesCleared > state.gatesCleared &&
			next.clearedGate !== undefined
		)
			await awardGateSwatch(tx, args.userId, next.clearedGate);

		// A freshly planted tag mirrors onto the account, where it outlives the
		// run (ADR-036).
		if (
			next.pinPlantedAtGate !== undefined &&
			next.pinPlantedAtGate !== state.pinPlantedAtGate
		)
			await persistPinnedGate(tx, args.userId, next.pinPlantedAtGate);

		await tx
			.update(runStatesTable)
			.set({
				state: toRunSnapshot(next),
				engine_status: next.status,
				gates_cleared: next.gatesCleared,
				coverage: next.coverage,
				polls_answered: next.currentIndex,
			})
			.where(eq(runStatesTable.run_id, args.runId));

		if (isRunOver(next.status)) {
			await finishSessionRun(tx, args.runId, args.userId, next);
		}

		return next;
	});
};

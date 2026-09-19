import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { createRun } from "~/modules/run/run/domain/run.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import { drawAuditSchedule } from "~/modules/run/gate/domain/auditSchedule.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import { poolFor, startingHand } from "~/modules/run/config/domain/hand.model";
import {
	type RunView,
	toRunView,
} from "~/modules/run/run/application/runView.viewmodel";
import {
	abandonSessionRun,
	applyActionToRun,
	consumePinnedGate,
	createSessionRunWithState,
	ensureTodaysSegment,
	fetchAnsweredPollIdsForDay,
	fetchArchivedStorageKb,
	fetchRunSnapshot,
	loadRunState,
	findActiveSessionRun,
	findSessionRunById,
	fetchOwnedSwatchIds,
	findSessionRunByDate,
	type SessionRunRecord,
} from "~/modules/run/run/infrastructure/run.repository";
import { fetchRunPollsForDate } from "~/modules/run/run/infrastructure/runPolls.repository";
import {
	fetchUnlockedConfigIds,
	fetchUnlocksSince,
} from "~/modules/run/config/infrastructure/configUnlock.repository";

// A run's unlock history is the grants stamped since it started — derived from
// user_config_unlocks rather than stored on the run (ADR-064: the reducer
// stays pure, and only one session run is ever active at a time).
const unlocksDuring = (run: SessionRunRecord) =>
	fetchUnlocksSince(run.user_id, run.started_at ?? new Date(0));

const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const [state, unlockedThisRun, archiveAfterKb] = await Promise.all([
		loadRunState(run.id),
		unlocksDuring(run),
		fetchArchivedStorageKb(run.user_id),
	]);
	return { ...toRunView(state, [], unlockedThisRun), archiveAfterKb };
};

const continueActiveRun = async (
	run: SessionRunRecord,
	date: string
): Promise<RunView> => {
	await ensureTodaysSegment(run.id, date);
	return viewOfRun(run);
};

/**
 * The active run, if it is playable. An active run whose state row is missing
 * (corrupt — seen once on dev) is unplayable and would brick every request;
 * self-heal by abandoning it (credits nothing) and report "no active run".
 */
const findResumableRun = async (
	userId: string
): Promise<SessionRunRecord | null> => {
	const active = await findActiveSessionRun(userId);
	if (!active) return null;
	const snapshot = await fetchRunSnapshot(active.id);
	if (snapshot) return active;

	await abandonSessionRun(active.id, userId);
	return null;
};

/** Only a properly finished run has a summary screen worth surfacing. */
const isFinishedRun = (run: SessionRunRecord): boolean =>
	run.completion_reason === "victory" || run.completion_reason === "dead";

export const getTodaysRunService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView | null>> =>
	handleApiOperation(async () => {
		const active = await findResumableRun(userId);
		if (active) return continueActiveRun(active, date);

		// No run in progress — surface today's latest won/dead run (its summary
		// screen). Abandoned or corrupt runs fall through to the start screen.
		const startedToday = await findSessionRunByDate(userId, date);
		if (!startedToday || !isFinishedRun(startedToday)) return null;
		return viewOfRun(startedToday);
	});

export const startRunService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const active = await findResumableRun(userId);
		if (active) return continueActiveRun(active, date);

		const answeredToday = await fetchAnsweredPollIdsForDay(userId, date);
		const polls = (await fetchRunPollsForDate(date)).filter(
			(poll) => !answeredToday.has(Number(poll.id))
		);
		if (polls.length === 0) {
			throw new Error("No polls left for a run today");
		}

		// A planted git tag rescues this run (ADR-036): it starts at the pinned
		// gate and the tag burns on use — consuming before creating means a
		// crash between the two costs the tag, never duplicates it.
		const [pinnedGate, unlockedConfigIds] = await Promise.all([
			consumePinnedGate(userId),
			fetchUnlockedConfigIds(userId),
		]);
		// Per player and per day: the poll sequence is the thing everyone shares
		// (ADR-009), while the hand is what you personally opened with. The draw
		// is stored in the run, so the seed only has to be stable long enough to
		// deal once — it is the persisted hand a reload comes back to.
		// The pool is the account's own unlocked set (DVTD-amtz), falling back to
		// the starter set for an empty ledger. The budget shapes the deal rather
		// than only pricing it: a card the opening slots cannot hold is not a
		// choice (ADR-062).
		const state = createRun(
			polls,
			startingHand(poolFor(unlockedConfigIds), `${userId}:${date}`, BASE_SLOTS),
			pinnedGate,
			drawAuditSchedule(date)
		);
		await createSessionRunWithState(userId, date, state);
		return toRunView(state);
	});

/**
 * A finished run by permalink. The live run needs no id — the session resolves
 * it — but the archive holds many, so these are the one run URLs that carry
 * one. The id arrives from the URL, so ownership is checked here and a run
 * belonging to someone else is refused without saying it exists.
 */
export const getRunRecapService = async ({
	userId,
	runId,
}: {
	userId: string;
	runId: number;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const run = await findSessionRunById(runId);
		if (!run || run.user_id !== userId) throw new Error("Run not found");

		return viewOfRun(run);
	});

export const abandonRunService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<{ abandoned: true }>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		await abandonSessionRun(run.id, userId);
		return { abandoned: true as const };
	});

export const dispatchRunActionService = async ({
	userId,
	date,
	action,
}: {
	userId: string;
	date: string;
	action: RunAction;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		const { state: next, unlockedConfigIds } = await applyActionToRun({
			runId: run.id,
			userId,
			today: date,
			action,
		});
		// Read after the dispatch: the action that ends a run banks its storage in
		// the same transaction, so the archive is already the "after" figure the
		// run-over screen prints.
		const [unlockedThisRun, archiveAfterKb] = await Promise.all([
			unlocksDuring(run),
			fetchArchivedStorageKb(userId),
		]);
		return {
			...toRunView(next, unlockedConfigIds, unlockedThisRun),
			archiveAfterKb,
		};
	});

/** The viewer's permanent swatch collection, earned by widening builds. */
export const getOwnedSwatchesService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<{ ownedSwatchIds: readonly string[] }>> =>
	handleApiOperation(async () => ({
		ownedSwatchIds: await fetchOwnedSwatchIds(userId),
	}));

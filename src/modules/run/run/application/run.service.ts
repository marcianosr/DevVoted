import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { createRun } from "~/modules/run/run/domain/run.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import { poolFor, startingHand } from "~/modules/run/config/domain/hand.model";
import {
	type RunView,
	toRunView,
} from "~/modules/run/run/application/runView.viewmodel";
import {
	abandonSessionRun,
	applyActionToRun,
	type RunSettlement,
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
import { fetchCategoryLeader } from "~/modules/run/run/infrastructure/categoryLeader.repository";
import { fetchPollStats } from "~/modules/run/run/infrastructure/pollStats.repository";
import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import { endIncidentsForRun } from "~/modules/run/incident/infrastructure/incident.repository";
import { fetchRunPollsForDate } from "~/modules/run/run/infrastructure/runPolls.repository";
import {
	fetchUnlockedConfigIds,
	fetchUnlocksSince,
} from "~/modules/run/config/infrastructure/configUnlock.repository";
import { fetchUnlockedServiceIds } from "~/modules/run/shop/infrastructure/serviceUnlock.repository";

// A run's unlock history is the grants stamped since it started — derived from
// user_config_unlocks rather than stored on the run (ADR-064: the reducer
// stays pure, and only one session run is ever active at a time).
const unlocksDuring = (run: SessionRunRecord) =>
	fetchUnlocksSince(run.user_id, run.started_at ?? new Date(0));

/**
 * The poll on screen states how the room did on it and what this account did
 * last time (ADR-093), plus who leads its category (ADR-103). Attached
 * here rather than in `toRunView` because these are the parts of the view that
 * are read rather than derived — and because leaving them off is how a config
 * or an audit withholds them.
 */
const withPollReads = async (
	view: RunView,
	userId: string
): Promise<RunView> => {
	if (!view.poll) return view;

	const [stats, categorySeat] = await Promise.all([
		fetchPollStats(Number(view.poll.id), userId),
		fetchCategoryLeader(view.poll.category, userId),
	]);

	return { ...view, poll: { ...view.poll, stats, categorySeat } };
};

const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const [state, unlockedThisRun, archiveAfterKb, unlockedServiceIds] =
		await Promise.all([
			loadRunState(run.id),
			unlocksDuring(run),
			fetchArchivedStorageKb(run.user_id),
			fetchUnlockedServiceIds(run.user_id),
		]);
	return withPollReads(
		{
			...toRunView(state, [], unlockedThisRun, [], unlockedServiceIds),
			archiveAfterKb,
		},
		run.user_id
	);
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
	await endIncidentsForRun(active.id);
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
	}, "getTodaysRun");

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
			pinnedGate
		);
		await createSessionRunWithState(userId, date, state);
		return withPollReads(toRunView(state), userId);
	}, "startRun");

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
	}, "getRunRecap");

export const abandonRunService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<{ abandoned: true }>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		await abandonSessionRun(run.id, userId);
		await endIncidentsForRun(run.id);
		return { abandoned: true as const };
	}, "abandonRun");

/**
 * `settle` defaults to locking rivals' incidents; a caller that has more to
 * settle in the same transaction (firing one, ADR-099) composes its own.
 */
export const dispatchRunActionService = async ({
	userId,
	date,
	action,
	settle,
}: {
	userId: string;
	date: string;
	action: RunAction;
	settle?: (runId: number) => RunSettlement;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const run = await findActiveSessionRun(userId);
		if (!run) throw new Error("No active run");

		const {
			state: next,
			unlockedConfigIds,
			earnedTitleIds,
		} = await applyActionToRun({
			runId: run.id,
			userId,
			today: date,
			action,
			settle: (settle ?? settleIncidents)(run.id),
		});
		// Read after the dispatch: the action that ends a run banks its storage in
		// the same transaction, so the archive is already the "after" figure the
		// run-over screen prints.
		const [unlockedThisRun, archiveAfterKb, unlockedServiceIds] =
			await Promise.all([
				unlocksDuring(run),
				fetchArchivedStorageKb(userId),
				fetchUnlockedServiceIds(userId),
			]);
		return withPollReads(
			{
				...toRunView(
					next,
					unlockedConfigIds,
					unlockedThisRun,
					earnedTitleIds,
					unlockedServiceIds
				),
				archiveAfterKb,
			},
			userId
		);
	}, "dispatchRunAction");

/** The viewer's permanent swatch collection, earned by widening builds. */
export const getOwnedSwatchesService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<{ ownedSwatchIds: readonly string[] }>> =>
	handleApiOperation(
		async () => ({
			ownedSwatchIds: await fetchOwnedSwatchIds(userId),
		}),
		"getOwnedSwatches"
	);

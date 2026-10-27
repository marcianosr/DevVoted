import { dayAfter } from "~/shared/lib/dateUtils";
import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { gateAuditsFor } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	createRun,
	isRunOver,
	liveConfigsOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { prefetcherFor } from "~/modules/run/build/domain/build.model";
import { BASE_SLOTS } from "~/modules/run/run/domain/rules.model";
import { SEED_LENGTH } from "~/modules/run/run/domain/seed.model";
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
	countSessionRuns,
	fetchOwnedSwatchIds,
	findTodaysSessionRun,
	type SessionRunRecord,
} from "~/modules/run/run/infrastructure/run.repository";
import { fetchCategoryLeader } from "~/modules/run/run/infrastructure/categoryLeader.repository";
import { fetchPollStats } from "~/modules/run/run/infrastructure/pollStats.repository";
import { settleIncidents } from "~/modules/run/incident/application/incidentSettlement.service";
import { endIncidentsForRun } from "~/modules/run/incident/infrastructure/incident.repository";
import {
	fetchDealForRun,
	fetchRunPollsForDate,
} from "~/modules/run/run/infrastructure/runPolls.repository";
import {
	fetchUnlockedConfigIds,
	fetchUnlocksSince,
} from "~/modules/run/config/infrastructure/configUnlock.repository";
import {
	fetchServiceUnlocksSince,
	fetchUnlockedServiceIds,
} from "~/modules/run/shop/infrastructure/serviceUnlock.repository";

const runStartOf = (run: SessionRunRecord): Date =>
	run.started_at ?? new Date(0);

const unlocksDuring = (run: SessionRunRecord) =>
	fetchUnlocksSince(run.user_id, runStartOf(run));

const accountReadsFor = async (run: SessionRunRecord) => {
	const [archiveAfterKb, ownedSwatchIds, unlockedServiceIdsThisRun] =
		await Promise.all([
			fetchArchivedStorageKb(run.user_id),
			fetchOwnedSwatchIds(run.user_id),
			fetchServiceUnlocksSince(run.user_id, runStartOf(run)),
		]);
	return { archiveAfterKb, ownedSwatchIds, unlockedServiceIdsThisRun };
};

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

const readsTomorrowsDeal = (state: RunState): boolean =>
	!isRunOver(state.status) && prefetcherFor(liveConfigsOf(state)) !== undefined;

const dealtTomorrowFor = async (
	runId: number,
	state: RunState,
	today: string
): Promise<readonly RunPoll[]> =>
	readsTomorrowsDeal(state) ? fetchDealForRun(runId, dayAfter(today)) : [];

const viewOfRun = async (
	run: SessionRunRecord,
	today?: string
): Promise<RunView> => {
	const [state, unlockedThisRun, accountReads, unlockedServiceIds] =
		await Promise.all([
			loadRunState(run.id),
			unlocksDuring(run),
			accountReadsFor(run),
			fetchUnlockedServiceIds(run.user_id),
		]);
	const dealtTomorrow =
		today === undefined ? [] : await dealtTomorrowFor(run.id, state, today);
	return withPollReads(
		{
			...toRunView(
				state,
				[],
				unlockedThisRun,
				[],
				unlockedServiceIds,
				dealtTomorrow
			),
			...accountReads,
		},
		run.user_id
	);
};

const continueActiveRun = async (
	run: SessionRunRecord,
	date: string
): Promise<RunView> => {
	await ensureTodaysSegment(run.id, date);
	return viewOfRun(run, date);
};

const findResumableRun = async (
	userId: string
): Promise<SessionRunRecord | null> => {
	const active = await findActiveSessionRun(userId);
	if (!active) return null;
	const snapshot = await fetchRunSnapshot(active.id);
	if (snapshot) return active;

	await abandonSessionRun(active.id);
	await endIncidentsForRun(active.id);
	return null;
};

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

		const startedToday = await findTodaysSessionRun(userId, date);
		if (!startedToday || !isFinishedRun(startedToday)) return null;
		return viewOfRun(startedToday);
	}, "getTodaysRun");

const pollsLeftForNewRun = async (userId: string, date: string) => {
	const [answeredToday, polls] = await Promise.all([
		fetchAnsweredPollIdsForDay(userId, date),
		fetchRunPollsForDate(date),
	]);
	return answeredToday.size > 0 ? [] : polls.slice(0, SEED_LENGTH);
};

export const getPollsLeftTodayService = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<number>> =>
	handleApiOperation(
		async () => (await pollsLeftForNewRun(userId, date)).length,
		"getPollsLeftToday"
	);

export const GUEST_HAS_ONE_RUN = "Sign in to start another run";

const hasHadARun = async (userId: string): Promise<boolean> =>
	(await countSessionRuns(userId)) > 0;

const openTodaysRun = async (
	userId: string,
	date: string,
	isGuest: boolean
): Promise<RunView> => {
	const active = await findResumableRun(userId);
	if (active) return continueActiveRun(active, date);
	if (isGuest && (await hasHadARun(userId))) {
		throw new Error(GUEST_HAS_ONE_RUN);
	}

	const polls = await pollsLeftForNewRun(userId, date);

	const [pinnedGate, unlockedConfigIds, archiveAfterKb, unlockedServiceIds] =
		await Promise.all([
			consumePinnedGate(userId),
			fetchUnlockedConfigIds(userId),
			fetchArchivedStorageKb(userId),
			fetchUnlockedServiceIds(userId),
		]);
	const state = createRun(
		polls,
		startingHand(poolFor(unlockedConfigIds), `${userId}:${date}`, BASE_SLOTS),
		pinnedGate,
		{ [pinnedGate]: gateAuditsFor(pinnedGate, date, []) }
	);
	await createSessionRunWithState(userId, date, state);
	return withPollReads(
		{
			...toRunView(state, [], [], [], unlockedServiceIds),
			archiveAfterKb,
		},
		userId
	);
};

export const startRunService = async ({
	userId,
	date,
	isGuest,
}: {
	userId: string;
	date: string;
	isGuest: boolean;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(() => openTodaysRun(userId, date, isGuest), "startRun");

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

		await abandonSessionRun(run.id);
		await endIncidentsForRun(run.id);
		return { abandoned: true as const };
	}, "abandonRun");

export const dispatchRunActionService = async ({
	userId,
	date,
	action,
	settle,
	isGuest,
}: {
	userId: string;
	date: string;
	action: RunAction;
	settle?: (runId: number) => RunSettlement;
	isGuest: boolean;
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
			settle: settle?.(run.id) ?? settleIncidents(run.id, date),
			isGuest,
		});
		const [unlockedThisRun, accountReads, unlockedServiceIds, dealtTomorrow] =
			await Promise.all([
				unlocksDuring(run),
				accountReadsFor(run),
				fetchUnlockedServiceIds(userId),
				dealtTomorrowFor(run.id, next, date),
			]);
		return withPollReads(
			{
				...toRunView(
					next,
					unlockedConfigIds,
					unlockedThisRun,
					earnedTitleIds,
					unlockedServiceIds,
					dealtTomorrow
				),
				...accountReads,
			},
			userId
		);
	}, "dispatchRunAction");

export const getRunNumberService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<number>> =>
	handleApiOperation(() => countSessionRuns(userId), "getRunNumber");

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

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

const unlocksDuring = (run: SessionRunRecord) =>
	fetchUnlocksSince(run.user_id, run.started_at ?? new Date(0));

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

		const [pinnedGate, unlockedConfigIds] = await Promise.all([
			consumePinnedGate(userId),
			fetchUnlockedConfigIds(userId),
		]);
		const state = createRun(
			polls,
			startingHand(poolFor(unlockedConfigIds), `${userId}:${date}`, BASE_SLOTS),
			pinnedGate
		);
		await createSessionRunWithState(userId, date, state);
		return withPollReads(toRunView(state), userId);
	}, "startRun");

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

import {
	type ApiResponse,
	handleApiOperation,
} from "~/shared/utils/errorHandling";

import { createRun } from "~/modules/run/run/domain/run.model";
import { drawAuditSchedule } from "~/modules/run/gate/domain/auditSchedule.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import {
	startingHand,
	STARTER_POOL,
} from "~/modules/run/config/domain/hand.model";
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
	fetchRunSnapshot,
	loadRunState,
	findActiveSessionRun,
	fetchOwnedSwatchIds,
	fetchStorageWatermark,
	findSessionRunByDate,
	type SessionRunRecord,
} from "~/modules/run/run/infrastructure/run.repository";
import { fetchRunPollsForDate } from "~/modules/run/run/infrastructure/runPolls.repository";

// The archive is not wired into the live run yet (only /proto-run spends it),
// so it stays at its default while the storage watermark rides in beside it.
const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const [state, peakStorageKb] = await Promise.all([
		loadRunState(run.id),
		fetchStorageWatermark(run.user_id),
	]);
	return toRunView(state, 0, peakStorageKb);
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
		const pinnedGate = await consumePinnedGate(userId);
		// Per player and per day: the poll sequence is the thing everyone shares
		// (ADR-009), while the hand is what you personally opened with. The draw
		// is stored in the run, so the seed only has to be stable long enough to
		// deal once — it is the persisted hand a reload comes back to.
		// STARTER_POOL becomes the account's own pool once configs unlock
		// (DVTD-2try).
		const state = createRun(
			polls,
			startingHand(STARTER_POOL, `${userId}:${date}`),
			pinnedGate,
			drawAuditSchedule(date)
		);
		await createSessionRunWithState(userId, date, state);
		return toRunView(state, 0, await fetchStorageWatermark(userId));
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

		const next = await applyActionToRun({
			runId: run.id,
			userId,
			today: date,
			action,
		});
		return toRunView(next, 0, await fetchStorageWatermark(userId));
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

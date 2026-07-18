import { type ApiResponse, handleApiOperation } from "~/utils/errorHandling";

import { createRun, type RunAction } from "../climb/run.model";
import { hydrateRunState } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import { type RunView, toRunView } from "../view/runView.viewmodel";
import {
	abandonSessionRun,
	applyActionToRun,
	createSessionRunWithState,
	ensureTodaysSegment,
	fetchAnsweredPollIdsForDay,
	fetchRunPollsForDate,
	fetchRunPollsForRun,
	fetchRunSnapshot,
	findActiveSessionRun,
	findSessionRunByDate,
	getOrCreateDailyRunSeed,
	type SessionRunRecord,
} from "./queries";

/**
 * The starting loadout, mirroring proto-run.tsx. Interim until config
 * unlocks land (DVTD-2try) — then this becomes a per-user query.
 */
const HANDED_CONFIGS = [
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.copilot,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
];
const FIXED_CONFIGS = [CONFIGS.unitTests];

const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const snapshot = await fetchRunSnapshot(run.id);
	if (!snapshot) throw new Error("Run state not found");
	const polls = await fetchRunPollsForRun(run.id);
	return toRunView(hydrateRunState(snapshot, polls));
};

/** The persistent run, rolled over to today's segment first (ADR-011). */
const continueActiveRun = async (
	run: SessionRunRecord,
	date: string
): Promise<RunView> => {
	await getOrCreateDailyRunSeed(date);
	await ensureTodaysSegment(run.id, date);
	return viewOfRun(run);
};

export const getTodaysRunHandler = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView | null>> =>
	handleApiOperation(async () => {
		const active = await findActiveSessionRun(userId);
		if (active) return continueActiveRun(active, date);

		// No run in progress — surface today's latest won/dead run (its summary
		// screen). An abandoned run falls through to the start screen instead.
		const startedToday = await findSessionRunByDate(userId, date);
		if (!startedToday || startedToday.completion_reason === "abandoned") {
			return null;
		}
		return viewOfRun(startedToday);
	});

/** With a run in progress (any day), starting resumes it; otherwise a fresh run starts — same-day restarts included (DVTD-li9i). */
export const startRunHandler = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const active = await findActiveSessionRun(userId);
		if (active) return continueActiveRun(active, date);

		await getOrCreateDailyRunSeed(date);
		const answeredToday = await fetchAnsweredPollIdsForDay(userId, date);
		const polls = (await fetchRunPollsForDate(date)).filter(
			(poll) => !answeredToday.has(Number(poll.id))
		);
		if (polls.length === 0) {
			throw new Error("No polls left for a run today");
		}

		const state = createRun(polls, HANDED_CONFIGS, FIXED_CONFIGS);
		await createSessionRunWithState(userId, date, state);
		return toRunView(state);
	});

export const abandonRunHandler = async ({
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

export const dispatchRunActionHandler = async ({
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

		// Materialize today's shared sequence before the dispatch transaction
		// rolls the run over to it.
		await getOrCreateDailyRunSeed(date);
		const next = await applyActionToRun({
			runId: run.id,
			userId,
			today: date,
			action,
		});
		return toRunView(next);
	});

import { type ApiResponse, handleApiOperation } from "~/utils/errorHandling";

import { createRun, type RunAction } from "~/modules/run/run/domain/run.model";
import { hydrateRunState } from "~/modules/run/run/domain/runSnapshot.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	type RunView,
	toRunView,
} from "~/modules/run/run/application/runView.viewmodel";
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
	fetchOwnedSwatchIds,
	findSessionRunByDate,
	getOrCreateDailyRunSeed,
	type SessionRunRecord,
} from "~/modules/run/run/infrastructure/run.repository";

/**
 * The starting loadout, mirroring proto-run.tsx. Interim until config
 * unlocks land (DVTD-2try) — then this becomes a per-user query.
 */
const HANDED_CONFIGS = [
	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.agentsMd,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
];

const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const snapshot = await fetchRunSnapshot(run.id);
	if (!snapshot) throw new Error("Run state not found");
	const polls = await fetchRunPollsForRun(run.id);
	return toRunView(hydrateRunState(snapshot, polls));
};

const continueActiveRun = async (
	run: SessionRunRecord,
	date: string
): Promise<RunView> => {
	await getOrCreateDailyRunSeed(date);
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

		await getOrCreateDailyRunSeed(date);
		const answeredToday = await fetchAnsweredPollIdsForDay(userId, date);
		const polls = (await fetchRunPollsForDate(date)).filter(
			(poll) => !answeredToday.has(Number(poll.id))
		);
		if (polls.length === 0) {
			throw new Error("No polls left for a run today");
		}

		const state = createRun(polls, HANDED_CONFIGS);
		await createSessionRunWithState(userId, date, state);
		return toRunView(state);
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

/** The viewer's permanent swatch collection, earned by widening pipelines. */
export const getOwnedSwatchesService = async ({
	userId,
}: {
	userId: string;
}): Promise<ApiResponse<{ ownedSwatchIds: readonly string[] }>> =>
	handleApiOperation(async () => ({
		ownedSwatchIds: await fetchOwnedSwatchIds(userId),
	}));

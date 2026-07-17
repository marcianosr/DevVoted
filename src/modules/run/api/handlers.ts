import { type ApiResponse, handleApiOperation } from "~/utils/errorHandling";

import { createRun, type RunAction } from "../climb/run.model";
import { hydrateRunState } from "../climb/runSnapshot.model";
import { CONFIGS } from "../configs/configRoster.model";
import { type RunView, toRunView } from "../view/runView.viewmodel";
import {
	applyActionToRun,
	createSessionRunWithState,
	fetchRunPollsForDate,
	fetchRunSnapshot,
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

const requireSeedDate = (run: SessionRunRecord): string => {
	if (!run.seed_date) {
		throw new Error("Session run is missing its seed date");
	}
	return run.seed_date;
};

const viewOfRun = async (run: SessionRunRecord): Promise<RunView> => {
	const snapshot = await fetchRunSnapshot(run.id);
	if (!snapshot) throw new Error("Run state not found");
	const polls = await fetchRunPollsForDate(requireSeedDate(run));
	return toRunView(hydrateRunState(snapshot, polls));
};

export const getTodaysRunHandler = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView | null>> =>
	handleApiOperation(async () => {
		const run = await findSessionRunByDate(userId, date);
		if (!run) return null;
		return viewOfRun(run);
	});

/** Idempotent: starting twice on the same day returns the existing climb. */
export const startRunHandler = async ({
	userId,
	date,
}: {
	userId: string;
	date: string;
}): Promise<ApiResponse<RunView>> =>
	handleApiOperation(async () => {
		const existing = await findSessionRunByDate(userId, date);
		if (existing) return viewOfRun(existing);

		await getOrCreateDailyRunSeed(date);
		const polls = await fetchRunPollsForDate(date);
		if (polls.length === 0) {
			throw new Error("No polls seeded for today's run");
		}

		const state = createRun(polls, HANDED_CONFIGS, FIXED_CONFIGS);
		await createSessionRunWithState(userId, date, state);
		return toRunView(state);
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
		const run = await findSessionRunByDate(userId, date);
		if (!run) throw new Error("No run started today");

		const next = await applyActionToRun({
			runId: run.id,
			userId,
			seedDate: requireSeedDate(run),
			action,
		});
		return toRunView(next);
	});

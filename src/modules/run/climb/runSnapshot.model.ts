import type { RunPoll, RunState } from "./run.model";

/**
 * The persisted shape of a run (run_states.state): everything the engine
 * needs EXCEPT the day's poll sequence. Polls are the shared daily seed
 * (ADR-009) — identical for every player and holding correctness — so they
 * are stored once in daily_run_polls and rehydrated on load, never duplicated
 * per run.
 */
export type RunSnapshot = Omit<RunState, "polls">;

export const toRunSnapshot = (state: RunState): RunSnapshot => {
	const { polls: _polls, ...snapshot } = state;
	return snapshot;
};

export const hydrateRunState = (
	snapshot: RunSnapshot,
	polls: readonly RunPoll[]
): RunState => ({
	...snapshot,
	polls,
});

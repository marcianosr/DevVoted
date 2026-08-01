import type { Config } from "../configs/config.model";
import { CONFIG_LIST } from "../configs/configRoster.model";
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

/**
 * Snapshots embed full Config objects at slot/draft time, so an in-flight run
 * carries the roster as it looked back then. The roster is authoritative on
 * load: swap each embedded config for its current version, keeping only the
 * player's earned level. Unknown ids (a config since removed) pass through
 * untouched rather than crashing the run.
 */
const refreshConfig = (config: Config): Config => {
	const current = CONFIG_LIST.find((candidate) => candidate.id === config.id);
	if (!current) return config;
	if (config.level === undefined) return current;
	return { ...current, level: config.level };
};

const refreshConfigs = (configs: readonly Config[]): readonly Config[] =>
	configs.map(refreshConfig);

export const hydrateRunState = (
	snapshot: RunSnapshot,
	polls: readonly RunPoll[]
): RunState => ({
	...snapshot,
	pipeline: {
		...snapshot.pipeline,
		configs: refreshConfigs(snapshot.pipeline.configs),
	},
	available: refreshConfigs(snapshot.available),
	draftOptions: refreshConfigs(snapshot.draftOptions),
	polls,
});

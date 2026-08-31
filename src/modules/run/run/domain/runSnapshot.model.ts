import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import {
	type RunState,
	pickBudgetFor,
	windowStartIndex,
} from "~/modules/run/run/domain/run.model";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	liveAuditsFor,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";

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

/**
 * The polls are authoritative on load in the same way the roster is: a day
 * rollover (ADR-011) drops the window's unplayed tail and appends today's
 * segment, so a pick budget stored when the window opened would describe polls
 * that no longer exist. Recomputing it here covers every load path, and the
 * reducer keeps setting it at open so a window that fills inside one session
 * never needs a round trip to learn its own budget.
 */
export const hydrateRunState = (
	snapshot: RunSnapshot,
	polls: readonly RunPoll[]
): RunState => ({
	...snapshot,
	build: {
		...snapshot.build,
		configs: refreshConfigs(snapshot.build.configs),
	},
	available: refreshConfigs(snapshot.available),
	draftOptions: refreshConfigs(snapshot.draftOptions),
	window: {
		...snapshot.window,
		budget: pickBudgetFor(
			polls,
			windowStartIndex(snapshot),
			mirrorsPolls(liveAuditsFor(snapshot.build.configs, snapshot.gatesCleared))
		),
	},
	polls,
});

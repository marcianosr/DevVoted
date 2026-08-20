import type { Config } from "~/modules/run/config/domain/config.model";

/** A clear's decay outcome: the pipeline after it, and the configs that faded
 * to ×1 and deleted themselves. */
export type Decay = {
	readonly configs: readonly Config[];
	readonly deleted: readonly Config[];
};

const isDecaying = (config: Config): boolean =>
	config.coverageDecayPerClear !== undefined &&
	config.coverageMultiplier !== undefined;

const fade = (config: Config): Config =>
	isDecaying(config)
		? {
				...config,
				coverageMultiplier:
					(config.coverageMultiplier ?? 1) -
					(config.coverageDecayPerClear ?? 0),
			}
		: config;

const isSpent = (config: Config): boolean =>
	isDecaying(config) && (config.coverageMultiplier ?? 1) <= 1;

/**
 * Deprecated's clear-time tick: every decaying config fades one step, and a
 * config that lands on ×1 is deleted — a ×1 multiplier is a dead slot, so the
 * player never holds one. Ticks only on clears, never on a failed gate: a
 * redo already costs a peel, and draining the fuse on top would charge the
 * same gate twice. Returns the input untouched when nothing decays, so the
 * reducer can keep the pipeline's identity.
 */
export const decayOnClear = (configs: readonly Config[]): Decay => {
	if (!configs.some(isDecaying)) return { configs, deleted: [] };
	const faded = configs.map(fade);
	return {
		configs: faded.filter((config) => !isSpent(config)),
		deleted: faded.filter(isSpent),
	};
};

import type { Config } from "~/modules/run/config/domain/config.model";

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

export const decayOnClear = (configs: readonly Config[]): Decay => {
	if (!configs.some(isDecaying)) return { configs, deleted: [] };
	const faded = configs.map(fade);
	return {
		configs: faded.filter((config) => !isSpent(config)),
		deleted: faded.filter(isSpent),
	};
};

import type { CategoryCode } from "~/domains/shared/categories";

import { Config } from "../configs/config.model";
import { Coverage, effectOf } from "../configs/effect.model";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 8;

export const isFixed = (config: Config): boolean => config.fixed === true;

export const freeConfigs = (pipeline: Pipeline): readonly Config[] =>
	pipeline.configs.filter((config) => !isFixed(config));

export const isBare = (pipeline: Pipeline): boolean =>
	freeConfigs(pipeline).length === 0;

const effects = (pipeline: Pipeline) => pipeline.configs.map(effectOf);

export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	const raised = effects(pipeline).reduce(
		(total, effect) => total + (effect.requirementDelta ?? 0),
		0
	);
	return Math.max(1, base + raised);
};

export const rewardMultiplierFor = (pipeline: Pipeline): number =>
	effects(pipeline).reduce(
		(product, effect) => product * (effect.rewardMultiplier ?? 1),
		1
	);

export const coverageForAnswer = (
	configs: readonly Config[],
	category: CategoryCode,
	correct: boolean
): number => {
	if (!correct) return 0;
	const covers = configs
		.map((config) => effectOf(config).coverage?.(category))
		.filter((cover): cover is Coverage => cover !== undefined);
	const mult = covers.reduce((product, cover) => product * cover.mult, 1);
	const add = covers.reduce((sum, cover) => sum + cover.add, 0);
	return Math.round((mult + add) * 10) / 10;
};

/** Whether the manual lint action is available — any equipped config that masks wrong options. */
/** The equipped linter that covers this poll's category, if any (ESLint → JS/TS, Stylelint → CSS). */
export const linterFor = (
	configs: readonly Config[],
	category: CategoryCode
): Config | undefined =>
	configs.find((config) => effectOf(config).maskWrongOn?.(category) === true);

/** A linter can be run only on a poll in a category it covers. */
export const canLint = (
	configs: readonly Config[],
	category: CategoryCode
): boolean => linterFor(configs, category) !== undefined;

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

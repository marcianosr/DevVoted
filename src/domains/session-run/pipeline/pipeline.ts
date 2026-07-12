import type { CategoryCode } from "~/domains/shared/categories";

import { Config, focusCoverageMultiplier } from "../configs/config";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 20;

export const isBare = (pipeline: Pipeline): boolean =>
	pipeline.configs.length === 0;

const sumDelta = (
	configs: readonly Config[],
	keep: (delta: number) => boolean
): number =>
	configs
		.filter((config) => keep(config.requirementDelta))
		.reduce((total, config) => total + config.requirementDelta, 0);

export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	const raises = pipeline.configs.some((config) => config.immuneToRaise)
		? 0
		: sumDelta(pipeline.configs, (delta) => delta > 0);
	const lowers = sumDelta(pipeline.configs, (delta) => delta < 0);
	return Math.max(1, base + raises + lowers);
};

export const rewardMultiplierFor = (pipeline: Pipeline): number =>
	pipeline.configs.reduce(
		(product, config) => product * config.rewardMultiplier,
		1
	);

export const coverageForAnswer = (
	configs: readonly Config[],
	category: CategoryCode,
	correct: boolean
): number => {
	if (!correct) return 0;
	const focus = configs.find((config) => config.focusCategory === category);
	const focusMultiplier = focus ? focusCoverageMultiplier(focus.level ?? 1) : 1;
	const amplify = configs.reduce(
		(product, config) => product * (config.coverageMultiplier ?? 1),
		1
	);
	const added = configs.reduce(
		(sum, config) => sum + (config.coverageAdd ?? 0),
		0
	);
	return Math.round((focusMultiplier * amplify + added) * 10) / 10;
};

export const hasLinter = (configs: readonly Config[]): boolean =>
	configs.some((config) => config.eliminatesWrongOptionsFor);

export const disabledOptionIds = (
	configs: readonly Config[],
	category: CategoryCode,
	options: readonly { id: string; correct: boolean }[]
): ReadonlySet<string> => {
	const eliminations = configs.filter((config) =>
		config.eliminatesWrongOptionsFor?.includes(category)
	).length;
	if (eliminations === 0) return new Set();
	const wrongIds = options
		.filter((option) => !option.correct)
		.map((option) => option.id);
	return new Set(
		wrongIds.slice(0, Math.min(eliminations, Math.max(0, wrongIds.length - 1)))
	);
};

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

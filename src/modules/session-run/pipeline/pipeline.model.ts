import type { CategoryCode } from "~/domains/shared/categories";

import { Config } from "../configs/config.model";
import { Coverage, effectOf } from "../configs/effect.model";

export type Pipeline = {
	readonly id: string;
	readonly slots: number;
	readonly configs: readonly Config[];
};

export const BASE_SLOTS = 3;
export const MAX_SLOTS = 5;

export const isBare = (pipeline: Pipeline): boolean =>
	pipeline.configs.length === 0;

const effects = (pipeline: Pipeline) => pipeline.configs.map(effectOf);

export const effectiveRequirement = (
	pipeline: Pipeline,
	base: number
): number => {
	if (effects(pipeline).some((effect) => effect.locksBar))
		return Math.max(1, base);
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
export const canLint = (configs: readonly Config[]): boolean =>
	configs.some((config) => effectOf(config).maskWrongOn !== undefined);

/** Wrong-option ids masked by config effects, always leaving ≥1 wrong so the poll stays a real choice. */
export const disabledOptionIds = (
	configs: readonly Config[],
	category: CategoryCode,
	options: readonly { id: string; correct: boolean }[]
): ReadonlySet<string> => {
	const masks = configs.filter((config) =>
		effectOf(config).maskWrongOn?.(category)
	).length;
	if (masks === 0) return new Set();
	const wrongIds = options
		.filter((option) => !option.correct)
		.map((option) => option.id);
	return new Set(
		wrongIds.slice(0, Math.min(masks, Math.max(0, wrongIds.length - 1)))
	);
};

export const stripConfig = (
	pipeline: Pipeline,
	configId: string
): Pipeline => ({
	...pipeline,
	configs: pipeline.configs.filter((config) => config.id !== configId),
});

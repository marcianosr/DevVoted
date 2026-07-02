import type { Config } from "~/domains/economy/models/config.model";
import type { CategoryCode } from "~/domains/shared/categories";

/**
 * Whether an installed config can act on a poll of the given category. Configs
 * without `targetCategories` (or with an empty list) target every category —
 * e.g. `.includes`, which works on any multiple-choice poll — so they always
 * apply. Configs that name categories only apply to those.
 */
export const configAppliesToPollCategory = (
	config: Config,
	categoryCode: CategoryCode
): boolean =>
	!config.targetCategories ||
	config.targetCategories.length === 0 ||
	config.targetCategories.includes(categoryCode);

/**
 * The installed configs that can act on a poll of the given category.
 */
export const getConfigsApplyingToPollCategory = (
	configs: Config[],
	categoryCode: CategoryCode
): Config[] =>
	configs.filter((config) => configAppliesToPollCategory(config, categoryCode));

const DISABLE_WRONG_OPTIONS_EFFECT = "disableWrongOptions";

/**
 * The config responsible for removing a wrong answer on this poll (ESLint on
 * JS/TS polls, Stylelint on HTML/CSS), or undefined when none is installed.
 * Used to label the removed option with the config that caused it.
 */
export const findWrongOptionConfig = (configs: Config[]): Config | undefined =>
	configs.find((config) =>
		config.effect.includes(DISABLE_WRONG_OPTIONS_EFFECT)
	);

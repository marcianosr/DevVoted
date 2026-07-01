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

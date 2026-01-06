import { configs } from "~/domains/configs/data/configs";
import { CATEGORY_CODES, CategoryCode } from "~/domains/shared/categories";

export type CategoryWeights = Record<CategoryCode, number>;

const DEFAULT_CATEGORY_WEIGHTS: CategoryWeights = {
	css: 1.0,
	js: 1.0,
	react: 1.0,
	ts: 1.0,
	html: 1.0,
	git: 1.0,
	"general-frontend": 1.0,
	java: 1.0,
	python: 1.0,
};

/**
 * Calculate category weights based on active configs.
 * Each config with categoryWeightBonus adds to its target categories.
 * Higher weight = higher probability of that category's polls being selected.
 */
export const calculateCategoryWeights = (
	activeConfigIds: string[]
): CategoryWeights => {
	const weights = { ...DEFAULT_CATEGORY_WEIGHTS };
	// Apply bonuses from active configs
	for (const configId of activeConfigIds) {
		const config = configs.find((c) => c.id === configId);
		if (!config?.categoryWeightBonus) continue;

		// Empty targetCategories means all categories
		const targets = config.targetCategories?.length
			? config.targetCategories
			: [...CATEGORY_CODES];

		for (const category of targets) {
			weights[category] += config.categoryWeightBonus;
		}
	}

	return weights;
};

import { configs } from "~/domains/economy/data/configs";
import { CATEGORY_CODES, CategoryCode } from "~/domains/shared/categories";

export type CategoryWeights = Record<CategoryCode, number>;

// TODO: enable categories again whenever we have polls for them
export const DEFAULT_CATEGORY_WEIGHTS: CategoryWeights = {
	css: 1,
	js: 1,
	react: 1,
	ts: 1,
	html: 1,
	git: 1,
	"general-frontend": 1,
	java: 1,
	python: 0,
	ruby: 1,
	"general-backend": 0,
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

	const hasLoadBalancer = activeConfigIds.includes("load-balancer-config");
	if (hasLoadBalancer) {
		// Return equal weights, ignoring all other bonuses
		return { ...DEFAULT_CATEGORY_WEIGHTS };
	}
	// Apply bonuses from active configs
	for (const configId of activeConfigIds) {
		const config = configs.find((c) => c.id === configId);
		if (!config?.categoryWeightBonus) continue;

		// Empty targetCategories means all categories
		const targets = config.targetCategories?.length
			? config.targetCategories
			: [...CATEGORY_CODES];

		for (const category of targets) {
			weights[category] = Math.max(
				0.1,
				weights[category] + config.categoryWeightBonus
			);
		}
	}

	return weights;
};

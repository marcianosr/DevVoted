import { describe, it, expect, vi, beforeEach } from "vitest";

import { CATEGORY_CODES } from "~/domains/shared/categories";

import { calculateCategoryWeights } from "./categoryWeight.service";

// Mock the configs module
vi.mock("~/domains/configs/data/configs", () => ({
	configs: [
		{
			id: ".html-config",
			targetCategories: ["html"],
			categoryWeightBonus: 0.25,
		},
		{
			id: ".css-config",
			targetCategories: ["css"],
			categoryWeightBonus: 0.25,
		},
		{
			id: ".js-config",
			targetCategories: ["js"],
			categoryWeightBonus: 0.5,
		},
		{
			id: "copilot-config",
			targetCategories: [], // Empty = all categories
			categoryWeightBonus: 0.1,
		},
		{
			id: "no-bonus-config",
			targetCategories: ["html"],
			// No categoryWeightBonus - should be skipped
		},
		{
			id: "load-balancer-config",
			targetCategories: [],
			categoryWeightBonus: 1.0,
		},
	],
}));

describe("categoryWeight.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("calculateCategoryWeights", () => {
		it("returns base weight (1.0) for all categories when no configs active", () => {
			const weights = calculateCategoryWeights([]);

			for (const code of CATEGORY_CODES) {
				expect(weights[code]).toBe(1.0);
			}
		});

		it("adds weight bonus for targeted category", () => {
			const weights = calculateCategoryWeights([".html-config"]);

			expect(weights.html).toBe(1.25); // 1.0 + 0.25
			expect(weights.css).toBe(1.0); // unchanged
			expect(weights.js).toBe(1.0); // unchanged
		});

		it("stacks multiple config bonuses for different categories", () => {
			const weights = calculateCategoryWeights([".html-config", ".js-config"]);

			expect(weights.html).toBe(1.25); // 1.0 + 0.25
			expect(weights.js).toBe(1.5); // 1.0 + 0.5
			expect(weights.css).toBe(1.0); // unchanged
		});

		it("applies bonus to all categories when targetCategories is empty", () => {
			const weights = calculateCategoryWeights(["copilot-config"]);

			// All categories should get +0.1 bonus
			for (const code of CATEGORY_CODES) {
				expect(weights[code]).toBe(1.1);
			}
		});

		it("stacks bonuses from multiple configs targeting same category", () => {
			// Both .html-config and copilot-config affect html
			const weights = calculateCategoryWeights([
				".html-config",
				"copilot-config",
			]);

			expect(weights.html).toBe(1.35); // 1.0 + 0.25 + 0.1
			expect(weights.css).toBe(1.1); // 1.0 + 0.1 (copilot only)
		});

		it("skips configs without categoryWeightBonus", () => {
			const weights = calculateCategoryWeights(["no-bonus-config"]);

			// Should remain at base weight
			expect(weights.html).toBe(1.0);
		});

		it("skips config IDs that do not exist", () => {
			const weights = calculateCategoryWeights(["nonexistent-config"]);

			for (const code of CATEGORY_CODES) {
				expect(weights[code]).toBe(1.0);
			}
		});

		it("handles mix of valid and invalid config IDs", () => {
			const weights = calculateCategoryWeights([
				".html-config",
				"nonexistent-config",
				".css-config",
			]);

			expect(weights.html).toBe(1.25);
			expect(weights.css).toBe(1.25);
			expect(weights.js).toBe(1.0);
		});

		describe("load-balancer-config", () => {
			it("normalizes all weights to 1.0 when active", () => {
				const weights = calculateCategoryWeights(["load-balancer-config"]);

				for (const code of CATEGORY_CODES) {
					expect(weights[code]).toBe(1.0);
				}
			});

			it("overrides other weight modifiers when active", () => {
				// Even with .js-config (+0.5) and .html-config (+0.25), load-balancer resets all to 1.0
				const weights = calculateCategoryWeights([
					".js-config",
					".html-config",
					"load-balancer-config",
				]);

				expect(weights.js).toBe(1.0); // Would be 1.5 without load-balancer
				expect(weights.html).toBe(1.0); // Would be 1.25 without load-balancer
				expect(weights.css).toBe(1.0);
			});

			it("overrides copilot-config global bonus", () => {
				// copilot-config adds +0.1 to all, but load-balancer overrides
				const weights = calculateCategoryWeights([
					"copilot-config",
					"load-balancer-config",
				]);

				for (const code of CATEGORY_CODES) {
					expect(weights[code]).toBe(1.0); // Would be 1.1 without load-balancer
				}
			});

			it("works regardless of config order in array", () => {
				// Load balancer first
				const weights1 = calculateCategoryWeights([
					"load-balancer-config",
					".js-config",
				]);

				// Load balancer last
				const weights2 = calculateCategoryWeights([
					".js-config",
					"load-balancer-config",
				]);

				expect(weights1.js).toBe(1.0);
				expect(weights2.js).toBe(1.0);
			});
		});
	});
});

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
	});
});

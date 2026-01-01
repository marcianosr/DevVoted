import { describe, it, expect } from "vitest";

import {
	selectSeededRandom,
	createSeededRandom,
	selectWeightedSeededRandom,
	selectMultipleWeightedSeededRandom,
} from "./seededRandom";

describe("seededRandom", () => {
	describe("selectSeededRandom", () => {
		it("returns same result for same seed", () => {
			const items = ["item1", "item2", "item3", "item4", "item5"];
			const seed = "2024-01-15";

			const result1 = selectSeededRandom(items, seed);
			const result2 = selectSeededRandom(items, seed);

			expect(result1).toBe(result2);
		});

		it("maintains deterministic behavior across different seeds", () => {
			const items = ["item1", "item2", "item3", "item4", "item5"];

			// Test that each seed produces a consistent result
			const seedResults = new Map();
			const seeds = ["2024-01-15", "2024-01-16", "monday", "tuesday", "seed-a"];

			// First pass - record results
			for (const seed of seeds) {
				const result = selectSeededRandom(items, seed);
				seedResults.set(seed, result);
				expect(items).toContain(result);
			}

			// Second pass - verify consistency
			for (const seed of seeds) {
				const result = selectSeededRandom(items, seed);
				expect(result).toBe(seedResults.get(seed));
			}
		});

		it("returns null for empty array", () => {
			const result = selectSeededRandom([], "2024-01-15");
			expect(result).toBeNull();
		});

		it("returns the only item for single-item array", () => {
			const items = ["only-item"];
			const result = selectSeededRandom(items, "2024-01-15");
			expect(result).toBe("only-item");
		});

		it("always returns valid array item", () => {
			const items = ["a", "b", "c"];
			const seed = "test-seed";

			const result = selectSeededRandom(items, seed);
			expect(items).toContain(result);
		});
	});

	describe("createSeededRandom", () => {
		it("generates consistent sequence with same seed", () => {
			const rng1 = createSeededRandom("test-seed");
			const rng2 = createSeededRandom("test-seed");

			// Generate multiple values to test sequence consistency
			const sequence1 = [rng1.next(), rng1.next(), rng1.next()];

			const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

			expect(sequence1).toEqual(sequence2);
		});

		it("generates different sequences with different seeds", () => {
			const rng1 = createSeededRandom("seed1");
			const rng2 = createSeededRandom("seed2");

			const sequence1 = [rng1.next(), rng1.next(), rng1.next()];

			const sequence2 = [rng2.next(), rng2.next(), rng2.next()];

			expect(sequence1).not.toEqual(sequence2);
		});

		it("generates numbers between 0 and 1", () => {
			const rng = createSeededRandom("test");

			for (let i = 0; i < 100; i++) {
				const value = rng.next();
				expect(value).toBeGreaterThanOrEqual(0);
				expect(value).toBeLessThan(1);
			}
		});

		it("nextInt generates numbers in correct range", () => {
			const rng = createSeededRandom("test");

			for (let i = 0; i < 100; i++) {
				const value = rng.nextInt(5, 10);
				expect(value).toBeGreaterThanOrEqual(5);
				expect(value).toBeLessThan(10);
				expect(Number.isInteger(value)).toBe(true);
			}
		});
	});

	describe("daily poll use case", () => {
		it("simulates consistent daily poll selection", () => {
			const polls = [
				{ id: 1, question: "Poll 1" },
				{ id: 2, question: "Poll 2" },
				{ id: 3, question: "Poll 3" },
				{ id: 4, question: "Poll 4" },
				{ id: 5, question: "Poll 5" },
			];

			// Simulate same day for multiple users
			const today = "2024-01-15";

			const user1Selection = selectSeededRandom(polls, today);
			const user2Selection = selectSeededRandom(polls, today);
			const user3Selection = selectSeededRandom(polls, today);

			// All users should see the same poll on the same day
			expect(user1Selection).toBe(user2Selection);
			expect(user2Selection).toBe(user3Selection);

			// Test that different days can produce different results
			// (This is probabilistic, so we test the selection works correctly)
			const tomorrow = "2024-01-16";
			const tomorrowSelection = selectSeededRandom(polls, tomorrow);

			// The selection should always be valid
			expect(polls).toContain(tomorrowSelection);

			// Test determinism for tomorrow as well
			const anotherTomorrowSelection = selectSeededRandom(polls, tomorrow);
			expect(tomorrowSelection).toBe(anotherTomorrowSelection);
		});
	});

	describe("selectWeightedSeededRandom", () => {
		it("returns same result for same seed", () => {
			const items = [
				{ item: "pikachu", weight: 1 },
				{ item: "charizard", weight: 2 },
			];

			const result1 = selectWeightedSeededRandom(items, "christmas-2024");
			const result2 = selectWeightedSeededRandom(items, "christmas-2024");

			expect(result1).toBe(result2);
		});

		it("returns null for empty array", () => {
			const result = selectWeightedSeededRandom([], "banjo-kazooie");
			expect(result).toBeNull();
		});

		it("respects weights - higher weight selected more often", () => {
			const items = [
				{ item: "rareware-gem", weight: 1 },
				{ item: "common-jiggy", weight: 99 },
			];

			const counts = { "rareware-gem": 0, "common-jiggy": 0 };
			for (let i = 0; i < 1000; i++) {
				const result = selectWeightedSeededRandom(items, `seed-${i}`);
				counts[result as "rareware-gem" | "common-jiggy"]++;
			}

			// Common should be significantly more frequent (at least 10x)
			expect(counts["common-jiggy"]).toBeGreaterThan(
				counts["rareware-gem"] * 10
			);
		});

		it("handles single item array", () => {
			const result = selectWeightedSeededRandom(
				[{ item: "mumbo-jumbo", weight: 5 }],
				"13-05-birthday"
			);
			expect(result).toBe("mumbo-jumbo");
		});

		it("handles items with equal weights fairly", () => {
			const items = [
				{ item: "bottles", weight: 1 },
				{ item: "kazooie", weight: 1 },
				{ item: "banjo", weight: 1 },
			];

			const counts = { bottles: 0, kazooie: 0, banjo: 0 };
			for (let i = 0; i < 3000; i++) {
				const result = selectWeightedSeededRandom(items, `seed-${i}`);
				counts[result as keyof typeof counts]++;
			}

			// Each should be roughly 1/3 (allow 20% variance)
			const expectedCount = 1000;
			const variance = 200;
			expect(counts.bottles).toBeGreaterThan(expectedCount - variance);
			expect(counts.bottles).toBeLessThan(expectedCount + variance);
			expect(counts.kazooie).toBeGreaterThan(expectedCount - variance);
			expect(counts.kazooie).toBeLessThan(expectedCount + variance);
			expect(counts.banjo).toBeGreaterThan(expectedCount - variance);
			expect(counts.banjo).toBeLessThan(expectedCount + variance);
		});
	});

	describe("selectMultipleWeightedSeededRandom", () => {
		it("returns correct count of items", () => {
			const items = [
				{ item: "goldeneye", weight: 1 },
				{ item: "perfect-dark", weight: 1 },
				{ item: "jet-force-gemini", weight: 1 },
			];

			const result = selectMultipleWeightedSeededRandom(items, 2, "rareware");
			expect(result).toHaveLength(2);
		});

		it("does not return duplicates", () => {
			const items = [
				{ item: "donkey-kong", weight: 100 },
				{ item: "diddy-kong", weight: 1 },
				{ item: "dixie-kong", weight: 1 },
			];

			const result = selectMultipleWeightedSeededRandom(items, 3, "dk-country");
			const unique = new Set(result);

			expect(unique.size).toBe(result.length);
		});

		it("returns all items if count exceeds array length", () => {
			const items = [
				{ item: "gruntilda", weight: 1 },
				{ item: "klungo", weight: 1 },
			];

			const result = selectMultipleWeightedSeededRandom(
				items,
				5,
				"witches-lair"
			);
			expect(result).toHaveLength(2);
		});

		it("returns same results for same seed", () => {
			const items = [
				{ item: "jinjo", weight: 10 },
				{ item: "jiggy", weight: 20 },
				{ item: "honeycomb", weight: 30 },
				{ item: "music-note", weight: 40 },
			];

			const result1 = selectMultipleWeightedSeededRandom(
				items,
				3,
				"spiral-mountain"
			);
			const result2 = selectMultipleWeightedSeededRandom(
				items,
				3,
				"spiral-mountain"
			);

			expect(result1).toEqual(result2);
		});

		it("returns empty array for empty input", () => {
			const result = selectMultipleWeightedSeededRandom([], 3, "empty-seed");
			expect(result).toEqual([]);
		});

		it("respects weights when selecting multiple items", () => {
			// High weight item should almost always be picked first
			const items = [
				{ item: "legendary-copilot", weight: 1000 },
				{ item: "common-config", weight: 1 },
				{ item: "rare-config", weight: 1 },
			];

			// Run many times and check legendary is always first
			let legendaryFirstCount = 0;
			for (let i = 0; i < 100; i++) {
				const result = selectMultipleWeightedSeededRandom(items, 2, `run-${i}`);
				if (result[0] === "legendary-copilot") {
					legendaryFirstCount++;
				}
			}

			// Legendary should be first in almost all cases
			expect(legendaryFirstCount).toBeGreaterThan(95);
		});
	});
});

import { describe, it, expect } from "vitest";
import { selectSeededRandom, createSeededRandom } from "./seededRandom";

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
			const sequence1 = [
				rng1.next(),
				rng1.next(),
				rng1.next(),
			];

			const sequence2 = [
				rng2.next(),
				rng2.next(),
				rng2.next(),
			];

			expect(sequence1).toEqual(sequence2);
		});

		it("generates different sequences with different seeds", () => {
			const rng1 = createSeededRandom("seed1");
			const rng2 = createSeededRandom("seed2");

			const sequence1 = [
				rng1.next(),
				rng1.next(),
				rng1.next(),
			];

			const sequence2 = [
				rng2.next(),
				rng2.next(),
				rng2.next(),
			];

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
});
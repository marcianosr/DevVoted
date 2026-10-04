import { describe, expect, it } from "vitest";

import { TEST_DATES } from "~/test/kanto";

import {
	dealDay,
	isDayShortOfFreshPolls,
	rollDailyReserve,
	rollDailySeedSequence,
	SEED_LENGTH,
} from "~/modules/run/run/domain/seed.model";

const POOL = Array.from({ length: 200 }, (_, index) => index + 1);

describe("rollDailySeedSequence", () => {
	it("produces an identical sequence for the same date and pool", () => {
		expect(rollDailySeedSequence(TEST_DATES.birthday, POOL)).toEqual(
			rollDailySeedSequence(TEST_DATES.birthday, POOL)
		);
	});

	it("produces different sequences on different dates", () => {
		expect(rollDailySeedSequence(TEST_DATES.birthday, POOL)).not.toEqual(
			rollDailySeedSequence(TEST_DATES.christmas, POOL)
		);
	});

	it("caps the sequence at SEED_LENGTH", () => {
		expect(rollDailySeedSequence(TEST_DATES.birthday, POOL)).toHaveLength(
			SEED_LENGTH
		);
	});

	it("returns the whole pool when it is smaller than SEED_LENGTH", () => {
		const smallPool = [1, 2, 3];
		const sequence = rollDailySeedSequence(TEST_DATES.christmas, smallPool);
		expect([...sequence].sort((a, b) => a - b)).toEqual(smallPool);
	});

	it("never repeats a poll within the sequence", () => {
		const sequence = rollDailySeedSequence(TEST_DATES.christmasEve, POOL);
		expect(new Set(sequence).size).toBe(sequence.length);
	});

	it("leaves the input pool untouched", () => {
		const pool = [5, 6, 7, 8];
		rollDailySeedSequence(TEST_DATES.birthday, pool);
		expect(pool).toEqual([5, 6, 7, 8]);
	});
});

describe("rollDailyReserve", () => {
	it("opens on the day's seed, so the reserve only adds polls after it", () => {
		expect(
			rollDailyReserve(TEST_DATES.birthday, POOL).slice(0, SEED_LENGTH)
		).toEqual(rollDailySeedSequence(TEST_DATES.birthday, POOL));
	});

	it("orders the whole pool the same way for everyone on that date", () => {
		const reserve = rollDailyReserve(TEST_DATES.christmas, POOL);

		expect(reserve).toEqual(rollDailyReserve(TEST_DATES.christmas, POOL));
		expect([...reserve].sort((a, b) => a - b)).toEqual(POOL);
	});
});

describe("isDayShortOfFreshPolls", () => {
	it("reads a seed of five unanswered polls as a full day", () => {
		expect(isDayShortOfFreshPolls([1, 2, 3, 4, 5], new Set())).toBe(false);
	});

	it("reads a seed holding a poll the run already answered as short", () => {
		expect(isDayShortOfFreshPolls([1, 2, 3, 4, 5], new Set([1]))).toBe(true);
	});
});

describe("dealDay", () => {
	const SEED = [77, 85, 91, 30, 75];
	const RESERVE = [77, 85, 91, 30, 75, 12, 40, 63];

	it("deals the day's seed as it stands when the run has answered none of it", () => {
		expect(dealDay(SEED, RESERVE, new Set())).toEqual(SEED);
	});

	it("replaces a poll the run already answered with the next one in the reserve", () => {
		expect(dealDay(SEED, RESERVE, new Set([77]))).toEqual([85, 91, 30, 75, 12]);
	});

	it("skips reserve polls the run already answered too", () => {
		expect(dealDay(SEED, RESERVE, new Set([77, 12]))).toEqual([
			85, 91, 30, 75, 40,
		]);
	});

	it("keeps a seed longer than a day, so a seeded local day still fits a whole run", () => {
		const longSeed = Array.from({ length: 12 }, (_, index) => index + 1);

		expect(dealDay(longSeed, [], new Set([1]))).toEqual(longSeed.slice(1));
	});

	it("deals what is left when the pool runs out of fresh polls", () => {
		expect(dealDay(SEED, SEED, new Set([77, 85]))).toEqual([91, 30, 75]);
	});
});

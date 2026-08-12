import { describe, expect, it } from "vitest";

import { TEST_DATES } from "~/test/kanto";

import {
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

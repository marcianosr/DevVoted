import { describe, expect, it } from "vitest";

import {
	difficultyBandOf,
	firstAttemptRateOf,
	isSeenBefore,
	MIN_FIRST_ATTEMPTS,
	type PollStats,
} from "./pollStats.model";

const statsOf = (overrides: Partial<PollStats> = {}): PollStats => ({
	firstAttempts: 100,
	firstAttemptsRight: 50,
	attempts: 0,
	misses: 0,
	...overrides,
});

describe("firstAttemptRateOf", () => {
	it("rounds the share of first attempts that landed", () => {
		expect(
			firstAttemptRateOf(statsOf({ firstAttempts: 90, firstAttemptsRight: 28 }))
		).toBe(31);
	});

	it("reads zero rather than dividing by nobody", () => {
		expect(
			firstAttemptRateOf(statsOf({ firstAttempts: 0, firstAttemptsRight: 0 }))
		).toBe(0);
	});
});

describe("difficultyBandOf", () => {
	it("calls a poll untested until enough players have tried it", () => {
		const barelyTried = statsOf({
			firstAttempts: MIN_FIRST_ATTEMPTS - 1,
			firstAttemptsRight: 0,
		});
		expect(difficultyBandOf(barelyTried)).toBe("untested");
	});

	it("bands a poll the moment the floor of first attempts is reached", () => {
		const justEnough = statsOf({
			firstAttempts: MIN_FIRST_ATTEMPTS,
			firstAttemptsRight: 0,
		});
		expect(difficultyBandOf(justEnough)).toBe("brutal");
	});

	it("reads the mock's 31% as brutal", () => {
		expect(
			difficultyBandOf(statsOf({ firstAttempts: 90, firstAttemptsRight: 28 }))
		).toBe("brutal");
	});

	it.each([
		[34, "brutal"],
		[35, "hard"],
		[59, "hard"],
		[60, "fair"],
		[79, "fair"],
		[80, "easy"],
		[100, "easy"],
	])("bands %i%% as %s", (rate, band) => {
		expect(
			difficultyBandOf(
				statsOf({ firstAttempts: 100, firstAttemptsRight: rate })
			)
		).toBe(band);
	});
});

describe("isSeenBefore", () => {
	it("stays false for a poll this account has never answered", () => {
		expect(isSeenBefore(statsOf({ attempts: 0 }))).toBe(false);
	});

	it("turns true on the first answer, right or wrong", () => {
		expect(isSeenBefore(statsOf({ attempts: 1, misses: 0 }))).toBe(true);
	});
});

import { describe, expect, it } from "vitest";

import {
	REVEAL_WINDOW_MS,
	revealDelayMs,
} from "~/modules/run/poll/presentation/revealTiming";

describe(revealDelayMs, () => {
	it("fires the first option immediately", () => {
		expect(revealDelayMs(0, 4)).toBe(0);
	});

	it("lands the last option on the window's edge", () => {
		expect(revealDelayMs(3, 4)).toBe(REVEAL_WINDOW_MS);
	});

	it("spaces the four preview options on even beats", () => {
		expect([0, 1, 2, 3].map((index) => revealDelayMs(index, 4))).toEqual([
			0, 120, 240, 360,
		]);
	});

	it("keeps a single option at zero delay without dividing by zero", () => {
		expect(revealDelayMs(0, 1)).toBe(0);
	});

	it("caps the total reveal time regardless of option count", () => {
		expect(revealDelayMs(7, 8)).toBe(REVEAL_WINDOW_MS);
		expect(revealDelayMs(11, 12)).toBe(REVEAL_WINDOW_MS);
	});

	it("increases the delay monotonically from top to bottom", () => {
		const delays = [0, 1, 2, 3, 4, 5].map((index) => revealDelayMs(index, 6));
		const ascending = delays.every(
			(delay, index) => index === 0 || delay > delays[index - 1]
		);
		expect(ascending).toBe(true);
	});
});

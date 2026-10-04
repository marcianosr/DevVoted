import { describe, expect, it } from "vitest";

import { recordGains } from "~/modules/run/run/domain/closeGains.model";
import {
	createRun,
	type RecordedClose,
	type RunState,
} from "~/modules/run/run/domain/run.model";

const PEWTER_CLOSE: RecordedClose = {
	gate: 1,
	band: "healthy",
	cleared: true,
	kb: 19,
};

const CERULEAN_CLOSE: RecordedClose = {
	gate: 2,
	band: "healthy",
	cleared: true,
	kb: 22,
};

const stateWith = (
	closes: readonly RecordedClose[],
	unlockedSinceClose?: readonly string[]
): RunState => ({
	...createRun([], []),
	closes,
	...(unlockedSinceClose === undefined ? {} : { unlockedSinceClose }),
});

describe("recordGains", () => {
	it("holds an unlock for the gate's close while the gate is still open", () => {
		const before = stateWith([PEWTER_CLOSE]);

		const after = recordGains(before, before, {
			unlockedConfigIds: ["cold-start"],
			earnedTitleIds: [],
		});

		expect(after.unlockedSinceClose).toEqual(["cold-start"]);
		expect(after.closes).toEqual([PEWTER_CLOSE]);
	});

	it("stamps the held unlocks and this dispatch's gains on the close it records", () => {
		const before = stateWith([PEWTER_CLOSE], ["cold-start"]);
		const closed = stateWith([PEWTER_CLOSE, CERULEAN_CLOSE], ["cold-start"]);

		const after = recordGains(before, closed, {
			unlockedConfigIds: ["dependabot"],
			earnedTitleIds: ["title-carrier-css"],
		});

		expect(after.closes?.at(-1)).toEqual({
			...CERULEAN_CLOSE,
			unlockedConfigIds: ["cold-start", "dependabot"],
			earnedTitleIds: ["title-carrier-css"],
		});
		expect(after.closes?.[0]).toEqual(PEWTER_CLOSE);
		expect(after.unlockedSinceClose).toEqual([]);
	});

	it("returns the state untouched when nothing was gained and no gate closed", () => {
		const before = stateWith([PEWTER_CLOSE]);

		expect(
			recordGains(before, before, {
				unlockedConfigIds: [],
				earnedTitleIds: [],
			})
		).toBe(before);
	});
});

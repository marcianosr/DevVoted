import { describe, expect, it } from "vitest";

import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	gateStartPercent,
	positionPercent,
	TRACK_LENGTH,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";

describe("trackPosition", () => {
	it("counts a fresh run at the start of the ladder", () => {
		expect(trackPosition({ gate: 0, pollsIntoGate: 0 })).toBe(0);
	});

	it("measures depth in polls so gates and part-gates share one unit", () => {
		expect(trackPosition({ gate: 6, pollsIntoGate: 3 })).toBe(33);
	});

	it("puts a completed climb at the end of the ladder", () => {
		expect(
			trackPosition({ gate: GATE_COUNT - 1, pollsIntoGate: SLICE_WINDOW })
		).toBe(TRACK_LENGTH);
	});
});

describe("positionPercent", () => {
	it("puts the start of the climb at the left edge", () => {
		expect(positionPercent(0)).toBe(0);
	});

	it("puts a finished climb at the right edge", () => {
		expect(positionPercent(TRACK_LENGTH)).toBe(100);
	});

	it("scales a mid-climb position against the whole ladder", () => {
		expect(positionPercent(TRACK_LENGTH / 2)).toBe(50);
	});
});

describe("gateStartPercent", () => {
	it("opens the first gate at the left edge", () => {
		expect(gateStartPercent(0)).toBe(0);
	});

	it("spaces the gates evenly across the track", () => {
		expect(gateStartPercent(1)).toBeCloseTo(100 / GATE_COUNT);
	});

	it("leaves the summit gate a stretch of its own rather than ending the track", () => {
		expect(gateStartPercent(GATE_COUNT - 1)).toBeLessThan(100);
	});
});

describe("trackPosition vs the SQL that mirrors it", () => {
	// climbers.repository computes the same position in SQL, for aggregates it
	// cannot do in TS. This cannot execute that SQL; it pins the formula so a
	// change here fails loudly next to the comment naming its copy.
	it.each([
		[0, 0],
		[1, 3],
		[4, 5],
		[GATE_COUNT - 1, 2],
	])("places gate %i, %i polls in, where the query would", (gate, polls) => {
		expect(trackPosition({ gate, pollsIntoGate: polls })).toBe(
			gate * SLICE_WINDOW + polls
		);
	});
});

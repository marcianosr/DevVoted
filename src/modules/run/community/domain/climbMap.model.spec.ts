import { describe, expect, it } from "vitest";

import { GATE_COUNT, SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	gateStartPercent,
	idleDaysOf,
	isResting,
	isRestingClimber,
	positionPercent,
	RESTING_AFTER_DAYS,
	TRACK_LENGTH,
	trackPosition,
} from "~/modules/run/community/domain/climbMap.model";
import { TEST_DATES } from "~/test/kanto";

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

describe("trackPosition", () => {
	it("starts the track at zero", () => {
		expect(trackPosition({ gate: 0, pollsIntoGate: 0 })).toBe(0);
	});

	it("counts polls within the opening gate one for one", () => {
		expect(trackPosition({ gate: 0, pollsIntoGate: 3 })).toBe(3);
	});

	it("puts a fresh gate a whole window past the one before it", () => {
		expect(trackPosition({ gate: 1, pollsIntoGate: 0 })).toBe(5);
		expect(trackPosition({ gate: 4, pollsIntoGate: 0 })).toBe(20);
	});

	it("lands the last gate inside the track it ends", () => {
		expect(
			trackPosition({ gate: GATE_COUNT - 1, pollsIntoGate: 0 })
		).toBeLessThan(TRACK_LENGTH);
	});

	it("never moves backwards as a climb progresses", () => {
		const climb = [
			trackPosition({ gate: 0, pollsIntoGate: 4 }),
			trackPosition({ gate: 1, pollsIntoGate: 0 }),
			trackPosition({ gate: 1, pollsIntoGate: 1 }),
			trackPosition({ gate: 2, pollsIntoGate: 0 }),
		];
		expect(climb).toEqual([...climb].sort((a, b) => a - b));
	});
});

describe("idleDaysOf", () => {
	const today = TEST_DATES.birthday;

	it("counts a run that answered today as not idle at all", () => {
		expect(idleDaysOf(today, today)).toBe(0);
	});

	it("counts whole calendar days since the last answer", () => {
		expect(idleDaysOf("2026-05-12", today)).toBe(1);
		expect(idleDaysOf("2026-05-10", today)).toBe(3);
	});

	it("never counts backwards for an answer dated after today", () => {
		expect(idleDaysOf("2026-05-14", today)).toBe(0);
	});
});

describe("isResting", () => {
	it("lets a climber miss two days before they rest", () => {
		expect(isResting(RESTING_AFTER_DAYS - 1)).toBe(false);
	});

	it("rests a climber on the third day without an answer", () => {
		expect(isResting(RESTING_AFTER_DAYS)).toBe(true);
		expect(isResting(RESTING_AFTER_DAYS + 4)).toBe(true);
	});
});

describe("isRestingClimber", () => {
	it("rests a climber by their idle days, never one without an answer date", () => {
		expect(isRestingClimber({ idleDays: RESTING_AFTER_DAYS })).toBe(true);
		expect(isRestingClimber({ idleDays: 1 })).toBe(false);
		expect(isRestingClimber({})).toBe(false);
	});
});

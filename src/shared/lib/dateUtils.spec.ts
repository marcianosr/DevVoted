import { describe, expect, it } from "vitest";

import { formatCompactDuration, formatDurationMs } from "./dateUtils";

describe("formatDurationMs", () => {
	it("reads sub-minute durations as bare seconds", () => {
		expect(formatDurationMs(9_000)).toBe("9s");
		expect(formatDurationMs(59_400)).toBe("59s");
	});

	it("never reads zero — the floor is 1s", () => {
		expect(formatDurationMs(0)).toBe("1s");
		expect(formatDurationMs(300)).toBe("1s");
	});

	it("switches to compact m/ss past a minute, zero-padding seconds", () => {
		expect(formatDurationMs(60_000)).toBe("1m00");
		expect(formatDurationMs(105_000)).toBe("1m45");
		expect(formatDurationMs(605_000)).toBe("10m05");
	});

	it("rounds half-seconds to the nearest whole second", () => {
		expect(formatDurationMs(8_499)).toBe("8s");
		expect(formatDurationMs(8_500)).toBe("9s");
	});
});

describe("formatCompactDuration", () => {
	it("reads hours with minutes alongside", () => {
		expect(formatCompactDuration(7 * 3_600_000 + 23 * 60_000)).toBe("7h 23m");
	});

	it("drops the minutes on a whole hour", () => {
		expect(formatCompactDuration(2 * 3_600_000)).toBe("2h");
	});

	it("reads sub-hour durations as bare minutes", () => {
		expect(formatCompactDuration(45 * 60_000)).toBe("45m");
	});

	it("floors everything under a minute to <1m, including zero", () => {
		expect(formatCompactDuration(30_000)).toBe("<1m");
		expect(formatCompactDuration(0)).toBe("<1m");
	});
});

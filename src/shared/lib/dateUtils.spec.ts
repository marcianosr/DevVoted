import { describe, expect, it } from "vitest";

import {
	formatCompactDuration,
	formatDurationMs,
	localDayRange,
} from "./dateUtils";
import { TEST_DATES } from "~/test/kanto";

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

describe("localDayRange", () => {
	it("spans midnight to midnight of the day named", () => {
		const { start, end } = localDayRange(TEST_DATES.birthday);

		expect(start.getFullYear()).toBe(end.getFullYear());
		expect(start.getHours()).toBe(0);
		expect(start.getMinutes()).toBe(0);
		expect(end.getHours()).toBe(0);
		expect(end.getDate()).toBe(start.getDate() + 1);
	});

	it("reads the date in local time, not UTC", () => {
		const { start } = localDayRange(TEST_DATES.birthday);
		const [year, month, day] = TEST_DATES.birthday.split("-").map(Number);

		expect(start.getFullYear()).toBe(year);
		expect(start.getMonth()).toBe(month - 1);
		expect(start.getDate()).toBe(day);
	});

	it("rolls a month end over rather than landing on day 32", () => {
		const { start, end } = localDayRange("2026-01-31");
		expect(start.getMonth()).toBe(0);
		expect(end.getMonth()).toBe(1);
		expect(end.getDate()).toBe(1);
	});

	it("crosses a leap day without skipping it", () => {
		const { end } = localDayRange("2028-02-28");
		expect(end.getMonth()).toBe(1);
		expect(end.getDate()).toBe(29);
	});
});

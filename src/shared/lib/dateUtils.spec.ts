import { describe, expect, it } from "vitest";

import {
	dayBefore,
	formatClock,
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

describe("formatClock", () => {
	it("splits the clock into a padded hours-and-minutes line and the seconds", () => {
		expect(formatClock(12 * 3_600_000 + 9 * 60_000 + 59_000)).toEqual({
			main: "12h 09m",
			seconds: "59s",
		});
	});

	it("keeps the hours even when none are left, so the line never jumps width", () => {
		expect(formatClock(5 * 60_000 + 3_000)).toEqual({
			main: "0h 05m",
			seconds: "03s",
		});
	});

	it("floors a passed deadline to zero rather than counting negative", () => {
		expect(formatClock(-4_000)).toEqual({ main: "0h 00m", seconds: "00s" });
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

describe("dayBefore", () => {
	it("names the calendar day before a date", () => {
		expect(dayBefore(TEST_DATES.christmas)).toBe(TEST_DATES.christmasEve);
	});

	it("steps back across a month and a year", () => {
		expect(dayBefore("2026-03-01")).toBe("2026-02-28");
		expect(dayBefore("2026-01-01")).toBe("2025-12-31");
	});
});

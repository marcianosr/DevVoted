import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi,
} from "vitest";

import {
	dayAfter,
	dayBefore,
	formatClock,
	formatCompactDuration,
	formatDurationMs,
	gameDayRange,
	getTodayDateString,
	nextGameDayStart,
} from "./dateUtils";
import { TEST_DATES } from "~/test/kanto";

const AHEAD_OF_UTC = "Pacific/Auckland";
const BEHIND_UTC = "America/Los_Angeles";
const LATE_ON_CHRISTMAS_EVE_UTC = new Date("2025-12-24T23:30:00Z");

const originalTimeZone = process.env.TZ;
const runIn = (timeZone: string) => {
	process.env.TZ = timeZone;
};

afterAll(() => {
	process.env.TZ = originalTimeZone;
});

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

describe("the game day is the UTC day", () => {
	beforeAll(() => vi.useFakeTimers());
	afterAll(() => vi.useRealTimers());
	afterEach(() => runIn(originalTimeZone ?? "UTC"));

	it("names today by the UTC date where the local clock already reads tomorrow", () => {
		runIn(AHEAD_OF_UTC);
		vi.setSystemTime(LATE_ON_CHRISTMAS_EVE_UTC);

		expect(getTodayDateString()).toBe(TEST_DATES.christmasEve);
		expect(dayAfter(getTodayDateString())).toBe(TEST_DATES.christmas);
	});

	it("names today by the UTC date where the local clock still reads yesterday", () => {
		runIn(BEHIND_UTC);
		vi.setSystemTime(new Date(`${TEST_DATES.christmas}T02:00:00Z`));

		expect(getTodayDateString()).toBe(TEST_DATES.christmas);
	});

	it("starts the next game day at UTC midnight, not local midnight", () => {
		runIn(AHEAD_OF_UTC);

		expect(nextGameDayStart(LATE_ON_CHRISTMAS_EVE_UTC).toISOString()).toBe(
			`${TEST_DATES.christmas}T00:00:00.000Z`
		);
	});

	it("starts the next game day a full day ahead when called exactly at midnight", () => {
		const midnight = new Date(`${TEST_DATES.christmas}T00:00:00Z`);

		expect(nextGameDayStart(midnight).toISOString()).toBe(
			"2025-12-26T00:00:00.000Z"
		);
	});
});

describe("gameDayRange", () => {
	it("spans UTC midnight to UTC midnight of the day named, whatever the local zone", () => {
		runIn(BEHIND_UTC);
		const { start, end } = gameDayRange(TEST_DATES.birthday);
		runIn(originalTimeZone ?? "UTC");

		expect(start.toISOString()).toBe(`${TEST_DATES.birthday}T00:00:00.000Z`);
		expect(end.toISOString()).toBe("2026-05-14T00:00:00.000Z");
	});

	it("rolls a month end over rather than landing on day 32", () => {
		expect(gameDayRange("2026-01-31").end.toISOString()).toBe(
			"2026-02-01T00:00:00.000Z"
		);
	});

	it("crosses a leap day without skipping it", () => {
		expect(gameDayRange("2028-02-28").end.toISOString()).toBe(
			"2028-02-29T00:00:00.000Z"
		);
	});
});

describe("dayAfter", () => {
	it("names the calendar day after a date", () => {
		expect(dayAfter(TEST_DATES.christmasEve)).toBe(TEST_DATES.christmas);
	});

	it("steps forward across a month and a year", () => {
		expect(dayAfter("2026-02-28")).toBe("2026-03-01");
		expect(dayAfter("2025-12-31")).toBe("2026-01-01");
	});
});

describe("dayBefore", () => {
	it("names the calendar day before a date", () => {
		expect(dayBefore(TEST_DATES.christmas)).toBe(TEST_DATES.christmasEve);
	});

	it("names the same day before in a zone behind UTC", () => {
		runIn(BEHIND_UTC);
		const previous = dayBefore(TEST_DATES.christmas);
		runIn(originalTimeZone ?? "UTC");

		expect(previous).toBe(TEST_DATES.christmasEve);
	});

	it("steps back across a month and a year", () => {
		expect(dayBefore("2026-03-01")).toBe("2026-02-28");
		expect(dayBefore("2026-01-01")).toBe("2025-12-31");
	});
});

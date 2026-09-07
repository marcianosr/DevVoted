import { describe, expect, it } from "vitest";

import {
	borderUrlOf,
	localDayRange,
} from "~/modules/run/community/infrastructure/climbers.repository";
import { TEST_DATES } from "~/test/kanto";

describe("borderUrlOf", () => {
	it("resolves an equipped border id to its catalog art", () => {
		expect(borderUrlOf("border-00b9a62e")).toBe(
			"/borders/00b9a62e09a1e452d6840170849e8ac06f6d3ef5.png"
		);
	});

	it("wears nothing when no border is equipped", () => {
		expect(borderUrlOf(null)).toBeNull();
	});

	it("wears nothing when the equipped id has left the catalog", () => {
		expect(borderUrlOf("border-retired")).toBeNull();
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

	// Local, not UTC: the seed date is the player's calendar day, so a death at
	// 23:30 belongs to the day they were living in. Parsing as UTC would shift
	// the boundary by the offset and move late-evening deaths onto the next day.
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

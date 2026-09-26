import { describe, expect, it } from "vitest";

import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

import {
	type CategorySeat,
	MIN_LEADER_STREAK,
	isLeadingStreak,
	seatsFor,
} from "~/modules/run/run/domain/categoryLeader.model";

const seat = (
	category: CategoryCode,
	handle: string,
	streak: number
): CategorySeat => ({
	category,
	leader: { userId: handle, handle: `@${handle}`, streak, you: false },
});

describe("isLeadingStreak", () => {
	it("refuses a run one short of the floor, so no seat comes cheap", () => {
		expect(isLeadingStreak(MIN_LEADER_STREAK - 1)).toBe(false);
	});

	it("claims the seat at the floor itself", () => {
		expect(isLeadingStreak(MIN_LEADER_STREAK)).toBe(true);
	});

	it("leaves a category nobody has answered open", () => {
		expect(isLeadingStreak(0)).toBe(false);
	});
});

describe("seatsFor", () => {
	it("draws every category as an open seat when nobody leads one", () => {
		const seats = seatsFor([]);

		expect(seats).toHaveLength(CATEGORY_CODES.length);
		expect(seats.every(({ leader }) => leader === undefined)).toBe(true);
	});

	it("puts the longest run at the top", () => {
		const seats = seatsFor([
			seat("git", "giovanni", 13),
			seat("js", "koga", 21),
			seat("css", "erika", 18),
		]);

		expect(seats.slice(0, 3).map(({ category }) => category)).toEqual([
			"js",
			"css",
			"git",
		]);
	});

	it("sinks the open seats below every held one", () => {
		const held = seatsFor([seat("ruby", "blaine", 4)]).findIndex(
			({ leader }) => leader !== undefined
		);

		expect(held).toBe(0);
	});

	it("keeps two equal runs in category order, so a redraw never reshuffles", () => {
		const seats = seatsFor([seat("ts", "sabrina", 9), seat("css", "misty", 9)]);

		expect(seats.slice(0, 2).map(({ category }) => category)).toEqual([
			"css",
			"ts",
		]);
	});

	it("carries the leader it was handed onto the seat it fills", () => {
		const [top] = seatsFor([seat("html", "ltsurge", 7)]);

		expect(top?.leader?.handle).toBe("@ltsurge");
	});
});

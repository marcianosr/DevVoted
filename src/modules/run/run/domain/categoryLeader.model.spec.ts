import { describe, expect, it } from "vitest";

import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

import {
	CATEGORY_MEASURES,
	type CategorySeat,
	MIN_LEADER,
	boardsFor,
	isLeading,
	seatsFor,
} from "~/modules/run/run/domain/categoryLeader.model";

const seat = (
	category: CategoryCode,
	handle: string,
	best: number
): CategorySeat => ({
	category,
	leader: { userId: handle, handle: `@${handle}`, best, you: false },
});

describe("isLeading", () => {
	it("refuses a figure one short of the floor, so no seat comes cheap", () => {
		expect(isLeading("streak", MIN_LEADER.streak - 1)).toBe(false);
		expect(isLeading("correct", MIN_LEADER.correct - 1)).toBe(false);
	});

	it("claims the seat at the floor itself", () => {
		expect(isLeading("streak", MIN_LEADER.streak)).toBe(true);
		expect(isLeading("correct", MIN_LEADER.correct)).toBe(true);
	});

	it("leaves a category nobody has answered open on both boards", () => {
		expect(isLeading("streak", 0)).toBe(false);
		expect(isLeading("correct", 0)).toBe(false);
	});

	it("holds the correct floor above the streak floor, so the two claims differ", () => {
		expect(MIN_LEADER.correct).toBeGreaterThan(MIN_LEADER.streak);
	});

	it("seats a figure on the streak board that the correct board still refuses", () => {
		const between = MIN_LEADER.streak;

		expect(isLeading("streak", between)).toBe(true);
		expect(isLeading("correct", between)).toBe(false);
	});
});

describe("seatsFor", () => {
	it("draws every category as an open seat when nobody leads one", () => {
		const seats = seatsFor([]);

		expect(seats).toHaveLength(CATEGORY_CODES.length);
		expect(seats.every(({ leader }) => leader === undefined)).toBe(true);
	});

	it("puts the largest figure at the top", () => {
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

	it("keeps two equal figures in category order, so a redraw never reshuffles", () => {
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

describe("boardsFor", () => {
	it("draws one board per measure, in roster order", () => {
		const boards = boardsFor({ streak: [], correct: [] });

		expect(boards.map(({ measure }) => measure)).toEqual([
			...CATEGORY_MEASURES,
		]);
	});

	it("pads both boards to every category, so neither shrinks as the game ages", () => {
		const boards = boardsFor({
			streak: [seat("git", "giovanni", 13)],
			correct: [],
		});

		expect(
			boards.every(({ seats }) => seats.length === CATEGORY_CODES.length)
		).toBe(true);
	});

	it("lets the two boards seat different holders in the same category", () => {
		const [streak, correct] = boardsFor({
			streak: [seat("git", "giovanni", 13)],
			correct: [seat("git", "brock", 41)],
		});

		expect(streak?.seats[0]?.leader?.handle).toBe("@giovanni");
		expect(correct?.seats[0]?.leader?.handle).toBe("@brock");
	});
});

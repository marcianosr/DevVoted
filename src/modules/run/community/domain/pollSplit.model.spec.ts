import { describe, expect, it } from "vitest";

import {
	crowdPickFor,
	toPollSplit,
} from "~/modules/run/community/domain/pollSplit.model";

describe("toPollSplit", () => {
	const record = {
		answeredCount: 8,
		picksByOptionId: { 41: 6, 42: 2 },
	};

	it("turns pick counts into shares of the people who answered", () => {
		expect(toPollSplit(record, { withSampleSize: false })).toEqual({
			percentByOptionId: { 41: 75, 42: 25 },
		});
	});

	it("withholds the sample size at level 1 — the key is absent, not zero", () => {
		expect(toPollSplit(record, { withSampleSize: false })).not.toHaveProperty(
			"answeredCount"
		);
	});

	it("hands over the sample size at level 2", () => {
		expect(toPollSplit(record, { withSampleSize: true }).answeredCount).toBe(8);
	});

	it("sums past 100 on a multi-answer poll, since a share counts answerers", () => {
		const multi = { answeredCount: 4, picksByOptionId: { 1: 4, 2: 3 } };
		expect(toPollSplit(multi, { withSampleSize: false })).toEqual({
			percentByOptionId: { 1: 100, 2: 75 },
		});
	});

	it("reports an unanswered poll as empty rather than dividing by zero", () => {
		expect(
			toPollSplit(
				{ answeredCount: 0, picksByOptionId: {} },
				{ withSampleSize: true }
			)
		).toEqual({ percentByOptionId: {}, answeredCount: 0 });
	});

	it("rounds to whole percentages", () => {
		expect(
			toPollSplit(
				{ answeredCount: 3, picksByOptionId: { 7: 1 } },
				{ withSampleSize: false }
			).percentByOptionId
		).toEqual({ 7: 33 });
	});
});

describe("crowdPickFor", () => {
	const options = ["1", "2", "3", "5", "6", "7", "9", "10", "41", "42", "43"];

	it("takes the one option a majority of answerers picked", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 41: 7, 42: 3 } },
				options
			)
		).toEqual(["41"]);
	});

	it("takes every option a majority picked, so a select-all poll gets a set", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 1: 9, 2: 8, 3: 1 } },
				options
			)
		).toEqual(["1", "2"]);
	});

	it("falls back to the single most-picked when a split vote clears nobody", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 41: 4, 42: 3, 43: 3 } },
				options
			)
		).toEqual(["41"]);
	});

	it("treats an exact half as short of a majority, so 5 of 10 falls through", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 5: 5, 6: 5, 7: 1 } },
				options
			)
		).toEqual(["5"]);
	});

	it("reads raw counts, so two options on 50.4% and 50.2% both clear", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 1000, picksByOptionId: { 5: 504, 6: 502 } },
				options
			)
		).toEqual(["5", "6"]);
	});

	it("breaks a tie on the lower id read as a number, not as a string", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 9: 4, 10: 4 } },
				options
			)
		).toEqual(["9"]);
	});

	it("orders a majority set by id read as a number", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 10: 9, 9: 8 } },
				options
			)
		).toEqual(["9", "10"]);
	});

	it("picks nothing on a poll nobody has answered", () => {
		expect(
			crowdPickFor({ answeredCount: 0, picksByOptionId: {} }, options)
		).toEqual([]);
	});

	it("drops an id the poll no longer offers rather than submitting it", () => {
		expect(
			crowdPickFor(
				{ answeredCount: 10, picksByOptionId: { 999: 9, 41: 6 } },
				options
			)
		).toEqual(["41"]);
	});
});

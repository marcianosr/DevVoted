import { describe, expect, it } from "vitest";

import { toPollSplit } from "~/modules/run/community/domain/pollSplit.model";

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

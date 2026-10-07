import { describe, expect, it } from "vitest";

import { APPROVED_POLL_ARCHIVE_KB } from "~/modules/polls/poll/domain/poll.model";
import {
	bountyKbFor,
	categoryBountiesOf,
	isThinCategory,
} from "~/modules/polls/poll/domain/pollBounty.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

describe("bountyKbFor", () => {
	it("never pays less than the base reward", () => {
		[0, 1, 5, 10, 25, 50, 100, 1000].forEach((published) =>
			expect(bountyKbFor(published)).toBeGreaterThanOrEqual(
				APPROVED_POLL_ARCHIVE_KB
			)
		);
	});

	it.each([
		[0, 48],
		[9, 48],
		[10, 32],
		[24, 32],
		[25, APPROVED_POLL_ARCHIVE_KB],
	])("pays %i published polls a bounty of %i KB", (published, kb) => {
		expect(bountyKbFor(published)).toBe(kb);
	});

	it("pays the base reward for a full category", () => {
		expect(bountyKbFor(1000)).toBe(APPROVED_POLL_ARCHIVE_KB);
	});

	it("never pays more for a category that holds more polls", () => {
		const counts = Array.from({ length: 200 }, (_, published) => published);

		counts
			.slice(1)
			.forEach((published) =>
				expect(bountyKbFor(published)).toBeLessThanOrEqual(
					bountyKbFor(published - 1)
				)
			);
	});
});

describe("categoryBountiesOf", () => {
	it("states every category, a missing one as holding no polls", () => {
		const bounties = categoryBountiesOf({ css: 40 });

		expect(bounties.map(({ code }) => code)).toEqual([...CATEGORY_CODES]);
		expect(bounties.find(({ code }) => code === "vue")).toEqual({
			code: "vue",
			published: 0,
			bountyKb: bountyKbFor(0),
		});
	});

	it("prices each category by its own published count", () => {
		const css = categoryBountiesOf({ css: 40 }).find(
			({ code }) => code === "css"
		);

		expect(css).toEqual({
			code: "css",
			published: 40,
			bountyKb: bountyKbFor(40),
		});
	});
});

describe("isThinCategory", () => {
	it("is thin when its bounty beats the base reward", () => {
		expect(
			isThinCategory({
				code: "vue",
				published: 2,
				bountyKb: APPROVED_POLL_ARCHIVE_KB * 2,
			})
		).toBe(true);
	});

	it("is not thin at the base reward", () => {
		expect(
			isThinCategory({
				code: "css",
				published: 400,
				bountyKb: APPROVED_POLL_ARCHIVE_KB,
			})
		).toBe(false);
	});
});

import { describe, expect, it } from "vitest";

import { TEST_DATES } from "~/test/kanto";

import { createMockPoll } from "./poll.factory";
import { reviewStateOf } from "./poll.model";

const CHRISTMAS = new Date(`${TEST_DATES.christmas}T09:00:00Z`);
const CHRISTMAS_EVE = new Date(`${TEST_DATES.christmasEve}T09:00:00Z`);

describe("reviewStateOf", () => {
	it("reads a poll nobody reviewed as never reviewed", () => {
		expect(reviewStateOf(createMockPoll({ reviewedAt: null }))).toBe("never");
	});

	it("reads a poll edited after its review as changed", () => {
		expect(
			reviewStateOf(
				createMockPoll({ reviewedAt: CHRISTMAS_EVE, updatedAt: CHRISTMAS })
			)
		).toBe("changed");
	});

	it("reads a poll reviewed after its last edit as up to date", () => {
		expect(
			reviewStateOf(
				createMockPoll({ reviewedAt: CHRISTMAS, updatedAt: CHRISTMAS_EVE })
			)
		).toBe("current");
	});

	it("reads a review stamped at the same moment as the edit as up to date", () => {
		expect(
			reviewStateOf(
				createMockPoll({ reviewedAt: CHRISTMAS, updatedAt: CHRISTMAS })
			)
		).toBe("current");
	});

	it("reads a reviewed poll with no update stamp as up to date", () => {
		expect(
			reviewStateOf(createMockPoll({ reviewedAt: CHRISTMAS, updatedAt: null }))
		).toBe("current");
	});
});

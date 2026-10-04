import { beforeEach, describe, expect, it, vi } from "vitest";

import { TEST_DATES } from "~/test/kanto";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import { fetchConsumedPollsForDay } from "~/modules/run/community/infrastructure/community.repository";

const mock = vi.hoisted((): DrizzleMockState => ({
	results: [],
	setCalls: [],
	valuesCalls: [],
	insertTables: [],
	updateTables: [],
	deleteTables: [],
}));

vi.mock("~/database/db", async () => {
	const { createMockDb } = await import("~/test/drizzleMock.factory");
	return { db: createMockDb(mock) };
});

const YESTERDAY = TEST_DATES.christmasEve;
const TODAY = TEST_DATES.christmas;

const row = (position: number, poll_id: number, segment_date: string) => ({
	position,
	poll_id,
	segment_date,
});

describe("fetchConsumedPollsForDay", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("counts the polls the run has reached by their order, across a gap in the stored positions", async () => {
		mock.results.push([
			row(0, 77, YESTERDAY),
			row(1, 85, YESTERDAY),
			row(3, 29, TODAY),
			row(4, 14, TODAY),
			row(5, 52, TODAY),
		]);

		const consumed = await fetchConsumedPollsForDay(122, TODAY, 5);

		expect(consumed.map((poll) => poll.poll_id)).toEqual([29, 14, 52]);
	});

	it("leaves out the polls the run has not reached yet", async () => {
		mock.results.push([
			row(0, 29, TODAY),
			row(1, 14, TODAY),
			row(2, 52, TODAY),
		]);

		const consumed = await fetchConsumedPollsForDay(122, TODAY, 2);

		expect(consumed.map((poll) => poll.poll_id)).toEqual([29, 14]);
	});
});

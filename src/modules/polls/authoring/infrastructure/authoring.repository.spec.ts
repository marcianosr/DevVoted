import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { pollsTable, usersTable } from "~/database/schema";
import {
	fetchUnannouncedPublishedPolls,
	markPollReviewed,
	markPollsAnnounced,
	payAuthorOnFirstPublish,
} from "~/modules/polls/authoring/infrastructure/authoring.repository";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

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

const BROCK = "11111111-1111-4111-8111-111111111111";
const POLL_ID = 74;

beforeEach(() => {
	vi.clearAllMocks();
	resetDrizzleMock(mock);
});

describe("payAuthorOnFirstPublish", () => {
	it("stamps the poll paid and credits its author's archive on the first publish", async () => {
		mock.results.push([{ author: BROCK }], [{ id: BROCK }]);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBe(BROCK);
		expect(mock.updateTables).toEqual([pollsTable, usersTable]);
		expect(mock.setCalls[0]).toHaveProperty("author_paid_at");
		expect(mock.setCalls[1]).toHaveProperty("archived_storage");
	});

	it("stamps the poll but credits nothing when its author is an admin", async () => {
		mock.results.push([{ author: BROCK }], []);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBeNull();
		expect(mock.setCalls[0]).toHaveProperty("author_paid_at");
	});

	it("credits nothing when the poll is not published or was already paid", async () => {
		mock.results.push([]);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBeNull();
		expect(mock.updateTables).toEqual([pollsTable]);
	});
});

describe("fetchUnannouncedPublishedPolls", () => {
	it("returns the author's paid polls the dialog has not shown yet", async () => {
		const flex = { id: POLL_ID, question: "What does `flex: 1` expand to?" };
		mock.results.push([flex]);

		expect(await fetchUnannouncedPublishedPolls(BROCK)).toEqual([flex]);
	});
});

describe("markPollsAnnounced", () => {
	it("stamps the polls announced", async () => {
		mock.results.push([]);

		await markPollsAnnounced(BROCK, [POLL_ID]);

		expect(mock.updateTables).toEqual([pollsTable]);
		expect(mock.setCalls[0]).toHaveProperty("author_announced_at");
	});

	it("writes nothing when no poll is named", async () => {
		await markPollsAnnounced(BROCK, []);

		expect(mock.updateTables).toEqual([]);
	});
});

describe("markPollReviewed", () => {
	const REVIEWED_AT = new Date("2026-12-25T09:00:00Z");

	it("stamps the poll reviewed at the time it was given", async () => {
		mock.results.push([{ id: POLL_ID, reviewed_at: REVIEWED_AT }]);

		const poll = await markPollReviewed(POLL_ID, REVIEWED_AT);

		expect(mock.updateTables).toEqual([pollsTable]);
		expect(mock.setCalls[0]).toEqual({ reviewed_at: REVIEWED_AT });
		expect(poll.reviewedAt).toEqual(REVIEWED_AT);
	});

	it("refuses a poll that does not exist", async () => {
		mock.results.push([]);

		await expect(markPollReviewed(POLL_ID, REVIEWED_AT)).rejects.toThrow(
			"Poll not found"
		);
	});
});

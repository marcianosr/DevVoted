import { is, SQL, sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { pollsTable, usersTable } from "~/database/schema";
import {
	fetchPublishedCountIn,
	fetchPublishedCounts,
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
		mock.results.push([{ author: BROCK, rewardKb: 16 }], [{ id: BROCK }]);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBe(BROCK);
		expect(mock.updateTables).toEqual([pollsTable, usersTable]);
		expect(mock.setCalls[0]).toHaveProperty("author_paid_at");
		expect(mock.setCalls[1]).toHaveProperty("archived_storage");
	});

	it("leaves the poll's update stamp alone, so paying is not an edit", async () => {
		mock.results.push([{ author: BROCK, rewardKb: 16 }], [{ id: BROCK }]);

		await payAuthorOnFirstPublish(db, POLL_ID);

		expect(is(mock.setCalls[0]?.updated_at, SQL)).toBe(true);
	});

	it("credits the reward the poll was promised when it was suggested", async () => {
		mock.results.push([{ author: BROCK, rewardKb: 48 }], [{ id: BROCK }]);

		await payAuthorOnFirstPublish(db, POLL_ID);

		const credit = mock.setCalls[1]?.archived_storage;
		const { params } = new PgDialect().sqlToQuery(
			is(credit, SQL) ? credit : sql``
		);

		expect(params).toContain(48 * 1024);
	});

	it("stamps the poll but credits nothing when its author is an admin", async () => {
		mock.results.push([{ author: BROCK, rewardKb: 16 }], []);

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
		const flex = {
			id: POLL_ID,
			question: "What does `flex: 1` expand to?",
			rewardKb: 16,
		};
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
		expect(is(mock.setCalls[0]?.updated_at, SQL)).toBe(true);
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
		expect(mock.setCalls[0]).toHaveProperty("reviewed_at", REVIEWED_AT);
		expect(poll.reviewedAt).toEqual(REVIEWED_AT);
	});

	it("leaves the update stamp alone, so a review is not an edit", async () => {
		mock.results.push([{ id: POLL_ID, reviewed_at: REVIEWED_AT }]);

		await markPollReviewed(POLL_ID, REVIEWED_AT);

		expect(mock.setCalls[0]).toHaveProperty("updated_at");
		expect(is(mock.setCalls[0]?.updated_at, SQL)).toBe(true);
	});

	it("refuses a poll that does not exist", async () => {
		mock.results.push([]);

		await expect(markPollReviewed(POLL_ID, REVIEWED_AT)).rejects.toThrow(
			"Poll not found"
		);
	});
});

describe("fetchPublishedCounts", () => {
	it("counts the published polls of each known category", async () => {
		mock.results.push([
			{ code: "vue", published: 3 },
			{ code: "css", published: 40 },
		]);

		expect(await fetchPublishedCounts()).toEqual({ vue: 3, css: 40 });
	});

	it("drops a category code the game does not know", async () => {
		mock.results.push([{ code: "cobol", published: 1 }]);

		expect(await fetchPublishedCounts()).toEqual({});
	});
});

describe("fetchPublishedCountIn", () => {
	it("counts the published polls of one category", async () => {
		mock.results.push([{ published: 7 }]);

		expect(await fetchPublishedCountIn("vue")).toBe(7);
	});

	it("counts none when the category holds no rows", async () => {
		mock.results.push([]);

		expect(await fetchPublishedCountIn("vue")).toBe(0);
	});
});

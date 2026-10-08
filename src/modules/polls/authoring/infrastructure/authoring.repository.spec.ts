import { is, SQL, sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { pollsTable, usersTable } from "~/database/schema";
import {
	createPollWithOptions,
	fetchPublishedCountIn,
	fetchPublishedCounts,
	fetchUnannouncedPublishedPolls,
	markPollReviewed,
	markPollsAnnounced,
	payAuthorOnFirstPublish,
	updatePollWithOptions,
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

const POLL_RECORD = {
	id: POLL_ID,
	question: "Which method returns the last element of an array?",
	status: "draft",
	answer_type: "single",
	opening_time: new Date(),
	closing_time: new Date(),
	created_by: BROCK,
	created_at: new Date(),
	updated_at: new Date(),
	category_code: "js",
	code_sandbox_example: null,
	code_block: null,
	explanation: null,
	poll_number: 1,
	reviewed_at: null,
};

const READS_IN_PLACE = "Reads the last element without touching the array.";

describe("createPollWithOptions", () => {
	it("writes each option's explanation beside its text", async () => {
		mock.results.push([{ maxNum: 3 }], [POLL_RECORD]);

		await createPollWithOptions(
			{
				question: POLL_RECORD.question,
				status: "draft",
				answerType: "single",
				categoryCode: "js",
				createdBy: BROCK,
				authorRewardKb: 16,
			},
			[
				{ option: "at(-1)", correct: true, explanation: READS_IN_PLACE },
				{ option: "pop()", correct: false, explanation: null },
			]
		);

		expect(mock.valuesCalls[1]).toEqual([
			{
				poll_id: POLL_ID,
				option: "at(-1)",
				correct: true,
				explanation: READS_IN_PLACE,
			},
			{ poll_id: POLL_ID, option: "pop()", correct: false, explanation: null },
		]);
	});
});

describe("updatePollWithOptions", () => {
	it("rewrites a kept option's explanation and clears one sent as null", async () => {
		mock.results.push([POLL_RECORD]);

		await updatePollWithOptions(POLL_ID, {}, [
			{ id: 1, option: "at(-1)", correct: true, explanation: READS_IN_PLACE },
			{ id: 2, option: "pop()", correct: false, explanation: null },
		]);

		expect(mock.setCalls.slice(1, 3)).toEqual([
			{ option: "at(-1)", correct: true, explanation: READS_IN_PLACE },
			{ option: "pop()", correct: false, explanation: null },
		]);
	});

	it("inserts a new option with its explanation", async () => {
		mock.results.push([POLL_RECORD]);

		await updatePollWithOptions(POLL_ID, {}, [
			{ id: 1, option: "at(-1)", correct: true, explanation: null },
			{ option: "slice(-1)", correct: false, explanation: "Returns an array." },
		]);

		expect(mock.valuesCalls[0]).toEqual([
			{
				poll_id: POLL_ID,
				option: "slice(-1)",
				correct: false,
				explanation: "Returns an array.",
			},
		]);
	});
});

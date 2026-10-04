import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { pollsTable, usersTable } from "~/database/schema";
import { payAuthorOnFirstPublish } from "~/modules/polls/authoring/infrastructure/authoring.repository";
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
		mock.results.push([{ author: BROCK }]);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBe(BROCK);
		expect(mock.updateTables).toEqual([pollsTable, usersTable]);
		expect(mock.setCalls[0]).toHaveProperty("author_paid_at");
		expect(mock.setCalls[1]).toHaveProperty("archived_storage");
	});

	it("credits nothing when the poll is not published or was already paid", async () => {
		mock.results.push([]);

		const paid = await payAuthorOnFirstPublish(db, POLL_ID);

		expect(paid).toBeNull();
		expect(mock.updateTables).toEqual([pollsTable]);
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import { fetchPublishedPollCounts } from "~/modules/account/profile/infrastructure/profile.repository";

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

const BROCK = "brock-of-pewter-city";

describe("fetchPublishedPollCounts", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reports the polls an author published", async () => {
		mock.results.push([{ published: 12 }]);

		expect(await fetchPublishedPollCounts(BROCK)).toEqual({
			published: 12,
		});
	});

	it("reads a count that arrives as a string as a number", async () => {
		mock.results.push([{ published: "3" }]);

		expect(await fetchPublishedPollCounts(BROCK)).toEqual({
			published: 3,
		});
	});

	it("reports zero for a player who never published", async () => {
		mock.results.push([]);

		expect(await fetchPublishedPollCounts(BROCK)).toEqual({
			published: 0,
		});
	});
});

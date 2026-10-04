import { beforeEach, describe, expect, it, vi } from "vitest";

import { userTitlesTable } from "~/database/schema";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	fetchUnannouncedTitleIds,
	fetchUserTitleState,
	markTitlesAnnounced,
} from "~/modules/account/profile/infrastructure/title.repository";

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

const RED = "red-from-pallet-town";
const GIT = "title-maintainer-git";

describe("fetchUserTitleState", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reports the worn titles alongside everything the account has earned", async () => {
		mock.results.push([{ equippedTitleIds: [GIT] }]);
		mock.results.push([{ titleId: GIT }, { titleId: "title-it-compiles" }]);

		expect(await fetchUserTitleState(RED)).toEqual({
			ownedTitleIds: [GIT, "title-it-compiles"],
			equippedTitleIds: [GIT],
		});
	});

	it("keeps the order it was written in, because the first worn title is primary", async () => {
		mock.results.push([{ equippedTitleIds: ["title-it-compiles", GIT] }]);
		mock.results.push([{ titleId: GIT }, { titleId: "title-it-compiles" }]);

		const state = await fetchUserTitleState(RED);

		expect(state?.equippedTitleIds).toEqual(["title-it-compiles", GIT]);
	});

	it("reports an account wearing none, which is where every account starts", async () => {
		mock.results.push([{ equippedTitleIds: [] }]);
		mock.results.push([]);

		expect(await fetchUserTitleState(RED)).toEqual({
			ownedTitleIds: [],
			equippedTitleIds: [],
		});
	});

	it("reports nothing for an account that does not exist", async () => {
		mock.results.push([]);

		expect(await fetchUserTitleState("nobody")).toBeNull();
	});
});

describe("fetchUnannouncedTitleIds", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("names the titles the account holds but has never been shown", async () => {
		mock.results.push([{ titleId: "title-legacy-tester" }, { titleId: GIT }]);

		expect(await fetchUnannouncedTitleIds(RED)).toEqual([
			"title-legacy-tester",
			GIT,
		]);
	});

	it("names nothing once every title has been announced", async () => {
		mock.results.push([]);

		expect(await fetchUnannouncedTitleIds(RED)).toEqual([]);
	});
});

describe("markTitlesAnnounced", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("stamps the ledger rows it was handed", async () => {
		await markTitlesAnnounced(RED, ["title-legacy-tester"]);

		expect(mock.updateTables).toContain(userTitlesTable);
		expect(mock.setCalls[0]).toMatchObject({
			announced_at: expect.any(Date),
		});
	});

	it("writes nothing when there was nothing on screen to acknowledge", async () => {
		await markTitlesAnnounced(RED, []);

		expect(mock.updateTables).toEqual([]);
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { usersTable, userTitlesTable } from "~/database/schema";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	fetchUnannouncedTitleIds,
	fetchUserTitleState,
	markTitlesAnnounced,
	setEquippedTitle,
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

	it("reports the worn title alongside everything the account has earned", async () => {
		mock.results.push([{ equippedTitleId: GIT }]);
		mock.results.push([{ titleId: GIT }, { titleId: "title-summit" }]);

		expect(await fetchUserTitleState(RED)).toEqual({
			ownedTitleIds: [GIT, "title-summit"],
			equippedTitleId: GIT,
		});
	});

	it("reports an account wearing none, which is where every account starts", async () => {
		mock.results.push([{ equippedTitleId: null }]);
		mock.results.push([]);

		expect(await fetchUserTitleState(RED)).toEqual({
			ownedTitleIds: [],
			equippedTitleId: null,
		});
	});

	it("reports nothing for an account that does not exist", async () => {
		mock.results.push([]);

		expect(await fetchUserTitleState("nobody")).toBeNull();
	});
});

describe("setEquippedTitle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("equips a title the account holds", async () => {
		mock.results.push([{ titleId: GIT }]);
		mock.results.push([{ equippedTitleId: GIT }]);
		mock.results.push([{ titleId: GIT }]);

		expect(await setEquippedTitle(RED, GIT)).toEqual({
			ownedTitleIds: [GIT],
			equippedTitleId: GIT,
		});
		expect(mock.setCalls[0]).toEqual({ equipped_title_id: GIT });
	});

	it("refuses a title the account has not earned, and writes nothing", async () => {
		mock.results.push([]);

		expect(await setEquippedTitle(RED, GIT)).toBeNull();
		expect(mock.updateTables).not.toContain(usersTable);
		expect(mock.setCalls).toEqual([]);
	});

	it("takes a title off without asking the ledger, since wearing none is always allowed", async () => {
		mock.results.push([{ equippedTitleId: null }]);
		mock.results.push([]);

		expect(await setEquippedTitle(RED, null)).toEqual({
			ownedTitleIds: [],
			equippedTitleId: null,
		});
		expect(mock.setCalls[0]).toEqual({ equipped_title_id: null });
	});

	it("proves ownership in the same statement it reads, never on a second table", async () => {
		mock.results.push([{ titleId: GIT }]);
		mock.results.push([{ equippedTitleId: GIT }]);
		mock.results.push([{ titleId: GIT }]);

		await setEquippedTitle(RED, GIT);

		expect(mock.updateTables).not.toContain(userTitlesTable);
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

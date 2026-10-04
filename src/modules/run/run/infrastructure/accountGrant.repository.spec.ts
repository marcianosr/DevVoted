import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import {
	userConfigUnlocksTable,
	userObjectiveProgressTable,
	userServiceUnlocksTable,
	usersTable,
	userTitlesTable,
} from "~/database/schema";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	applyAccountGrants,
	applyObjectiveGrants,
	fetchCategoryPollCounts,
	grantEarnedTitles,
} from "~/modules/run/run/infrastructure/accountGrant.repository";

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

const NOTHING_GRANTED = {
	swatchIds: [],
	firstInstalledConfigIds: [],
	pinnedGate: null,
	storageWatermarkKb: null,
	titlesDue: false,
};

beforeEach(() => {
	vi.clearAllMocks();
	resetDrizzleMock(mock);
});

describe("applyObjectiveGrants", () => {
	it("queues the touched metrics in one batched upsert and grants off the counts it returns", async () => {
		mock.results.push([{ metric: "rebuilds", count: 5 }]);
		mock.results.push([]);
		mock.results.push([]);

		await applyObjectiveGrants(db, RED, ["rebuilds"]);

		expect(mock.insertTables).toEqual([
			userObjectiveProgressTable,
			userServiceUnlocksTable,
		]);
		expect(mock.valuesCalls[0]).toEqual([
			{ user_id: RED, metric: "rebuilds", count: 1 },
		]);
		expect(mock.valuesCalls[1]).toEqual([
			{ user_id: RED, service_id: "hotReload", via_metric: "rebuilds" },
		]);
	});

	it("hands back the config ids the grant rows were written for", async () => {
		mock.results.push([{ metric: "polls-answered", count: 1000 }]);
		mock.results.push([{ config_id: "cache" }]);
		mock.results.push([]);

		expect(await applyObjectiveGrants(db, RED, ["polls-answered"])).toEqual([
			"cache",
		]);
		expect(mock.insertTables).toContain(userConfigUnlocksTable);
	});

	it("writes no grant row while every count sits below its targets", async () => {
		mock.results.push([{ metric: "rebuilds", count: 1 }]);

		expect(await applyObjectiveGrants(db, RED, ["rebuilds"])).toEqual([]);
		expect(mock.insertTables).toEqual([userObjectiveProgressTable]);
	});
});

describe("applyAccountGrants", () => {
	it("touches no row when nothing was granted", async () => {
		await applyAccountGrants(db, RED, NOTHING_GRANTED);

		expect(db.update).not.toHaveBeenCalled();
	});

	it("appends each swatch to the account without repeating one it holds", async () => {
		await applyAccountGrants(db, RED, {
			...NOTHING_GRANTED,
			swatchIds: ["swatch-pallet", "swatch-pewter"],
		});

		expect(mock.updateTables).toEqual([usersTable, usersTable]);
		expect(mock.setCalls[0]).toHaveProperty("owned_swatch_ids");
	});

	it("writes the planted gate, the first-install stamp and the watermark, in that order", async () => {
		await applyAccountGrants(db, RED, {
			...NOTHING_GRANTED,
			pinnedGate: 4,
			firstInstalledConfigIds: ["js"],
			storageWatermarkKb: 640,
		});

		expect(mock.updateTables).toEqual([
			usersTable,
			userConfigUnlocksTable,
			usersTable,
		]);
		expect(mock.setCalls[0]).toEqual({ pinned_gate: 4 });
		expect(mock.setCalls[1]).toHaveProperty("first_installed_at");
		expect(mock.setCalls[2]).toHaveProperty("peak_storage_kb");
	});
});

describe("grantEarnedTitles", () => {
	it("reads the ledger and the category counts, then writes what they satisfy", async () => {
		mock.results.push([{ metric: "polls-answered", count: 1 }]);
		mock.results.push([{ categoryCode: "git", seen: 50, mastered: 50 }]);
		mock.results.push([{ title_id: "title-maintainer-git" }]);

		expect(await grantEarnedTitles(db, RED)).toEqual(["title-maintainer-git"]);
		expect(mock.insertTables).toEqual([userTitlesTable]);
		expect(mock.valuesCalls[0]).toEqual(
			expect.arrayContaining([
				{
					user_id: RED,
					title_id: "title-maintainer-git",
					announced_at: expect.any(Date),
				},
			])
		);
	});

	it("writes no title row when the ledger satisfies none", async () => {
		mock.results.push([]);
		mock.results.push([]);

		expect(await grantEarnedTitles(db, RED)).toEqual([]);
		expect(db.insert).not.toHaveBeenCalled();
	});
});

describe("fetchCategoryPollCounts", () => {
	it("reads each category as distinct polls seen and distinct polls answered correctly", async () => {
		mock.results.push([
			{ categoryCode: "css", seen: 12, mastered: 7 },
			{ categoryCode: "git", seen: 3, mastered: 0 },
		]);

		expect(await fetchCategoryPollCounts(RED)).toEqual([
			{ metric: "category-seen:css", count: 12 },
			{ metric: "category-mastered:css", count: 7 },
			{ metric: "category-seen:git", count: 3 },
			{ metric: "category-mastered:git", count: 0 },
		]);
	});

	it("reads nothing for an account that never answered", async () => {
		mock.results.push([]);

		expect(await fetchCategoryPollCounts(RED)).toEqual([]);
	});
});

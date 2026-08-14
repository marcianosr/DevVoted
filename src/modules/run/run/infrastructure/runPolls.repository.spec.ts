import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { TEST_DATES } from "~/test/kanto";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import { getOrCreateDailyRunSeed } from "~/modules/run/run/infrastructure/runPolls.repository";

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

describe("getOrCreateDailyRunSeed", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("returns the existing sequence without creating anything", async () => {
		mock.results.push([{ poll_id: 7 }, { poll_id: 3 }]);

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.birthday);

		expect(sequence).toEqual([7, 3]);
		expect(db.insert).not.toHaveBeenCalled();
	});

	it("rolls and persists the sequence when the day has none", async () => {
		const published = [1, 2, 3, 4].map((id) => ({ id }));
		mock.results.push([]); // no existing sequence
		mock.results.push([{ id: 1 }]); // seed row claimed
		mock.results.push(published);
		mock.results.push(undefined); // daily_run_polls insert

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.birthday);

		expect([...sequence].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
		expect(db.insert).toHaveBeenCalledTimes(2);
		const insertedRows = mock.valuesCalls[1] as { position: number }[];
		expect(insertedRows.map((row) => row.position)).toEqual([0, 1, 2, 3]);
	});

	it("reads the winner's sequence when losing the creation race", async () => {
		mock.results.push([]); // no existing sequence yet
		mock.results.push([]); // claim conflicts — another request won
		mock.results.push([{ poll_id: 9 }, { poll_id: 5 }]);

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.christmas);

		expect(sequence).toEqual([9, 5]);
		expect(db.insert).toHaveBeenCalledTimes(1);
	});

	it("throws when there are no published polls to seed from", async () => {
		mock.results.push([]);
		mock.results.push([{ id: 1 }]);
		mock.results.push([]);

		await expect(getOrCreateDailyRunSeed(TEST_DATES.christmas)).rejects.toThrow(
			"No published polls"
		);
	});
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { TEST_DATES } from "~/test/kanto";
import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	getOrCreateDailyRunSeed,
	rollSegmentForward,
} from "~/modules/run/run/infrastructure/runPolls.repository";
import { SEED_LENGTH } from "~/modules/run/run/domain/seed.model";

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
		mock.results.push([]);
		mock.results.push([{ id: 1 }]);
		mock.results.push(published);
		mock.results.push(undefined);

		const sequence = await getOrCreateDailyRunSeed(TEST_DATES.birthday);

		expect([...sequence].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
		expect(db.insert).toHaveBeenCalledTimes(2);
		const insertedRows = mock.valuesCalls[1] as { position: number }[];
		expect(insertedRows.map((row) => row.position)).toEqual([0, 1, 2, 3]);
	});

	it("reads the winner's sequence when losing the creation race", async () => {
		mock.results.push([]);
		mock.results.push([]);
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

describe("rollSegmentForward", () => {
	const YESTERDAY = TEST_DATES.christmasEve;
	const TODAY = TEST_DATES.christmas;
	const SEED = [77, 85, 91, 30, 75];
	const PUBLISHED = Array.from({ length: 40 }, (_, index) => index + 1);

	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	const positionsOf = (positions: readonly number[]) =>
		positions.map((position) => ({ position }));

	const rollWith = async ({
		answered,
		positions,
		currentIndex,
	}: {
		answered: readonly number[];
		positions: readonly number[];
		currentIndex: number;
	}) => {
		mock.results.push([{ segment_date: YESTERDAY }]);
		mock.results.push(answered.map((poll_id) => ({ poll_id })));
		mock.results.push(positionsOf(positions));
		mock.results.push(undefined);
		mock.results.push(SEED.map((poll_id) => ({ poll_id })));
		mock.results.push(PUBLISHED.map((id) => ({ id })));
		mock.results.push(undefined);

		await rollSegmentForward(db, 122, TODAY, currentIndex);

		return mock.valuesCalls.at(-1) as {
			position: number;
			poll_id: number;
		}[];
	};

	it("deals five fresh polls when the day's seed repeats one the run already answered", async () => {
		const dealt = await rollWith({
			answered: [77],
			positions: [0, 1, 2, 3, 4, 5],
			currentIndex: 5,
		});

		expect(dealt).toHaveLength(SEED_LENGTH);
		expect(dealt.map((row) => row.poll_id).slice(0, 4)).toEqual([
			85, 91, 30, 75,
		]);
		expect(dealt.map((row) => row.poll_id)).not.toContain(77);
	});

	it("drops yesterday's unanswered polls and starts today on a full five", async () => {
		const dealt = await rollWith({
			answered: [],
			positions: [0, 1, 2, 3, 4],
			currentIndex: 3,
		});

		expect(db.delete).toHaveBeenCalledTimes(1);
		expect(dealt.map((row) => row.poll_id)).toEqual(SEED);
		expect(dealt.map((row) => row.position)).toEqual([3, 4, 5, 6, 7]);
	});

	it("lands the new day right after the last poll the run keeps, across a gap in the list", async () => {
		const dealt = await rollWith({
			answered: [],
			positions: [0, 1, 2, 4, 5],
			currentIndex: 4,
		});

		expect(dealt.map((row) => row.position)).toEqual([5, 6, 7, 8, 9]);
	});

	it("leaves the day alone once it has already been dealt", async () => {
		mock.results.push([{ segment_date: TODAY }]);

		await rollSegmentForward(db, 122, TODAY, 5);

		expect(db.delete).not.toHaveBeenCalled();
		expect(db.insert).not.toHaveBeenCalled();
	});
});

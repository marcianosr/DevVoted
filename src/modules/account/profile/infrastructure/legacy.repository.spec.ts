import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import {
	fetchArchivedRunStartedAt,
	fetchLegacyBonusBytes,
} from "~/modules/account/profile/infrastructure/legacy.repository";

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
const CUTOVER = new Date("2026-08-14T09:00:00Z");
const PLAYED_CREDIT = 262144;

describe("fetchArchivedRunStartedAt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads when the calendar run the cutover closed had started", async () => {
		mock.results.push([{ startedAt: CUTOVER }]);

		expect(await fetchArchivedRunStartedAt(RED)).toEqual(CUTOVER);
	});

	it("reports no date for an account whose runs all finished on their own", async () => {
		mock.results.push([]);

		expect(await fetchArchivedRunStartedAt(RED)).toBeNull();
	});
});

describe("fetchLegacyBonusBytes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads the credit the migration paid", async () => {
		mock.results.push([{ bytes: PLAYED_CREDIT }]);

		expect(await fetchLegacyBonusBytes(RED)).toBe(PLAYED_CREDIT);
	});

	it("reports nothing for an account the migration never reached", async () => {
		mock.results.push([{ bytes: null }]);

		expect(await fetchLegacyBonusBytes(RED)).toBeNull();
	});

	it("reports nothing for an account that does not exist", async () => {
		mock.results.push([]);

		expect(await fetchLegacyBonusBytes(RED)).toBeNull();
	});
});

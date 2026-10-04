import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "~/database/db";
import { runsTable } from "~/database/schema";
import {
	ALREADY_LOOTED,
	claimFallenRun,
} from "~/modules/run/community/infrastructure/loot.repository";
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

const FALLEN_RUN_ID = 64;
const MISTY = "misty";

const claim = () =>
	claimFallenRun(db, {
		fallenRunId: FALLEN_RUN_ID,
		looterUserId: MISTY,
		kb: 67,
	});

describe("claimFallenRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("stamps the looter and the take onto the fallen run", async () => {
		mock.results.push([{ id: FALLEN_RUN_ID }]);

		await claim();

		expect(mock.updateTables[0]).toBe(runsTable);
		expect(mock.setCalls[0]).toMatchObject({
			looted_by_user_id: MISTY,
			loot_amount: 67,
		});
		expect(mock.setCalls[0].looted_at).toBeInstanceOf(Date);
	});

	it("refuses when the guarded update matches no unlooted row", async () => {
		mock.results.push([]);

		await expect(claim()).rejects.toThrow(ALREADY_LOOTED);
	});
});

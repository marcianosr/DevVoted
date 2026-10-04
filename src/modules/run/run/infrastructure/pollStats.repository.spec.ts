import { beforeEach, describe, expect, it, vi } from "vitest";

import {
	type DrizzleMockState,
	resetDrizzleMock,
} from "~/test/drizzleMock.factory";

import { fetchPollStats } from "~/modules/run/run/infrastructure/pollStats.repository";

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

const ANSWERED_AT = "2026-05-13T09:00:00.000Z";

const queueStats = (lastAnsweredAt: Date | string | null) => {
	mock.results.push([{ attempts: "10", right: "6" }]);
	mock.results.push([{ attempts: "2", misses: "1", lastAnsweredAt }]);
};

describe("fetchPollStats", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetDrizzleMock(mock);
	});

	it("reads the driver's string timestamp as an ISO string", async () => {
		queueStats("2026-05-13 09:00:00+00");

		const stats = await fetchPollStats(1, "ash");

		expect(stats.lastAnsweredAt).toBe(ANSWERED_AT);
	});

	it("reads a driver that parsed the timestamp for it just the same", async () => {
		queueStats(new Date(ANSWERED_AT));

		const stats = await fetchPollStats(1, "ash");

		expect(stats.lastAnsweredAt).toBe(ANSWERED_AT);
	});

	it("leaves the date off an account that has never answered the poll", async () => {
		queueStats(null);

		const stats = await fetchPollStats(1, "ash");

		expect(stats.lastAnsweredAt).toBeUndefined();
	});

	it("counts the room's first attempts and this account's misses", async () => {
		queueStats(new Date(ANSWERED_AT));

		const stats = await fetchPollStats(1, "ash");

		expect(stats).toMatchObject({
			firstAttempts: 10,
			firstAttemptsRight: 6,
			attempts: 2,
			misses: 1,
		});
	});
});

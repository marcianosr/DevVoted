import { describe, it, expect, vi, beforeEach } from "vitest";

import { db } from "~/database/db";

import {
	getActiveRunByUserId,
	createRunForUser,
	getRunWithCategoryCoverage,
	finishRun,
} from "./run.queries";
import { awardCoverageToRun } from "./coverage.queries";
import { createMockRunRecord } from "../models/run.mock";
import {
	createMockRunCategoryCoverageRecord,
	createMockRunCategoryCoverageRecordArray,
} from "../models/runCategoryCoverage.mock";

// Mock the seasons service
vi.mock("~/domains/ranking/services/seasonService", () => ({
	getSeasonForNewRun: vi.fn().mockResolvedValue(1),
}));

// Mock the database module
vi.mock("~/database/db", () => {
	const createMockQueryBuilder = () => {
		const returningMock = vi.fn();
		const valuesMock = vi.fn().mockReturnValue({
			returning: returningMock,
		});
		const whereMock = vi.fn().mockReturnValue({
			orderBy: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue([]),
			}),
			limit: vi.fn().mockResolvedValue([]),
		});
		const limitMock = vi.fn().mockResolvedValue([]);
		const setMock = vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				returning: returningMock,
			}),
		});

		return {
			values: valuesMock,
			where: whereMock,
			limit: limitMock,
			set: setMock,
			returning: returningMock,
		};
	};

	const selectMock = vi.fn().mockReturnValue({
		from: vi.fn().mockReturnValue(createMockQueryBuilder()),
	});

	const insertMock = vi.fn(() => createMockQueryBuilder());
	const updateMock = vi.fn(() => createMockQueryBuilder());

	const transactionMock = vi.fn((cb) =>
		cb({
			select: selectMock,
			insert: insertMock,
			update: updateMock,
		})
	);

	return {
		db: {
			select: selectMock,
			insert: insertMock,
			update: updateMock,
			transaction: transactionMock,
		},
	};
});

describe("Run Queries", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getActiveRunByUserId", () => {
		it("returns active run when found", async () => {
			const mockRun = createMockRunRecord({ status: "active" });
			const mockXpRecords = createMockRunCategoryCoverageRecordArray(2);

			// Mock first query for run
			const limitMock1 = vi.fn().mockResolvedValue([mockRun]);
			const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
			const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

			// Mock second query for XP records
			const whereMock2 = vi.fn().mockResolvedValue(mockXpRecords);
			const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

			vi.mocked(db.select)
				.mockReturnValueOnce({ from: fromMock1 } as any)
				.mockReturnValueOnce({ from: fromMock2 } as any);

			const result = await getActiveRunByUserId("test-user-id");

			expect(result).toBeDefined();
			expect(result?.status).toBe("active");
			expect(result?.userId).toBe("test-user-id");
			expect(result?.categoryCoverage).toBeDefined();
			expect(result?.categoryCoverage).toHaveLength(2);
		});

		it("returns null when no active run found", async () => {
			const limitMock = vi.fn().mockResolvedValue([]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });

			vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

			const result = await getActiveRunByUserId("test-user-id");

			expect(result).toBeNull();
		});
	});

	describe("createRunForUser", () => {
		it("creates run and category XP records", async () => {
			const mockRun = createMockRunRecord();
			const mockCategories = [
				{ id: 1, name: "JavaScript", code: "js" },
				{ id: 2, name: "CSS", code: "css" },
			];
			const mockXpRecords = createMockRunCategoryCoverageRecordArray(2);

			const returningMock = vi.fn();
			returningMock.mockResolvedValueOnce([mockRun]);
			returningMock.mockResolvedValue([mockXpRecords[0]]);
			returningMock.mockResolvedValue([mockXpRecords[1]]);

			const insertMock = vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: returningMock,
				}),
			});

			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockResolvedValue(mockCategories),
			});

			const txMock = {
				insert: insertMock,
				select: selectMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) =>
				cb(txMock as any)
			);

			const result = await createRunForUser("test-user-id");

			expect(result).toBeDefined();
			expect(result.categoryCoverage).toHaveLength(2);
			expect(result.userId).toBe("test-user-id");
			expect(vi.mocked(db.transaction)).toHaveBeenCalledOnce();
		});
	});

	describe("getRunWithCategoryCoverage", () => {
		it("returns run with category XP data", async () => {
			const mockRun = createMockRunRecord();
			const mockXpRecords = createMockRunCategoryCoverageRecordArray(3);

			const limitMock = vi.fn().mockResolvedValue([mockRun]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });

			const selectMock = vi.fn();
			selectMock.mockReturnValueOnce({ from: fromMock });
			selectMock.mockReturnValueOnce({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue(mockXpRecords),
				}),
			});

			vi.mocked(db.select).mockImplementation(selectMock);

			const result = await getRunWithCategoryCoverage(1);

			expect(result).toBeDefined();
			expect(result?.id).toBeDefined();
			expect(result?.categoryCoverage).toHaveLength(3);
		});

		it("returns null when run not found", async () => {
			const limitMock = vi.fn().mockResolvedValue([]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });

			vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

			const result = await getRunWithCategoryCoverage(999);

			expect(result).toBeNull();
		});
	});

	describe("finishRun", () => {
		it("updates run status to finished", async () => {
			const mockRun = createMockRunRecord({ status: "finished" });

			const returningMock = vi.fn().mockResolvedValue([mockRun]);
			const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
			const setMock = vi.fn().mockReturnValue({ where: whereMock });

			vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

			const result = await finishRun(1);

			expect(result).toBeDefined();
			expect(result?.status).toBe("finished");
		});

		it("returns null when run not found", async () => {
			const returningMock = vi.fn().mockResolvedValue([]);
			const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
			const setMock = vi.fn().mockReturnValue({ where: whereMock });

			vi.mocked(db.update).mockReturnValue({ set: setMock } as any);

			const result = await finishRun(999);

			expect(result).toBeNull();
		});
	});

	describe("awardCoverageToRun", () => {
		it("awards coverage and increments streak correctly", async () => {
			const currentXpRecord = createMockRunCategoryCoverageRecord({
				current_coverage: 10,
				current_streak: 2,
				best_streak: 3,
			});

			const updatedXpRecord = createMockRunCategoryCoverageRecord({
				current_coverage: 15, // +5 XP
				current_streak: 3, // +1 streak
				best_streak: 3, // same as before
			});

			const limitMock = vi.fn().mockResolvedValue([currentXpRecord]);
			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: limitMock,
					}),
				}),
			});

			const returningMock = vi.fn().mockResolvedValue([updatedXpRecord]);
			const setMock = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({ returning: returningMock }),
			});
			const updateMock = vi.fn().mockReturnValue({ set: setMock });

			const txMock = {
				select: selectMock,
				update: updateMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) =>
				cb(txMock as any)
			);

			const result = await awardCoverageToRun(1, "js", 15, 3, 3, 1);

			expect(result.currentCoverage).toBe(15);
			expect(result.currentStreak).toBe(3);
			expect(result.bestStreak).toBe(3);
		});

		it("updates best streak when current streak exceeds it", async () => {
			const currentXpRecord = createMockRunCategoryCoverageRecord({
				current_coverage: 20,
				current_streak: 4,
				best_streak: 3,
			});

			const updatedXpRecord = createMockRunCategoryCoverageRecord({
				current_coverage: 25,
				current_streak: 5,
				best_streak: 5, // updated to new best
			});

			const limitMock = vi.fn().mockResolvedValue([currentXpRecord]);
			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: limitMock,
					}),
				}),
			});

			const returningMock = vi.fn().mockResolvedValue([updatedXpRecord]);
			const setMock = vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({ returning: returningMock }),
			});
			const updateMock = vi.fn().mockReturnValue({ set: setMock });

			const txMock = {
				select: selectMock,
				update: updateMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) =>
				cb(txMock as any)
			);

			const result = await awardCoverageToRun(1, "js", 25, 5, 5, 1);

			expect(result.bestStreak).toBe(5);
		});
	});
});

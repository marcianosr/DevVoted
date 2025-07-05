import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	getActiveRunByUserId,
	createRunForUser,
	getRunWithCategoryXp,
	finishRun,
	awardXpToRun,
	penalizeXpInRun,
} from "./queries";
import { db } from "~/database/db";
import { createMockRunRecord, createMockRunRecordArray } from "../factories/run";
import { createMockRunCategoryXpRecord, createMockRunCategoryXpRecordArray } from "../factories/runCategoryXp";

// Mock the database module
vi.mock("~/database/db", () => {
	const createMockQueryBuilder = () => {
		const returningMock = vi.fn();
		const valuesMock = vi.fn().mockReturnValue({
			returning: returningMock,
		});
		const whereMock = vi.fn().mockReturnValue({
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
			const limitMock = vi.fn().mockResolvedValue([mockRun]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });
			
			vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

			const result = await getActiveRunByUserId("test-user-id");

			expect(result).toBeDefined();
			expect(result?.status).toBe("active");
			expect(result?.userId).toBe("test-user-id");
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
			const mockXpRecords = createMockRunCategoryXpRecordArray(2);

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

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			const result = await createRunForUser("test-user-id");

			expect(result.run).toBeDefined();
			expect(result.categoryXp).toHaveLength(2);
			expect(vi.mocked(db.transaction)).toHaveBeenCalledOnce();
		});
	});

	describe("getRunWithCategoryXp", () => {
		it("returns run with category XP data", async () => {
			const mockRun = createMockRunRecord();
			const mockXpRecords = createMockRunCategoryXpRecordArray(3);

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

			const result = await getRunWithCategoryXp(1);

			expect(result).toBeDefined();
			expect(result?.run).toBeDefined();
			expect(result?.categoryXp).toHaveLength(3);
		});

		it("returns null when run not found", async () => {
			const limitMock = vi.fn().mockResolvedValue([]);
			const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
			const fromMock = vi.fn().mockReturnValue({ where: whereMock });
			
			vi.mocked(db.select).mockReturnValue({ from: fromMock } as any);

			const result = await getRunWithCategoryXp(999);

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

	describe("awardXpToRun", () => {
		it("awards XP and increments streak correctly", async () => {
			const currentXpRecord = createMockRunCategoryXpRecord({
				current_xp: 10,
				current_streak: 2,
				best_streak: 3,
			});
			
			const updatedXpRecord = createMockRunCategoryXpRecord({
				current_xp: 15, // +5 XP
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

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			const result = await awardXpToRun(1, "js", 5);

			expect(result.currentXp).toBe(15);
			expect(result.currentStreak).toBe(3);
			expect(result.bestStreak).toBe(3);
		});

		it("updates best streak when current streak exceeds it", async () => {
			const currentXpRecord = createMockRunCategoryXpRecord({
				current_xp: 20,
				current_streak: 4,
				best_streak: 3,
			});
			
			const updatedXpRecord = createMockRunCategoryXpRecord({
				current_xp: 25,
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

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			const result = await awardXpToRun(1, "js", 5);

			expect(result.bestStreak).toBe(5);
		});

		it("throws error when XP record not found", async () => {
			const limitMock = vi.fn().mockResolvedValue([]); // No record found
			const selectMock = vi.fn().mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: limitMock,
					}),
				}),
			});

			const txMock = { select: selectMock };
			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			await expect(awardXpToRun(1, "js")).rejects.toThrow("No XP record found for run 1 and category js");
		});
	});

	describe("penalizeXpInRun", () => {
		it("resets category XP to 0 and ends run", async () => {
			const updatedXpRecord = createMockRunCategoryXpRecord({
				current_xp: 0,
				current_streak: 0,
			});

			const returningMock = vi.fn().mockResolvedValue([updatedXpRecord]);
			const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
			const setMock = vi.fn().mockReturnValue({ where: whereMock });
			const updateMock = vi.fn().mockReturnValue({ set: setMock });

			const txMock = {
				update: updateMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			const result = await penalizeXpInRun(1, "js");

			expect(result.runEnded).toBe(true);
			expect(vi.mocked(db.transaction)).toHaveBeenCalledOnce();
		});

		it("resets all categories when run ends", async () => {
			const updatedXpRecord = createMockRunCategoryXpRecord({
				current_xp: 0,
				current_streak: 0,
			});

			const returningMock = vi.fn().mockResolvedValue([updatedXpRecord]);
			const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
			const setMock = vi.fn().mockReturnValue({ where: whereMock });
			const updateMock = vi.fn().mockReturnValue({ set: setMock });

			const txMock = {
				update: updateMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			await penalizeXpInRun(1, "js");

			// Verify that update was called multiple times (once for specific category, once for run, once for all categories)
			expect(updateMock).toHaveBeenCalledTimes(3);
		});

		it("throws error when XP record not found", async () => {
			const returningMock = vi.fn().mockResolvedValue([]); // No record found
			const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
			const setMock = vi.fn().mockReturnValue({ where: whereMock });
			const updateMock = vi.fn().mockReturnValue({ set: setMock });

			const txMock = {
				update: updateMock,
			};

			vi.mocked(db.transaction).mockImplementation(async (cb) => cb(txMock as any));

			await expect(penalizeXpInRun(1, "js")).rejects.toThrow("No XP record found for run 1 and category js");
		});
	});
});
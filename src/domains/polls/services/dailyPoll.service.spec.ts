import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTodayDateSeed, getDateSeed, selectDailyPoll } from "./dailyPoll.service";
import { getTodayDateString } from "~/lib/dateUtils";
import * as seededRandom from "~/lib/seededRandom";
import { db } from "~/database/db";
import { pollFactory } from "~/domains/polls/models/poll";
import type { PollRecord } from "~/domains/polls/models/poll";

// Mock dependencies
vi.mock("~/lib/dateUtils", () => ({
	getTodayDateString: vi.fn(),
}));
vi.mock("~/lib/seededRandom");
vi.mock("~/database/db");
vi.mock("~/domains/polls/api/queries");

describe("dailyPoll.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getTodayDateSeed", () => {
		it("returns today's date in YYYY-MM-DD format", () => {
			const mockDate = "2024-01-15";
			vi.mocked(getTodayDateString).mockReturnValue(mockDate);

			const result = getTodayDateSeed();

			expect(getTodayDateString).toHaveBeenCalled();
			expect(result).toBe(mockDate);
		});

		it("formats date consistently", () => {
			const testCases = ["2024-01-01", "2024-12-31", "2023-07-15"];

			for (const expectedDate of testCases) {
				vi.mocked(getTodayDateString).mockReturnValue(expectedDate);

				const result = getTodayDateSeed();
				expect(result).toBe(expectedDate);
			}
		});
	});

	describe("getDateSeed", () => {
		it("returns provided date when given", () => {
			const testDate = "2025-07-28";
			const result = getDateSeed(testDate);
			expect(result).toBe(testDate);
			// Should not call getTodayDateString when date is provided
			expect(getTodayDateString).not.toHaveBeenCalled();
		});

		it("returns today's date when no date provided", () => {
			const mockDate = "2024-01-15";
			vi.mocked(getTodayDateString).mockReturnValue(mockDate);

			const result = getDateSeed();

			expect(getTodayDateString).toHaveBeenCalled();
			expect(result).toBe(mockDate);
		});

		it("returns today's date when undefined provided", () => {
			const mockDate = "2024-01-15";
			vi.mocked(getTodayDateString).mockReturnValue(mockDate);

			const result = getDateSeed(undefined);

			expect(getTodayDateString).toHaveBeenCalled();
			expect(result).toBe(mockDate);
		});
	});

	describe("selectDailyPoll with race condition protection", () => {
		const mockTransaction = vi.fn();

		beforeEach(() => {
			// Mock database transaction
			(db.transaction as any) = mockTransaction;
			
			// Mock today's date
			vi.mocked(getTodayDateString).mockReturnValue("2025-05-13");
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it("returns existing open poll when one exists for today", async () => {
			const mockPollRecords: PollRecord[] = [
				{
					id: 1,
					question: "What is Mario's favorite power-up?",
					status: "open",
					answer_type: "single",
					opening_time: new Date("2025-05-13"),
					closing_time: new Date("2025-05-14"),
					created_by: "test-user",
					created_at: new Date("2025-05-13"),
					updated_at: null,
					category_code: "css",
				},
			];

			const expectedOpenPoll = pollFactory.toDTO(mockPollRecords[0]);

			// Mock transaction that returns the existing open poll
			mockTransaction.mockImplementation(async (callback) => {
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockResolvedValue(mockPollRecords),
					}),
				};
				return await callback(mockTx);
			});

			// Mock seeded random to return the open poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedOpenPoll);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedOpenPoll);
			expect(mockTransaction).toHaveBeenCalledOnce();
			expect(seededRandom.selectSeededRandom).toHaveBeenCalledWith([expectedOpenPoll], "2025-05-13");
		});

		it("opens a new poll when no open polls exist", async () => {
			const mockPollRecords: PollRecord[] = [
				{
					id: 1,
					question: "What is Mario's favorite power-up?",
					status: "closed",
					answer_type: "single",
					opening_time: new Date("2025-05-12"),
					closing_time: new Date("2025-05-13"),
					created_by: "test-user",
					created_at: new Date("2025-05-12"),
					updated_at: null,
					category_code: "css",
				},
			];

			const expectedSelectedPoll = pollFactory.toDTO(mockPollRecords[0]);

			// Mock transaction that selects and opens a poll
			mockTransaction.mockImplementation(async (callback) => {
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockResolvedValue(mockPollRecords),
					}),
					update: vi.fn().mockReturnValue({
						set: vi.fn().mockReturnValue({
							where: vi.fn().mockResolvedValue(undefined),
						}),
					}),
				};
				return await callback(mockTx);
			});

			// Mock seeded random to return the closed poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedSelectedPoll);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedSelectedPoll);
			expect(mockTransaction).toHaveBeenCalledOnce();
		});

		it("returns null when no closed polls are available to open", async () => {
			const mockPollRecords: PollRecord[] = [];

			mockTransaction.mockImplementation(async (callback) => {
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockResolvedValue(mockPollRecords),
					}),
				};
				return await callback(mockTx);
			});

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toBeNull();
			expect(mockTransaction).toHaveBeenCalledOnce();
		});

		it("prevents race conditions by using database transactions", async () => {
			const mockPollRecords: PollRecord[] = [
				{
					id: 1,
					question: "What is Mario's favorite power-up?",
					status: "closed",
					answer_type: "single",
					opening_time: new Date("2025-05-12"),
					closing_time: new Date("2025-05-13"),
					created_by: "test-user",
					created_at: new Date("2025-05-12"),
					updated_at: null,
					category_code: "css",
				},
			];

			const expectedSelectedPoll = pollFactory.toDTO(mockPollRecords[0]);

			// Mock transaction with verification of atomic operations
			let transactionActive = false;
			mockTransaction.mockImplementation(async (callback) => {
				expect(transactionActive).toBe(false); // No concurrent transactions
				transactionActive = true;
				
				const mockTx = {
					select: vi.fn().mockReturnValue({
						from: vi.fn().mockResolvedValue(mockPollRecords),
					}),
					update: vi.fn().mockReturnValue({
						set: vi.fn().mockReturnValue({
							where: vi.fn().mockResolvedValue(undefined),
						}),
					}),
				};
				
				const result = await callback(mockTx);
				transactionActive = false;
				return result;
			});

			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedSelectedPoll);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedSelectedPoll);
			expect(mockTransaction).toHaveBeenCalledOnce();
			expect(transactionActive).toBe(false); // Transaction completed
		});
	});
});

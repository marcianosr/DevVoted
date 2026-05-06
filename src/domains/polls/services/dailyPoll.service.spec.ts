import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as dailyPollQueries from "~/domains/polls/api/dailyPoll.queries";
import type { Poll } from "~/domains/polls/models/poll.model";
import { createMockPoll } from "~/domains/polls/models/poll.mock";
import { getTodayDateString } from "~/lib/dateUtils";
import * as seededRandom from "~/lib/seededRandom";

import {
	getTodayDateSeed,
	getDateSeed,
	selectDailyPoll,
} from "./dailyPoll.service";

// Mock dependencies
vi.mock("~/lib/dateUtils", () => ({
	getTodayDateString: vi.fn(),
}));
vi.mock("~/lib/seededRandom");
vi.mock("~/domains/polls/api/dailyPoll.queries", () => ({
	getOrCreateDailyPoll: vi.fn(),
}));

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

	describe("selectDailyPoll with daily_polls table", () => {
		beforeEach(() => {
			// Mock today's date
			vi.mocked(getTodayDateString).mockReturnValue("2025-05-13");
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it("returns existing poll when one exists for today", async () => {
			const expectedPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "published",
				answerType: "single",
				openingTime: new Date("2025-05-13"),
				closingTime: new Date("2025-05-14"),
				createdBy: "test-user",
				createdAt: new Date("2025-05-13"),
				updatedAt: null,
				categoryCode: "js",
				codeBlock: null,
				codeSandboxExample: null,
				pollNumber: null,
				explanation: null,
			};

			// Mock the query layer to return the existing poll
			vi.mocked(dailyPollQueries.getOrCreateDailyPoll).mockResolvedValue(
				expectedPoll
			);

			// Mock seeded random to return the poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedPoll);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedPoll);
			expect(dailyPollQueries.getOrCreateDailyPoll).toHaveBeenCalledOnce();
			expect(dailyPollQueries.getOrCreateDailyPoll).toHaveBeenCalledWith(
				"2025-05-13",
				expect.any(Function),
				expect.any(Function)
			);
		});

		it("creates new daily poll entry when none exists for date", async () => {
			const expectedPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "published",
				answerType: "single",
				openingTime: new Date("2025-05-12"),
				closingTime: new Date("2025-05-13"),
				createdBy: "test-user",
				createdAt: new Date("2025-05-12"),
				updatedAt: null,
				categoryCode: "js",
				codeBlock: null,
				codeSandboxExample: null,
				pollNumber: null,
				explanation: null,
			};

			// Mock the query layer to return the selected poll
			vi.mocked(dailyPollQueries.getOrCreateDailyPoll).mockResolvedValue(
				expectedPoll
			);

			// Mock seeded random to return the poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedPoll);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedPoll);
			expect(dailyPollQueries.getOrCreateDailyPoll).toHaveBeenCalledOnce();
		});

		it("returns null when no polls are available", async () => {
			// Mock the query layer to return null
			vi.mocked(dailyPollQueries.getOrCreateDailyPoll).mockResolvedValue(null);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toBeNull();
			expect(dailyPollQueries.getOrCreateDailyPoll).toHaveBeenCalledOnce();
		});

		it("uses deterministic seeded selection", async () => {
			const expectedPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "published",
				answerType: "single",
				openingTime: new Date("2025-05-12"),
				closingTime: new Date("2025-05-13"),
				createdBy: "test-user",
				createdAt: new Date("2025-05-12"),
				updatedAt: null,
				categoryCode: "js",
				codeBlock: null,
				codeSandboxExample: null,
				pollNumber: null,
				explanation: null,
			};

			vi.mocked(dailyPollQueries.getOrCreateDailyPoll).mockResolvedValue(
				expectedPoll
			);

			await selectDailyPoll("2025-05-13");

			expect(dailyPollQueries.getOrCreateDailyPoll).toHaveBeenCalledWith(
				"2025-05-13",
				expect.any(Function),
				expect.any(Function)
			);

			// Get the selection function that was passed (unweighted fallback)
			const selectionFunction = vi.mocked(dailyPollQueries.getOrCreateDailyPoll)
				.mock.calls[0][1];
			const mockPolls = [expectedPoll];

			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(expectedPoll);
			const result = selectionFunction(mockPolls);

			expect(seededRandom.selectSeededRandom).toHaveBeenCalledWith(
				mockPolls,
				"2025-05-13"
			);
			expect(result).toBe(expectedPoll);
		});

		it("selects different polls for different dates", async () => {
			const christmasPoll = createMockPoll({
				id: 25,
				question:
					"Web vitals measure user experience with precision and care, which metric tracks visual stability everywhere?",
				categoryCode: "general-frontend",
			});

			const birthdayPoll = createMockPoll({
				id: 13,
				question:
					"Union types in TypeScript let you combine with ease, what operator joins types if you please?",
				categoryCode: "ts",
			});

			const newYearPoll = createMockPoll({
				id: 1,
				question:
					"useState and useReducer manage state with care, when does useReducer become the better pair?",
				categoryCode: "react",
			});

			const mockPolls = [christmasPoll, birthdayPoll, newYearPoll];

			vi.mocked(dailyPollQueries.getOrCreateDailyPoll).mockImplementation(
				async (_date: string, selectFn: (polls: Poll[]) => Poll | null) => {
					return selectFn(mockPolls);
				}
			);

			vi.mocked(seededRandom.selectSeededRandom)
				.mockReturnValueOnce(christmasPoll)
				.mockReturnValueOnce(birthdayPoll)
				.mockReturnValueOnce(newYearPoll);

			const result1 = await selectDailyPoll("2024-12-25");
			const result2 = await selectDailyPoll("2025-05-13");
			const result3 = await selectDailyPoll("2025-01-01");

			expect(result1?.id).toBe(25);
			expect(result2?.id).toBe(13);
			expect(result3?.id).toBe(1);

			expect(seededRandom.selectSeededRandom).toHaveBeenNthCalledWith(
				1,
				mockPolls,
				"2024-12-25"
			);
			expect(seededRandom.selectSeededRandom).toHaveBeenNthCalledWith(
				2,
				mockPolls,
				"2025-05-13"
			);
			expect(seededRandom.selectSeededRandom).toHaveBeenNthCalledWith(
				3,
				mockPolls,
				"2025-01-01"
			);
		});
	});
});

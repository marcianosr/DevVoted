import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import * as queries from "~/domains/polls/api/queries";
import { createMockPoll } from "~/domains/polls/factories/poll";
import type { Poll } from "~/domains/polls/models/poll";
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
		beforeEach(() => {
			// Mock today's date
			vi.mocked(getTodayDateString).mockReturnValue("2025-05-13");
		});

		afterEach(() => {
			vi.clearAllMocks();
		});

		it("returns existing open poll when one exists for today", async () => {
			const expectedOpenPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "open",
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

			// Mock the query layer to return the existing open poll
			vi.mocked(queries.manageDailyPollTransition).mockResolvedValue(
				expectedOpenPoll
			);

			// Mock seeded random to return the open poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(
				expectedOpenPoll
			);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedOpenPoll);
			expect(queries.manageDailyPollTransition).toHaveBeenCalledOnce();
			expect(queries.manageDailyPollTransition).toHaveBeenCalledWith(
				expect.any(Function)
			);
		});

		it("opens a new poll when no open polls exist", async () => {
			const expectedSelectedPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "closed",
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
			vi.mocked(queries.manageDailyPollTransition).mockResolvedValue(
				expectedSelectedPoll
			);

			// Mock seeded random to return the closed poll
			vi.mocked(seededRandom.selectSeededRandom).mockReturnValue(
				expectedSelectedPoll
			);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toEqual(expectedSelectedPoll);
			expect(queries.manageDailyPollTransition).toHaveBeenCalledOnce();
		});

		it("returns null when no polls are available to open", async () => {
			// Mock the query layer to return null
			vi.mocked(queries.manageDailyPollTransition).mockResolvedValue(null);

			const result = await selectDailyPoll("2025-05-13");

			expect(result).toBeNull();
			expect(queries.manageDailyPollTransition).toHaveBeenCalledOnce();
		});

		it("uses deterministic seeded selection", async () => {
			const expectedPoll: Poll = {
				id: 1,
				question:
					"See the code on your screen, what should the output have been?",
				status: "closed",
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

			vi.mocked(queries.manageDailyPollTransition).mockResolvedValue(
				expectedPoll
			);

			await selectDailyPoll("2025-05-13");

			expect(queries.manageDailyPollTransition).toHaveBeenCalledWith(
				expect.any(Function)
			);

			const selectionFunction = vi.mocked(queries.manageDailyPollTransition)
				.mock.calls[0][0];
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

			vi.mocked(queries.manageDailyPollTransition).mockImplementation(
				async (selectFn) => {
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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTodayDateSeed, getDateSeed } from "./dailyPoll.service";
import { getTodayDateString } from "~/lib/dateUtils";

// Mock date utils
vi.mock("~/lib/dateUtils", () => ({
	getTodayDateString: vi.fn(),
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
});

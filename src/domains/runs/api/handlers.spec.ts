import { describe, it, expect, vi, beforeEach } from "vitest";

import { getOrCreateActiveRun, getUserActiveRun } from "./handlers";
import * as runQueries from "./run.queries";
import { createMockRun } from "../models/run.mock";
import { createMockRunCategoryCoverageArray } from "../models/runCategoryCoverage.mock";

vi.mock("./run.queries", () => ({
	getActiveRunByUserId: vi.fn(),
	createRunForUser: vi.fn(),
	getLastRunFromUser: vi.fn(),
	getAllRuns: vi.fn(),
}));
vi.mock("./ranking.queries", () => ({ getLiveRunRankings: vi.fn() }));
vi.mock("./shop.queries", () => ({ skipShop: vi.fn() }));
vi.mock("../services/runCompletion.service", () => ({
	endRunManually: vi.fn(),
}));

describe("Run Handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getOrCreateActiveRun", () => {
		it("returns existing active run with XP data", async () => {
			const mockXp = createMockRunCategoryCoverageArray(3);
			const mockRunWithXp = createMockRun({ categoryCoverage: mockXp });

			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(
				mockRunWithXp
			);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockRunWithXp);
			}
			expect(runQueries.getActiveRunByUserId).toHaveBeenCalledWith(
				"test-user-id"
			);
			expect(runQueries.createRunForUser).not.toHaveBeenCalled();
		});

		it("creates new run when no active run exists", async () => {
			const mockXp = createMockRunCategoryCoverageArray(3);
			const mockNewRunData = createMockRun({ categoryCoverage: mockXp });

			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(null);
			vi.mocked(runQueries.createRunForUser).mockResolvedValue(mockNewRunData);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockNewRunData);
			}
			expect(runQueries.getActiveRunByUserId).toHaveBeenCalledWith(
				"test-user-id"
			);
			expect(runQueries.createRunForUser).toHaveBeenCalledWith(
				"test-user-id",
				0,
				[]
			);
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(runQueries.getActiveRunByUserId).mockRejectedValue(
				new Error(errorMessage)
			);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(errorMessage);
			}
		});

		it("handles unknown errors", async () => {
			vi.mocked(runQueries.getActiveRunByUserId).mockRejectedValue(
				"Unknown error"
			);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Failed to get or create run");
			}
		});
	});

	describe("getUserActiveRun", () => {
		it("returns active run with XP data", async () => {
			const mockXp = createMockRunCategoryCoverageArray(3);
			const mockRunWithXp = createMockRun({ categoryCoverage: mockXp });

			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(
				mockRunWithXp
			);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockRunWithXp);
			}
			expect(runQueries.getActiveRunByUserId).toHaveBeenCalledWith(
				"test-user-id"
			);
		});

		it("returns error when no active run found", async () => {
			vi.mocked(runQueries.getActiveRunByUserId).mockResolvedValue(null);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("No active run found");
			}
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(runQueries.getActiveRunByUserId).mockRejectedValue(
				new Error(errorMessage)
			);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(errorMessage);
			}
		});

		it("handles unknown errors", async () => {
			vi.mocked(runQueries.getActiveRunByUserId).mockRejectedValue(
				"Unknown error"
			);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Failed to get active run");
			}
		});
	});
});

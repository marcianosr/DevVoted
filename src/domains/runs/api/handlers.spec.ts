import { describe, it, expect, vi, beforeEach } from "vitest";

import { getOrCreateActiveRun, getUserActiveRun } from "./handlers";
import * as queries from "./queries";
import { createMockRun } from "../models/run";
import { createMockRunCategoryCoverageArray } from "../models/runCategoryCoverage";

// Mock the queries module
vi.mock("./queries", () => ({
	getActiveRunByUserId: vi.fn(),
	createRunForUser: vi.fn(),
	getRunWithCategoryXp: vi.fn(),
	finishRun: vi.fn(),
}));

describe("Run Handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getOrCreateActiveRun", () => {
		it("returns existing active run with XP data", async () => {
			const mockXp = createMockRunCategoryCoverageArray(3);
			const mockRunWithXp = createMockRun({ categoryCoverage: mockXp });

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(mockRunWithXp);

			const result = await getOrCreateActiveRun("test-user-id", "vanilla");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockRunWithXp);
			}
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
			expect(queries.createRunForUser).not.toHaveBeenCalled();
		});

		it("creates new run when no active run exists", async () => {
			const mockXp = createMockRunCategoryCoverageArray(3);
			const mockNewRunData = createMockRun({ categoryCoverage: mockXp });

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(null);
			vi.mocked(queries.createRunForUser).mockResolvedValue(mockNewRunData);

			const result = await getOrCreateActiveRun("test-user-id", "vanilla");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockNewRunData);
			}
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
			expect(queries.createRunForUser).toHaveBeenCalledWith(
				"test-user-id",
				"vanilla"
			);
			expect(queries.getRunWithCategoryXp).not.toHaveBeenCalled();
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(
				new Error(errorMessage)
			);

			const result = await getOrCreateActiveRun("test-user-id", "vanilla");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(errorMessage);
			}
		});

		it("handles unknown errors", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(
				"Unknown error"
			);

			const result = await getOrCreateActiveRun("test-user-id", "vanilla");

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

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(mockRunWithXp);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(mockRunWithXp);
			}
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
		});

		it("returns error when no active run found", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(null);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("No active run found");
			}
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(
				new Error(errorMessage)
			);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe(errorMessage);
			}
		});

		it("handles unknown errors", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(
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

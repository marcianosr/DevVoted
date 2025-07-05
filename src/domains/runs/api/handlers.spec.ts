import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	getOrCreateActiveRun,
	getUserActiveRun,
	finishUserRun,
} from "./handlers";
import * as queries from "./queries";
import { createMockRun } from "../factories/run";
import { createMockRunCategoryXpArray } from "../factories/runCategoryXp";

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
			const mockRun = createMockRun();
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunWithXp = { run: mockRun, categoryXp: mockXp };

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(mockRun);
			vi.mocked(queries.getRunWithCategoryXp).mockResolvedValue(mockRunWithXp);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockRunWithXp);
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
			expect(queries.getRunWithCategoryXp).toHaveBeenCalledWith(mockRun.id);
			expect(queries.createRunForUser).not.toHaveBeenCalled();
		});

		it("creates new run when no active run exists", async () => {
			const mockRun = createMockRun();
			const mockXp = createMockRunCategoryXpArray(3);
			const mockNewRunData = { run: mockRun, categoryXp: mockXp };

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(null);
			vi.mocked(queries.createRunForUser).mockResolvedValue(mockNewRunData);

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockNewRunData);
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
			expect(queries.createRunForUser).toHaveBeenCalledWith("test-user-id");
			expect(queries.getRunWithCategoryXp).not.toHaveBeenCalled();
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(new Error(errorMessage));

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(false);
			expect(result.error).toBe(errorMessage);
		});

		it("handles unknown errors", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue("Unknown error");

			const result = await getOrCreateActiveRun("test-user-id");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to get or create run");
		});
	});

	describe("getUserActiveRun", () => {
		it("returns active run with XP data", async () => {
			const mockRun = createMockRun();
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunWithXp = { run: mockRun, categoryXp: mockXp };

			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(mockRun);
			vi.mocked(queries.getRunWithCategoryXp).mockResolvedValue(mockRunWithXp);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockRunWithXp);
			expect(queries.getActiveRunByUserId).toHaveBeenCalledWith("test-user-id");
			expect(queries.getRunWithCategoryXp).toHaveBeenCalledWith(mockRun.id);
		});

		it("returns error when no active run found", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockResolvedValue(null);

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			expect(result.error).toBe("No active run found");
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue(new Error(errorMessage));

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			expect(result.error).toBe(errorMessage);
		});

		it("handles unknown errors", async () => {
			vi.mocked(queries.getActiveRunByUserId).mockRejectedValue("Unknown error");

			const result = await getUserActiveRun("test-user-id");

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to get active run");
		});
	});

	describe("finishUserRun", () => {
		it("finishes run successfully", async () => {
			const mockFinishedRun = createMockRun({ status: "finished" });

			vi.mocked(queries.finishRun).mockResolvedValue(mockFinishedRun);

			const result = await finishUserRun(1);

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockFinishedRun);
			expect(queries.finishRun).toHaveBeenCalledWith(1);
		});

		it("returns error when run not found", async () => {
			vi.mocked(queries.finishRun).mockResolvedValue(null);

			const result = await finishUserRun(999);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Run not found");
		});

		it("handles errors gracefully", async () => {
			const errorMessage = "Database connection failed";
			vi.mocked(queries.finishRun).mockRejectedValue(new Error(errorMessage));

			const result = await finishUserRun(1);

			expect(result.success).toBe(false);
			expect(result.error).toBe(errorMessage);
		});

		it("handles unknown errors", async () => {
			vi.mocked(queries.finishRun).mockRejectedValue("Unknown error");

			const result = await finishUserRun(1);

			expect(result.success).toBe(false);
			expect(result.error).toBe("Failed to finish run");
		});
	});
});
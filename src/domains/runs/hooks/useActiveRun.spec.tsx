import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActiveRun } from "./useActiveRun";
import * as runsApi from "~/domains/runs/api/runs";
import { createRun } from "~/domains/runs/models/run";
import { createMockRunCategoryXpArray } from "~/domains/runs/models/runCategoryXp";
import type { RunData } from "./useActiveRun";
import type { ReactNode } from "react";

// Mock the runs API
vi.mock("~/domains/runs/api/runs", () => ({
	getActiveRun: vi.fn(),
	getOrCreateRun: vi.fn(),
}));

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
			mutations: {
				retry: false,
			},
		},
	});

	return ({ children }: { children: ReactNode }) => {
		return (
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		);
	};
};

describe("useActiveRun", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("User has existing quiz session", () => {
		it("loads user's current quiz session when component initializes", async () => {
			const mockRun = createRun({ id: 1, userId: "user123", status: "active" });
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunData: RunData = { run: mockRun, categoryXp: mockXp };

			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: true,
				data: mockRunData,
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.hasActiveRun).toBe(true);
			expect(result.current.activeRun).toEqual(mockRunData);
			expect(result.current.isRunActive).toBe(true);
			expect(result.current.canStartRun).toBe(false);
		});

		it("prevents starting new quiz when user already has active session", async () => {
			const mockRun = createRun({ id: 1, userId: "user123", status: "active" });
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunData: RunData = { run: mockRun, categoryXp: mockXp };

			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: true,
				data: mockRunData,
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.canStartRun).toBe(false);
			expect(result.current.hasActiveRun).toBe(true);
		});
	});

	describe("User has no active quiz session", () => {
		it("enables run creation when user has no active quiz session", async () => {
			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: false,
				error: "No active run found",
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.hasActiveRun).toBe(false);
			expect(result.current.activeRun).toBe(null);
			expect(result.current.canStartRun).toBe(true);
			expect(result.current.isRunActive).toBe(false);
		});

		it("creates new quiz session when user initiates run", async () => {
			const mockRun = createRun({ id: 2, userId: "user123", status: "active" });
			const mockXp = createMockRunCategoryXpArray(3);
			const mockNewRunData: RunData = { run: mockRun, categoryXp: mockXp };

			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: false,
				error: "No active run found",
			});

			vi.mocked(runsApi.getOrCreateRun).mockResolvedValue({
				success: true,
				data: mockNewRunData,
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.canStartRun).toBe(true);

			// Start the run
			result.current.startRun();

			await waitFor(() => {
				expect(runsApi.getOrCreateRun).toHaveBeenCalledWith({
					data: { userId: "user123" },
				});
			});
		});

		it("prevents run creation during session startup process", async () => {
			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: false,
				error: "No active run found",
			});

			vi.mocked(runsApi.getOrCreateRun).mockImplementation(
				() =>
					new Promise((resolve) => {
						setTimeout(() => {
							resolve({
								success: true,
								data: {
									run: createRun({ id: 1, userId: "user123" }),
									categoryXp: [],
								},
							});
						}, 1000);
					})
			);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			// Start the run
			result.current.startRun();

			// During pending state
			await waitFor(() => {
				expect(result.current.isStarting).toBe(true);
			});
			expect(result.current.canStartRun).toBe(false);
		});
	});

	describe("User authentication edge cases", () => {
		it("handles unauthenticated user gracefully", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun(undefined), { wrapper });

			expect(result.current.hasActiveRun).toBe(false);
			expect(result.current.activeRun).toBe(null);
			expect(result.current.canStartRun).toBe(false);
			expect(result.current.isLoading).toBe(false);
		});

		it("prevents session creation for unauthenticated user", () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun(undefined), { wrapper });

			result.current.startRun();

			expect(runsApi.getOrCreateRun).not.toHaveBeenCalled();
		});
	});

	describe("Network error scenarios", () => {
		it("handles server errors when fetching quiz session", async () => {
			const networkError = new Error("Network connection failed");
			vi.mocked(runsApi.getActiveRun).mockRejectedValue(networkError);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.error).toEqual(networkError);
			expect(result.current.hasActiveRun).toBe(false);
			expect(result.current.activeRun).toBe(null);
		});

		it("handles server errors during session creation", async () => {
			const creationError = new Error("Failed to create run");

			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: false,
				error: "No active run found",
			});

			vi.mocked(runsApi.getOrCreateRun).mockRejectedValue(creationError);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			result.current.startRun();

			await waitFor(() => {
				expect(result.current.isStarting).toBe(false);
			});

			expect(result.current.startError).toEqual(creationError);
		});
	});

	describe("Quiz session status detection", () => {
		it("detects finished quiz session correctly", async () => {
			const mockRun = createRun({ id: 1, userId: "user123", status: "finished" });
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunData: RunData = { run: mockRun, categoryXp: mockXp };

			vi.mocked(runsApi.getActiveRun).mockResolvedValue({
				success: true,
				data: mockRunData,
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.hasActiveRun).toBe(true);
			expect(result.current.isRunActive).toBe(false); // Status is finished, not active
			expect(result.current.canStartRun).toBe(false);
		});
	});

	describe("Data refresh functionality", () => {
		it("refreshes quiz session data when requested", async () => {
			const mockRun = createRun({ id: 1, userId: "user123", status: "active" });
			const mockXp = createMockRunCategoryXpArray(3);
			const mockRunData: RunData = { run: mockRun, categoryXp: mockXp };

			const getActiveRunSpy = vi
				.mocked(runsApi.getActiveRun)
				.mockResolvedValue({
					success: true,
					data: mockRunData,
				});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useActiveRun("user123"), { wrapper });

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(getActiveRunSpy).toHaveBeenCalledTimes(1);

			// Trigger refetch
			result.current.refetchRun();

			await waitFor(() => {
				expect(getActiveRunSpy).toHaveBeenCalledTimes(2);
			});
		});
	});
});
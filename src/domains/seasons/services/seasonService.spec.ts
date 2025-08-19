import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	getCurrentSeason,
	getAllSeasons,
	getSeasonById,
	createSeason,
	startSeason,
	finishSeason,
	archiveSeason,
	isSeasonActive,
	isSeasonCurrent,
	getSeasonForNewRun,
} from "./seasonService";
import { createMockSeason } from "../models/season";

// Mock the queries module
vi.mock("../api/queries", () => ({
	findCurrentSeason: vi.fn(),
	findAllSeasons: vi.fn(),
	findSeasonById: vi.fn(),
	insertSeason: vi.fn(),
	updateSeason: vi.fn(),
}));

// Import the mocked queries
import * as seasonQueries from "../api/queries";

describe("Season Service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getCurrentSeason", () => {
		it("returns current season from queries", async () => {
			const mockSeason = createMockSeason();
			vi.mocked(seasonQueries.findCurrentSeason).mockResolvedValue(mockSeason);

			const result = await getCurrentSeason();

			expect(result).toBe(mockSeason);
			expect(seasonQueries.findCurrentSeason).toHaveBeenCalledOnce();
		});

		it("returns null when no current season", async () => {
			vi.mocked(seasonQueries.findCurrentSeason).mockResolvedValue(null);

			const result = await getCurrentSeason();

			expect(result).toBeNull();
		});
	});

	describe("createSeason", () => {
		it("creates season with valid dates", async () => {
			const startDate = new Date("2024-12-13T00:00:00Z");
			const endDate = new Date("2024-12-25T23:59:59Z");
			const mockSeason = createMockSeason({ startDate, endDate });
			
			vi.mocked(seasonQueries.insertSeason).mockResolvedValue(mockSeason);

			const result = await createSeason({
				name: "Holiday Season",
				description: "Christmas themed season",
				startDate,
				endDate,
			});

			expect(result).toBe(mockSeason);
			expect(seasonQueries.insertSeason).toHaveBeenCalledWith({
				name: "Holiday Season",
				description: "Christmas themed season",
				status: "upcoming",
				start_date: startDate,
				end_date: endDate,
			});
		});

		it("throws error for invalid date range", async () => {
			const startDate = new Date("2024-12-25T00:00:00Z");
			const endDate = new Date("2024-12-13T00:00:00Z"); // End before start

			await expect(createSeason({
				name: "Invalid Season",
				startDate,
				endDate,
			})).rejects.toThrow("Season start date must be before end date");
		});

		it("throws error for past end date", async () => {
			const startDate = new Date("2023-01-01T00:00:00Z");
			const endDate = new Date("2023-01-31T00:00:00Z");

			await expect(createSeason({
				name: "Past Season",
				startDate,
				endDate,
			})).rejects.toThrow("Season end date must be in the future");
		});
	});

	describe("startSeason", () => {
		it("starts upcoming season", async () => {
			const upcomingSeason = createMockSeason({
				status: "upcoming",
				startDate: new Date(Date.now() - 86400000), // Yesterday
			});
			const activeSeason = createMockSeason({ ...upcomingSeason, status: "active" });

			vi.mocked(seasonQueries.findSeasonById).mockResolvedValue(upcomingSeason);
			vi.mocked(seasonQueries.updateSeason).mockResolvedValue(activeSeason);

			const result = await startSeason(1);

			expect(result).toBe(activeSeason);
			expect(seasonQueries.updateSeason).toHaveBeenCalledWith(1, { status: "active" });
		});

		it("throws error when starting non-upcoming season", async () => {
			const activeSeason = createMockSeason({ status: "active" });
			vi.mocked(seasonQueries.findSeasonById).mockResolvedValue(activeSeason);

			await expect(startSeason(1)).rejects.toThrow(
				"Cannot start season with status 'active'. Only upcoming seasons can be started."
			);
		});

		it("throws error when starting season too early", async () => {
			const futureSeason = createMockSeason({
				status: "upcoming",
				startDate: new Date(Date.now() + 86400000), // Tomorrow
			});
			vi.mocked(seasonQueries.findSeasonById).mockResolvedValue(futureSeason);

			await expect(startSeason(1)).rejects.toThrow(
				"Cannot start season before its scheduled start date"
			);
		});
	});

	describe("finishSeason", () => {
		it("finishes active season", async () => {
			const activeSeason = createMockSeason({ status: "active" });
			const finishedSeason = createMockSeason({ ...activeSeason, status: "finished" });

			vi.mocked(seasonQueries.findSeasonById).mockResolvedValue(activeSeason);
			vi.mocked(seasonQueries.updateSeason).mockResolvedValue(finishedSeason);

			const result = await finishSeason(1);

			expect(result).toBe(finishedSeason);
			expect(seasonQueries.updateSeason).toHaveBeenCalledWith(1, { status: "finished" });
		});

		it("throws error when finishing non-active season", async () => {
			const upcomingSeason = createMockSeason({ status: "upcoming" });
			vi.mocked(seasonQueries.findSeasonById).mockResolvedValue(upcomingSeason);

			await expect(finishSeason(1)).rejects.toThrow(
				"Cannot finish season with status 'upcoming'. Only active seasons can be finished."
			);
		});
	});

	describe("isSeasonActive", () => {
		it("returns true for active season within date range", () => {
			const activeSeason = createMockSeason({
				status: "active",
				startDate: new Date(Date.now() - 86400000), // Yesterday
				endDate: new Date(Date.now() + 86400000), // Tomorrow
			});

			expect(isSeasonActive(activeSeason)).toBe(true);
		});

		it("returns false for finished season", () => {
			const finishedSeason = createMockSeason({ status: "finished" });
			expect(isSeasonActive(finishedSeason)).toBe(false);
		});

		it("returns false for active season outside date range", () => {
			const pastSeason = createMockSeason({
				status: "active",
				startDate: new Date(Date.now() - 172800000), // 2 days ago
				endDate: new Date(Date.now() - 86400000), // Yesterday
			});

			expect(isSeasonActive(pastSeason)).toBe(false);
		});
	});

	describe("getSeasonForNewRun", () => {
		it("returns current season ID", async () => {
			const currentSeason = createMockSeason({ id: 42 });
			vi.mocked(seasonQueries.findCurrentSeason).mockResolvedValue(currentSeason);

			const result = await getSeasonForNewRun();

			expect(result).toBe(42);
		});

		it("returns null when no current season", async () => {
			vi.mocked(seasonQueries.findCurrentSeason).mockResolvedValue(null);

			const result = await getSeasonForNewRun();

			expect(result).toBeNull();
		});
	});
});
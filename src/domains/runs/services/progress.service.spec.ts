import { describe, it, expect, vi, beforeEach } from "vitest";
import { incrementRunProgress } from "./progress.service";
import { orchestrateScoreCalculation } from "~/domains/score/services/score.service";
import { awardXpToRun } from "../api/queries";
import { createMockRun } from "../models/run";
import { createMockRunCategoryXp } from "../models/runCategoryXp";
import { runCategoryXpFactory } from "../models/runCategoryXp";

vi.mock("~/domains/score/services/score.service");
vi.mock("../api/queries");

describe("incrementRunProgress", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const createTestRun = (activeConfigIds: string[] = []) => {
		return createMockRun({
			activeConfigIds,
			categoryXp: [
				createMockRunCategoryXp({
					id: 1,
					runId: 1,
					categoryCode: "js",
					currentXp: 100,
					currentStreak: 2,
					bestStreak: 5,
					pollsAnswered: 3,
				}),
				createMockRunCategoryXp({
					id: 2,
					runId: 1,
					categoryCode: "css",
					currentXp: 50,
					currentStreak: 1,
					bestStreak: 2,
					pollsAnswered: 2,
				}),
			],
		});
	};

	it("applies config amp bonus when matching config is active", async () => {
		const mockRun = createTestRun([".js", ".css"]);
		const mockCalculationResult = {
			newTotalXP: 150,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				round: 2,
				streak: 3,
				base: 20,
				amp: 1.8, // 1.3 (streak) + 0.5 (config)
				earnedXP: 36,
				delta: 36,
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);
		
		const mockUpdatedRecord = createMockRunCategoryXp({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentXp: 150,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardXpToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
		});

		// Verify orchestrateScoreCalculation was called with config bonus
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith(
			100, // currentXp
			2, // currentStreak
			5, // bestStreak
			5, // totalPollsAnswered (3 + 2)
			1.0, // correctnessFactor
			0.5 // configAmpBonus for .js config
		);
	});

	it("applies no config amp bonus when no matching config", async () => {
		const mockRun = createTestRun([".html", ".css"]); // No .js config
		const mockCalculationResult = {
			newTotalXP: 130,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				round: 2,
				streak: 3,
				base: 20,
				amp: 1.3, // Only streak bonus, no config
				earnedXP: 26,
				delta: 26,
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);
		
		const mockUpdatedRecord = createMockRunCategoryXp({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentXp: 130,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardXpToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
		});

		// Verify no config bonus was applied
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith(
			100, // currentXp
			2, // currentStreak
			5, // bestStreak
			5, // totalPollsAnswered
			1.0, // correctnessFactor
			0 // No config bonus
		);
	});

	it("applies multiple config bonuses when multiple matching configs", async () => {
		// This shouldn't normally happen but let's test the edge case
		const mockRun = createTestRun([".js", ".js"]); // Duplicate configs
		const mockCalculationResult = {
			newTotalXP: 170,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				round: 2,
				streak: 3,
				base: 20,
				amp: 2.3, // 1.3 (streak) + 1.0 (2x config)
				earnedXP: 46,
				delta: 46,
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);
		
		const mockUpdatedRecord = createMockRunCategoryXp({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentXp: 170,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardXpToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
		});

		// Verify double bonus was applied
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith(
			100, // currentXp
			2, // currentStreak
			5, // bestStreak
			5, // totalPollsAnswered
			1.0, // correctnessFactor
			1.0 // Double config bonus (0.5 + 0.5)
		);
	});

	it("correctly maps config IDs to category codes", async () => {
		const testCases = [
			{ configId: ".html", categoryCode: "general-frontend" as const },
			{ configId: ".css", categoryCode: "css" as const },
			{ configId: ".js", categoryCode: "js" as const },
			{ configId: ".ts", categoryCode: "typescript" as const },
			{ configId: ".jsx", categoryCode: "react" as const },
			{ configId: ".git", categoryCode: "general-frontend" as const },
			{ configId: "package.json", categoryCode: "general-frontend" as const },
		];

		for (const testCase of testCases) {
			const mockRun = createMockRun({
				activeConfigIds: [testCase.configId],
				categoryXp: [
					createMockRunCategoryXp({
						id: 1,
						runId: 1,
						categoryCode: testCase.categoryCode,
						currentXp: 100,
						currentStreak: 2,
						bestStreak: 5,
						pollsAnswered: 3,
					}),
					createMockRunCategoryXp({
						id: 2,
						runId: 1,
						categoryCode: "css",
						currentXp: 50,
						currentStreak: 1,
						bestStreak: 2,
						pollsAnswered: 2,
					}),
				],
			});

			const mockCalculationResult = {
				newTotalXP: 150,
				newStreak: 3,
				newBestStreak: 5,
				newPollsAnswered: 6,
				breakdown: {
					round: 2,
					streak: 3,
					base: 20,
					amp: 1.8,
					earnedXP: 36,
					delta: 36,
				},
			};

			vi.mocked(orchestrateScoreCalculation).mockReturnValue(
				mockCalculationResult
			);
			
			const mockUpdatedRecord = createMockRunCategoryXp({
				id: 1,
				runId: 1,
				categoryCode: testCase.categoryCode,
				currentXp: 150,
				currentStreak: 3,
				bestStreak: 5,
				pollsAnswered: 4,
			});
			vi.mocked(awardXpToRun).mockResolvedValue(mockUpdatedRecord);

			await incrementRunProgress({
				categoryCode: testCase.categoryCode,
				run: mockRun,
				correctnessFactor: 1.0,
			});

			expect(orchestrateScoreCalculation).toHaveBeenCalledWith(
				100,
				2,
				5,
				5,
				1.0,
				0.5 // Config bonus should be applied
			);

			vi.clearAllMocks();
		}
	});

	it("throws error when category not found in run", async () => {
		const mockRun = createTestRun();

		await expect(
			incrementRunProgress({
				categoryCode: "nonexistent" as any,
				run: mockRun,
				correctnessFactor: 1.0,
			})
		).rejects.toThrow("Category nonexistent not found");
	});
});
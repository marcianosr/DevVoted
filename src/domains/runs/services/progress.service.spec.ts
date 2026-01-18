import { describe, it, expect, vi, beforeEach } from "vitest";

import { getPollsSeenInRun } from "~/domains/polls/api/queries";
import { createPoll } from "~/domains/polls/models/poll";
import { orchestrateScoreCalculation } from "~/domains/score/services/score.service";

import { incrementRunProgress } from "./progress.service";
import { awardCoverageToRun } from "../api/queries";
import { createMockRun } from "../models/run";
import { createMockRunCategoryCoverage } from "../models/runCategoryCoverage";

vi.mock("~/domains/score/services/score.service");
vi.mock("../api/queries");
vi.mock("~/domains/polls/api/queries", () => ({
	getPollsSeenInRun: vi.fn(),
}));

describe("incrementRunProgress", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default mock: pollsSeenInRun equals totalPollsAnswered
		vi.mocked(getPollsSeenInRun).mockResolvedValue(5);
	});

	const createTestPollContext = (categoryCode: string) => ({
		poll: createPoll({ categoryCode: categoryCode as any }),
		options: [],
		hasAnswered: false,
	});

	const createTestRun = (activeConfigIds: string[] = []) => {
		return createMockRun({
			activeConfigIds,
			categoryCoverage: [
				createMockRunCategoryCoverage({
					id: 1,
					runId: 1,
					categoryCode: "js",
					currentCoverage: 10,
					currentStreak: 2,
					bestStreak: 5,
					pollsAnswered: 3,
				}),
				createMockRunCategoryCoverage({
					id: 2,
					runId: 1,
					categoryCode: "css",
					currentCoverage: 5,
					currentStreak: 1,
					bestStreak: 2,
					pollsAnswered: 2,
				}),
			],
		});
	};

	it("applies config coverage bonus when matching config is active", async () => {
		const mockRun = createTestRun([".js-config", ".css-config"]);
		const pollContext = createTestPollContext("js");
		const mockCalculationResult = {
			newTotalCoverage: 13,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				streak: 3,
				earnedCoverage: 3,
				delta: 3,
				baseCoverage: 2,
				streakBonus: 0.5,
				configBonus: 0.5,
				configInfluences: [],
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);

		const mockUpdatedRecord = createMockRunCategoryCoverage({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentCoverage: 13,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardCoverageToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
			...pollContext,
		});

		// Verify orchestrateScoreCalculation was called with config bonus
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith({
			currentCoverage: 10,
			currentStreak: 2,
			currentBestStreak: 5,
			totalPollsAnswered: 5, // 3 + 2
			totalPollsSeen: 5,
			correctnessFactor: 1.0,
			coverageAdd: 2, // Config coverage bonus for .js config
			coverageMult: 1,
			pollsPerGate: 5,
			configInfluences: expect.any(Array),
		});
	});

	it("applies no config coverage bonus when no matching config", async () => {
		const mockRun = createTestRun([".html-config", ".css-config"]); // No .js config
		const pollContext = createTestPollContext("js");
		const mockCalculationResult = {
			newTotalCoverage: 12,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				streak: 3,
				earnedCoverage: 2,
				delta: 2,
				baseCoverage: 1.6,
				streakBonus: 0.4,
				configBonus: 0,
				configInfluences: [],
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);

		const mockUpdatedRecord = createMockRunCategoryCoverage({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentCoverage: 12,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardCoverageToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
			...pollContext,
		});

		// Verify no config bonus was applied
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith({
			currentCoverage: 10,
			currentStreak: 2,
			currentBestStreak: 5,
			totalPollsAnswered: 5,
			totalPollsSeen: 5,
			correctnessFactor: 1.0,
			coverageAdd: 0, // No config bonus
			coverageMult: 1,
			pollsPerGate: 5,
			configInfluences: expect.any(Array),
		});
	});

	it("handles negative coverage for wrong answers", async () => {
		const mockRun = createTestRun([".js-config", ".css-config"]);
		const pollContext = createTestPollContext("js");
		const mockCalculationResult = {
			newTotalCoverage: 10, // 10 + 0 = 10 (penalty rounded to 0)
			newStreak: 0, // Streak reset on wrong answer
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				streak: 0,
				earnedCoverage: 0, // -0.5 rounds to 0
				delta: 0,
				baseCoverage: 0,
				streakBonus: 0,
				configBonus: 0,
				configInfluences: [],
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);

		const mockUpdatedRecord = createMockRunCategoryCoverage({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentCoverage: 10,
			currentStreak: 0,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardCoverageToRun).mockResolvedValue(mockUpdatedRecord);

		const result = await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 0, // Wrong answer
			...pollContext,
		});

		expect(result.newStreak).toBe(0);
		expect(result.breakdown.earnedCoverage).toBe(0);
	});

	it("applies multiple config bonuses when multiple matching configs", async () => {
		// This shouldn't normally happen but let's test the edge case
		const mockRun = createTestRun([".js-config", ".js-config"]); // Duplicate configs
		const pollContext = createTestPollContext("js");
		const mockCalculationResult = {
			newTotalCoverage: 14,
			newStreak: 3,
			newBestStreak: 5,
			newPollsAnswered: 6,
			breakdown: {
				streak: 3,
				earnedCoverage: 4,
				delta: 4,
				baseCoverage: 2,
				streakBonus: 0.5,
				configBonus: 1.5,
				configInfluences: [],
			},
		};

		vi.mocked(orchestrateScoreCalculation).mockReturnValue(
			mockCalculationResult
		);

		const mockUpdatedRecord = createMockRunCategoryCoverage({
			id: 1,
			runId: 1,
			categoryCode: "js",
			currentCoverage: 14,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 4,
		});
		vi.mocked(awardCoverageToRun).mockResolvedValue(mockUpdatedRecord);

		await incrementRunProgress({
			categoryCode: "js",
			run: mockRun,
			correctnessFactor: 1.0,
			...pollContext,
		});

		// Verify double bonus was applied
		expect(orchestrateScoreCalculation).toHaveBeenCalledWith({
			currentCoverage: 10,
			currentStreak: 2,
			currentBestStreak: 5,
			totalPollsAnswered: 5,
			totalPollsSeen: 5,
			correctnessFactor: 1.0,
			coverageAdd: 4, // Double config bonus (0.5 + 0.5)
			coverageMult: 1,
			pollsPerGate: 5,
			configInfluences: expect.any(Array),
		});
	});

	it("correctly maps config IDs to category codes", async () => {
		// TODO: Fix with general mapping
		const testCases = [
			{ configId: ".html-config", categoryCode: "html" as const },
			{ configId: ".css-config", categoryCode: "css" as const },
			{ configId: ".js-config", categoryCode: "js" as const },
			{ configId: ".ts-config", categoryCode: "ts" as const },
			{ configId: ".jsx-config", categoryCode: "react" as const },
			{ configId: ".git-config", categoryCode: "git" as const },
			{
				configId: "package.json-config",
				categoryCode: "general-frontend" as const,
			},
		];
		for (const testCase of testCases) {
			const mockRun = createMockRun({
				activeConfigIds: [testCase.configId],
				categoryCoverage: [
					createMockRunCategoryCoverage({
						id: 1,
						runId: 1,
						categoryCode: testCase.categoryCode,
						currentCoverage: 10,
						currentStreak: 2,
						bestStreak: 5,
						pollsAnswered: 3,
					}),
					createMockRunCategoryCoverage({
						id: 2,
						runId: 1,
						categoryCode: "css",
						currentCoverage: 5,
						currentStreak: 1,
						bestStreak: 2,
						pollsAnswered: 2,
					}),
				],
			});

			const pollContext = createTestPollContext(testCase.categoryCode);
			const mockCalculationResult = {
				newTotalCoverage: 13,
				newStreak: 3,
				newBestStreak: 5,
				newPollsAnswered: 6,
				breakdown: {
					streak: 3,
					earnedCoverage: 3,
					delta: 3,
					baseCoverage: 2,
					streakBonus: 0.5,
					configBonus: 0.5,
					configInfluences: [],
				},
			};

			vi.mocked(orchestrateScoreCalculation).mockReturnValue(
				mockCalculationResult
			);

			const mockUpdatedRecord = createMockRunCategoryCoverage({
				id: 1,
				runId: 1,
				categoryCode: testCase.categoryCode,
				currentCoverage: 13,
				currentStreak: 3,
				bestStreak: 5,
				pollsAnswered: 4,
			});
			vi.mocked(awardCoverageToRun).mockResolvedValue(mockUpdatedRecord);

			await incrementRunProgress({
				categoryCode: testCase.categoryCode,
				run: mockRun,
				correctnessFactor: 1.0,
				...pollContext,
			});

			expect(orchestrateScoreCalculation).toHaveBeenCalledWith({
				currentCoverage: 10,
				currentStreak: 2,
				currentBestStreak: 5,
				totalPollsAnswered: 5,
				totalPollsSeen: 5,
				correctnessFactor: 1.0,
				coverageAdd: 2, // Config bonus should be applied
				coverageMult: 1,
				pollsPerGate: 5,
				configInfluences: expect.any(Array),
			});

			vi.clearAllMocks();
		}
	});

	it("throws error when category not found in run", async () => {
		const mockRun = createTestRun();
		const pollContext = createTestPollContext("nonexistent");

		await expect(
			incrementRunProgress({
				categoryCode: "nonexistent" as any,
				run: mockRun,
				correctnessFactor: 1.0,
				...pollContext,
			})
		).rejects.toThrow("Category nonexistent not found");
	});
});

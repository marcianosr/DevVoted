import { describe, it, expect } from "vitest";
import { calculateThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

describe("CI gate Reset Functionality", () => {
	describe("calculateThresholdInfo", () => {
		it("returns Gate 1 threshold (2% coverage) when no polls have been answered", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
			];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(0);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Gate 1 threshold (2% coverage) when max polls answered is 1", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 2,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
			];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(1);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(2);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("checks Gate 1 threshold at poll 5 (threshold check poll)", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 1,
					currentStreak: 3,
					bestStreak: 3,
					pollsAnswered: 3,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 1,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 1,
				}),
			];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(5); // Total polls answered
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(1);
			expect(result.meetsThreshold).toBe(false); // Threshold check poll at 5, fails with 1 < 2
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(5);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("meets threshold when total coverage equals required coverage on non-threshold poll", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 2,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				}),
			];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(1);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(2);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles threshold check poll (poll 5) with sufficient coverage", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 2,
					currentStreak: 2,
					bestStreak: 2,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "css",
					currentCoverage: 2,
					currentStreak: 2,
					bestStreak: 2,
					pollsAnswered: 2,
				}),
				createMockRunCategoryCoverage({
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 1,
				}),
			];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(5); // Total polls answered
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(2);
			expect(result.meetsThreshold).toBe(true); // 2 >= 2, threshold check passes
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(5);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("handles empty categoryCoverage array", () => {
			const categoryCoverage: any[] = [];

			const totalPollsSeen = categoryCoverage.reduce((sum, c) => sum + c.pollsAnswered, 0);
			const result = calculateThresholdInfo(categoryCoverage, totalPollsSeen);

			expect(result.pollNumber).toBe(0);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(2); // Gate 1 threshold (2%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});
});

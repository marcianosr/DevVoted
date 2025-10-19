import { describe, it, expect } from "vitest";
import { calculateThresholdInfo } from "~/domains/runs/services/thresholdCalculator.service";
import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage";

describe("Threshold Reset Functionality", () => {
	describe("calculateThresholdInfo", () => {
		it("returns Gate 1 threshold (4% coverage) when no polls have been answered", () => {
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

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(0);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Gate 1 threshold (4% coverage) when max polls answered is 1", () => {
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

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(1);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(2);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("checks Gate 1 threshold at poll 3 (threshold check poll)", () => {
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
					pollsAnswered: 0,
				}),
			];

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(3); // Total polls answered
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(2);
			expect(result.meetsThreshold).toBe(false); // Threshold check poll at 3, fails with 2 < 4
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("meets threshold when total coverage equals required coverage on non-threshold poll", () => {
			const categoryCoverage = [
				createMockRunCategoryCoverage({
					categoryCode: "js",
					currentCoverage: 4,
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

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(1);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(4);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles threshold check poll (poll 3) with sufficient coverage", () => {
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
					currentCoverage: 4,
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

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(3); // Total polls answered
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(4);
			expect(result.meetsThreshold).toBe(true); // 4 >= 4, threshold check passes
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("handles empty categoryCoverage array", () => {
			const categoryCoverage: any[] = [];

			const result = calculateThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(0);
			expect(result.gateDefinition?.requirements[0].threshold).toBe(4); // Gate 1 threshold (4%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});
});

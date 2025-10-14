import { describe, it, expect } from "vitest";
import { getCurrentThresholdInfo } from "@/src/domains/runs/services/thresholdCalculator.service";

describe("Threshold Reset Functionality", () => {
	describe("getCurrentThresholdInfo", () => {
		it("returns Set 1 threshold (10% coverage) when no polls have been answered", () => {
			const categoryCoverage = [
				{
					categoryCode: "js",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(0);
			expect(result.requiredCoverage).toBe(10); // Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Set 1 threshold (10% coverage) when max polls answered is 1", () => {
			const categoryCoverage = [
				{
					categoryCode: "js",
					currentCoverage: 5,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredCoverage).toBe(10); // Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(5);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Set 2 threshold (20% coverage) when total polls answered is 3", () => {
			const categoryCoverage = [
				{
					categoryCode: "js",
					currentCoverage: 5,
					currentStreak: 2,
					bestStreak: 2,
					pollsAnswered: 2,
				},
				{
					categoryCode: "css",
					currentCoverage: 2,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(3); // Total polls answered
			expect(result.requiredCoverage).toBe(10); // Still Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(5);
			expect(result.meetsThreshold).toBe(false); // Threshold check poll at 3, fails with 5 < 10
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("meets threshold when total coverage equals required coverage on non-threshold poll", () => {
			const categoryCoverage = [
				{
					categoryCode: "js",
					currentCoverage: 10,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredCoverage).toBe(10); // Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(10);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles threshold check poll (poll 3) with sufficient coverage", () => {
			const categoryCoverage = [
				{
					categoryCode: "js",
					currentCoverage: 5,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentCoverage: 10,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "html",
					currentCoverage: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 1,
				},
			];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(3); // Total polls answered
			expect(result.requiredCoverage).toBe(10); // Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(10);
			expect(result.meetsThreshold).toBe(true); // 10 >= 10, threshold check passes
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("handles empty categoryCoverage array", () => {
			const categoryCoverage: any[] = [];

			const result = getCurrentThresholdInfo(categoryCoverage);

			expect(result.pollNumber).toBe(0);
			expect(result.requiredCoverage).toBe(10); // Set 1 threshold (10%)
			expect(result.maxCoverage).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentRound).toBe(1);
			expect(result.pollInRound).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});
});

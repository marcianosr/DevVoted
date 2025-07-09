import { describe, it, expect } from "vitest";
import { getCurrentThresholdInfo } from "./queries";

describe("Threshold Reset Functionality", () => {
	describe("getCurrentThresholdInfo", () => {
		it("returns Poll #1 threshold (5 XP) when no polls have been answered", () => {
			const categoryXp = [
				{ categoryCode: "js", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
				{ categoryCode: "css", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
				{ categoryCode: "html", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredXp).toBe(5);
			expect(result.currentXp).toBe(0);
			expect(result.meetsThreshold).toBe(false);
		});

		it("returns Poll #2 threshold (7 XP) when max polls answered is 1", () => {
			const categoryXp = [
				{ categoryCode: "js", currentXp: 5, currentStreak: 1, bestStreak: 1, pollsAnswered: 1 },
				{ categoryCode: "css", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
				{ categoryCode: "html", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(2);
			expect(result.requiredXp).toBe(7);
			expect(result.currentXp).toBe(5);
			expect(result.meetsThreshold).toBe(false);
		});

		it("returns Poll #4 threshold (11 XP) when total polls answered is 3", () => {
			const categoryXp = [
				{ categoryCode: "js", currentXp: 5, currentStreak: 2, bestStreak: 2, pollsAnswered: 2 },
				{ categoryCode: "css", currentXp: 2, currentStreak: 1, bestStreak: 1, pollsAnswered: 1 },
				{ categoryCode: "html", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(4); // Next poll after 3 total polls answered
			expect(result.requiredXp).toBe(11); // Poll #4 threshold: 5 + (4-1)*2 = 11
			expect(result.currentXp).toBe(7);
			expect(result.meetsThreshold).toBe(false);
		});

		it("meets threshold when total XP equals required XP", () => {
			const categoryXp = [
				{ categoryCode: "js", currentXp: 5, currentStreak: 1, bestStreak: 1, pollsAnswered: 1 },
				{ categoryCode: "css", currentXp: 2, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
				{ categoryCode: "html", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(2);
			expect(result.requiredXp).toBe(7);
			expect(result.currentXp).toBe(7);
			expect(result.meetsThreshold).toBe(true);
		});

		it("meets threshold when total XP exceeds required XP", () => {
			const categoryXp = [
				{ categoryCode: "js", currentXp: 5, currentStreak: 1, bestStreak: 1, pollsAnswered: 1 },
				{ categoryCode: "css", currentXp: 3, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
				{ categoryCode: "html", currentXp: 0, currentStreak: 0, bestStreak: 0, pollsAnswered: 0 },
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(2);
			expect(result.requiredXp).toBe(7);
			expect(result.currentXp).toBe(8);
			expect(result.meetsThreshold).toBe(true);
		});

		it("handles empty categoryXp array", () => {
			const categoryXp: any[] = [];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredXp).toBe(5);
			expect(result.currentXp).toBe(0);
			expect(result.meetsThreshold).toBe(false);
		});
	});
});
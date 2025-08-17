import { describe, it, expect } from "vitest";
import { getCurrentThresholdInfo } from "@/src/domains/runs/services/thresholdCalculator.service";

describe("Threshold Reset Functionality", () => {
	describe("getCurrentThresholdInfo", () => {
		it("returns Set 1 threshold (15 XP) when no polls have been answered", () => {
			const categoryXp = [
				{
					categoryCode: "js",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "css",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredXp).toBe(15); // Set 1 threshold
			expect(result.currentXp).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentSet).toBe(1);
			expect(result.pollInSet).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Set 1 threshold (15 XP) when max polls answered is 1", () => {
			const categoryXp = [
				{
					categoryCode: "js",
					currentXp: 5,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(2);
			expect(result.requiredXp).toBe(15); // Set 1 threshold
			expect(result.currentXp).toBe(5);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentSet).toBe(1);
			expect(result.pollInSet).toBe(2);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("returns Set 2 threshold (21 XP) when total polls answered is 3", () => {
			const categoryXp = [
				{
					categoryCode: "js",
					currentXp: 5,
					currentStreak: 2,
					bestStreak: 2,
					pollsAnswered: 2,
				},
				{
					categoryCode: "css",
					currentXp: 2,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "html",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(4); // Next poll after 3 total polls answered
			expect(result.requiredXp).toBe(21); // Set 2 threshold
			expect(result.currentXp).toBe(7);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentSet).toBe(2);
			expect(result.pollInSet).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("meets threshold when total XP equals required XP on non-threshold poll", () => {
			const categoryXp = [
				{
					categoryCode: "js",
					currentXp: 5,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentXp: 2,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
				{
					categoryCode: "html",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(2);
			expect(result.requiredXp).toBe(15); // Set 1 threshold
			expect(result.currentXp).toBe(7);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentSet).toBe(1);
			expect(result.pollInSet).toBe(2);
			expect(result.isThresholdCheckPoll).toBe(false);
		});

		it("handles threshold check poll (poll 3) with sufficient XP", () => {
			const categoryXp = [
				{
					categoryCode: "js",
					currentXp: 8,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "css",
					currentXp: 7,
					currentStreak: 1,
					bestStreak: 1,
					pollsAnswered: 1,
				},
				{
					categoryCode: "html",
					currentXp: 0,
					currentStreak: 0,
					bestStreak: 0,
					pollsAnswered: 0,
				},
			];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(3); // Next poll after 2 total polls answered
			expect(result.requiredXp).toBe(15); // Set 1 threshold
			expect(result.currentXp).toBe(15);
			expect(result.meetsThreshold).toBe(true); // 15 >= 15, threshold check passes
			expect(result.currentSet).toBe(1);
			expect(result.pollInSet).toBe(3);
			expect(result.isThresholdCheckPoll).toBe(true);
		});

		it("handles empty categoryXp array", () => {
			const categoryXp: any[] = [];

			const result = getCurrentThresholdInfo(categoryXp);

			expect(result.pollNumber).toBe(1);
			expect(result.requiredXp).toBe(15); // Set 1 threshold
			expect(result.currentXp).toBe(0);
			expect(result.meetsThreshold).toBe(true); // Not a threshold check poll
			expect(result.currentSet).toBe(1);
			expect(result.pollInSet).toBe(1);
			expect(result.isThresholdCheckPoll).toBe(false);
		});
	});
});

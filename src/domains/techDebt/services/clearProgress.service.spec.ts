import { describe, expect, it } from "vitest";

import { TechDebtTemplate } from "~/domains/techDebt/models/techDebt.model";

import { createInitialClearProgress } from "./clearProgress.service";

const templateWith = (
	clearCondition: TechDebtTemplate["clearCondition"]
): TechDebtTemplate => ({
	id: "flaky-suite",
	name: "Test",
	description: "Banjo would not approve",
	debuff: { kind: "shopLocked" },
	clearCondition,
});

describe("createInitialClearProgress", () => {
	it("zeroes a coverageGain counter", () => {
		const progress = createInitialClearProgress(
			templateWith({ kind: "coverageGain", targetPercent: 15 })
		);
		expect(progress).toEqual({ kind: "coverageGain", gainedPercent: 0 });
	});

	it("starts singleCategoryCoverageGain with an empty per-category map", () => {
		const progress = createInitialClearProgress(
			templateWith({
				kind: "singleCategoryCoverageGain",
				targetPercent: 10,
			})
		);
		expect(progress).toEqual({
			kind: "singleCategoryCoverageGain",
			gainedByCategory: {},
		});
	});

	it("zeroes correctAnswerStreakOrTotal counters", () => {
		const progress = createInitialClearProgress(
			templateWith({
				kind: "correctAnswerStreakOrTotal",
				streakTarget: 5,
				totalTarget: 15,
			})
		);
		expect(progress).toEqual({
			kind: "correctAnswerStreakOrTotal",
			currentStreak: 0,
			totalCorrect: 0,
		});
	});

	it("zeroes pipelinesCompleted", () => {
		const progress = createInitialClearProgress(
			templateWith({ kind: "pipelinesCompleted", target: 1 })
		);
		expect(progress).toEqual({ kind: "pipelinesCompleted", completed: 0 });
	});

	it("zeroes firstAnswers", () => {
		const progress = createInitialClearProgress(
			templateWith({ kind: "firstAnswers", target: 3 })
		);
		expect(progress).toEqual({ kind: "firstAnswers", firsts: 0 });
	});

	it("zeroes rerollStorageSpent", () => {
		const progress = createInitialClearProgress(
			templateWith({ kind: "rerollStorageSpent", targetBytes: 3072 })
		);
		expect(progress).toEqual({ kind: "rerollStorageSpent", spentBytes: 0 });
	});
});

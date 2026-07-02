import { describe, expect, it } from "vitest";

import { createMockConfig } from "~/domains/economy/models/config.mock";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";

import {
	buildAnswerReview,
	buildScoreSummary,
	evaluateSelectionOutcome,
} from "./pollResult";

const option = (optionId: number, optionText: string, isCorrect: boolean) => ({
	optionId,
	optionText,
	isCorrect,
});

describe(evaluateSelectionOutcome.name, () => {
	const breakdown = [
		option(1, "Banjo", true),
		option(2, "Kazooie", true),
		option(3, "Gruntilda", false),
	];

	it("is full when all correct options and no wrong ones are picked", () => {
		expect(evaluateSelectionOutcome(breakdown, ["1", "2"])).toBe("full");
	});

	it("is partial when only some correct options are picked", () => {
		expect(evaluateSelectionOutcome(breakdown, ["1"])).toBe("partial");
	});

	it("is wrong when a correct and an incorrect option are both picked", () => {
		// A wrong pick alongside a correct one is not fully correct; still counts
		// a correct selection so it is 'partial', not 'wrong'.
		expect(evaluateSelectionOutcome(breakdown, ["1", "3"])).toBe("partial");
	});

	it("is wrong when only an incorrect option is picked", () => {
		expect(evaluateSelectionOutcome(breakdown, ["3"])).toBe("wrong");
	});
});

describe(buildAnswerReview.name, () => {
	it("maps each option with its correctness and whether it was your pick", () => {
		const breakdown = [option(1, "Banjo", true), option(2, "Kazooie", false)];
		const rows = buildAnswerReview(breakdown, ["1"]);

		expect(rows).toEqual([
			{ id: "1", text: "Banjo", correct: true, isYours: true },
			{ id: "2", text: "Kazooie", correct: false, isYours: false },
		]);
	});
});

describe(buildScoreSummary.name, () => {
	it("breaks a correct score into base coverage, named bonuses and totals", () => {
		const score: ScoreCalculation = {
			newTotalCoverage: 44,
			newBestStreak: 5,
			newStreak: 3,
			newPollsAnswered: 18,
			breakdown: {
				streak: 3,
				earnedCoverage: 1.9,
				delta: 1.9,
				baseCoverage: 1.2,
				streakBonus: 0.3,
				configBonus: 0.4,
			},
		};
		const codeCoverage = createMockConfig({
			id: "code-coverage-config",
			name: "Code Coverage",
		});

		const summary = buildScoreSummary(
			score,
			[{ configId: "code-coverage-config", coverageAdd: 0.4, coverageMult: 1 }],
			[codeCoverage]
		);

		expect(summary).toEqual({
			isCorrect: true,
			baseCoverage: 1.2,
			bonuses: [
				{
					label: "Code Coverage",
					value: 0.4,
					rarity: codeCoverage.rarity,
					description: codeCoverage.description,
				},
				{ label: "Streak 3×", value: 0.3 },
			],
			earnedCoverage: 1.9,
			previousCoverage: 42.1,
			newTotalCoverage: 44,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 18,
		});
	});

	it("marks a wrong answer with no bonuses and a broken streak", () => {
		const score: ScoreCalculation = {
			newTotalCoverage: 44,
			newBestStreak: 5,
			newStreak: 0,
			newPollsAnswered: 19,
			breakdown: {
				streak: 0,
				earnedCoverage: 0,
				delta: 0,
				baseCoverage: 0,
				streakBonus: 0,
				configBonus: 0,
			},
		};

		const summary = buildScoreSummary(score, [], []);

		expect(summary.isCorrect).toBe(false);
		expect(summary.bonuses).toEqual([]);
		expect(summary.earnedCoverage).toBe(0);
		expect(summary.currentStreak).toBe(0);
	});
});

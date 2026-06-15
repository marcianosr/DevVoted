import { describe, expect, it } from "vitest";

import { ActiveTechDebt } from "~/domains/techDebt/models/techDebt.model";

import { advanceTechDebtsOnPollAnswer } from "./advanceProgress.service";

const flakySuite = (
	currentStreak: number,
	totalCorrect: number
): ActiveTechDebt => ({
	id: 1,
	runId: 13,
	templateId: "flaky-suite",
	acquiredAt: new Date("2026-05-13T00:00:00Z"),
	progress: {
		kind: "correctAnswerStreakOrTotal",
		currentStreak,
		totalCorrect,
	},
});

describe("advanceTechDebtsOnPollAnswer", () => {
	it("increments both counters on a correct answer", () => {
		const [outcome] = advanceTechDebtsOnPollAnswer([flakySuite(2, 4)], {
			kind: "pollAnswer",
			isCorrect: true,
		});
		expect(outcome.nextProgress).toEqual({
			kind: "correctAnswerStreakOrTotal",
			currentStreak: 3,
			totalCorrect: 5,
		});
		expect(outcome.cleared).toBe(false);
	});

	it("resets streak but preserves total on an incorrect answer", () => {
		const [outcome] = advanceTechDebtsOnPollAnswer([flakySuite(3, 7)], {
			kind: "pollAnswer",
			isCorrect: false,
		});
		expect(outcome.nextProgress).toEqual({
			kind: "correctAnswerStreakOrTotal",
			currentStreak: 0,
			totalCorrect: 7,
		});
		expect(outcome.cleared).toBe(false);
	});

	it("clears Flaky Suite when streak reaches 5", () => {
		const [outcome] = advanceTechDebtsOnPollAnswer([flakySuite(4, 4)], {
			kind: "pollAnswer",
			isCorrect: true,
		});
		expect(outcome.cleared).toBe(true);
	});

	it("clears Flaky Suite when total reaches 15 even without a streak", () => {
		const [outcome] = advanceTechDebtsOnPollAnswer([flakySuite(0, 14)], {
			kind: "pollAnswer",
			isCorrect: true,
		});
		expect(outcome.nextProgress).toEqual({
			kind: "correctAnswerStreakOrTotal",
			currentStreak: 1,
			totalCorrect: 15,
		});
		expect(outcome.cleared).toBe(true);
	});

	it("leaves non-poll-answer-listening Tech Debts untouched", () => {
		const legacyModule: ActiveTechDebt = {
			id: 2,
			runId: 13,
			templateId: "legacy-module",
			acquiredAt: new Date("2026-05-13T00:00:00Z"),
			progress: { kind: "coverageGain", gainedPercent: 5 },
		};
		const [outcome] = advanceTechDebtsOnPollAnswer([legacyModule], {
			kind: "pollAnswer",
			isCorrect: true,
		});
		expect(outcome.nextProgress).toBe(legacyModule.progress);
		expect(outcome.cleared).toBe(false);
	});
});

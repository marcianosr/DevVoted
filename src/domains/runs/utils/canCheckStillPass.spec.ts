import { describe, expect, it } from "vitest";

import type {
	CategoryMasteryRequirement,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

import { canCheckStillPass } from "./canCheckStillPass";

const makeContext = (
	overrides: Partial<PipelineEvaluationContext> = {}
): PipelineEvaluationContext => ({
	correctAnswersInWindow: 0,
	pollsAnsweredInWindow: 0,
	coverageGainedInWindow: 0,
	currentStreakAtWindowEnd: 0,
	pollsInWindow: 5,
	currentGate: 1,
	firstConsecutiveCorrectFromWindowStart: 0,
	...overrides,
});

describe("canCheckStillPass", () => {
	describe("cold-start", () => {
		const req: PipelineSlotRequirement = { type: "cold-start", count: 1 };

		it("is lost once the leading streak breaks below the count", () => {
			// Poll 3, first poll was wrong: 0 correct start, streak frozen at 0.
			const ctx = makeContext({
				pollsAnsweredInWindow: 3,
				firstConsecutiveCorrectFromWindowStart: 0,
			});
			expect(canCheckStillPass(req, ctx)).toBe(false);
		});

		it("is still possible at the window start before any poll is answered", () => {
			expect(canCheckStillPass(req, makeContext())).toBe(true);
		});

		it("is still possible while the streak is unbroken but below target", () => {
			const req3: PipelineSlotRequirement = { type: "cold-start", count: 3 };
			const ctx = makeContext({
				pollsAnsweredInWindow: 2,
				firstConsecutiveCorrectFromWindowStart: 2,
			});
			expect(canCheckStillPass(req3, ctx)).toBe(true);
		});

		it("remains passable once the target is already met", () => {
			const ctx = makeContext({
				pollsAnsweredInWindow: 3,
				firstConsecutiveCorrectFromWindowStart: 1,
			});
			expect(canCheckStillPass(req, ctx)).toBe(true);
		});
	});

	describe("correct-answers", () => {
		const req: PipelineSlotRequirement = { type: "correct-answers", count: 3 };

		it("is lost when even all remaining polls can't reach the count", () => {
			// 4 answered, 0 correct, 1 poll left → max 1 < 3.
			const ctx = makeContext({
				pollsAnsweredInWindow: 4,
				correctAnswersInWindow: 0,
			});
			expect(canCheckStillPass(req, ctx)).toBe(false);
		});

		it("is still possible while remaining polls could reach the count", () => {
			const ctx = makeContext({
				pollsAnsweredInWindow: 2,
				correctAnswersInWindow: 1,
			});
			expect(canCheckStillPass(req, ctx)).toBe(true);
		});
	});

	describe("short-window", () => {
		it("never locks out when only answering polls is required", () => {
			const req: PipelineSlotRequirement = {
				type: "short-window",
				pollCount: 4,
			};
			const ctx = makeContext({ pollsInWindow: 4, pollsAnsweredInWindow: 4 });
			expect(canCheckStillPass(req, ctx)).toBe(true);
		});

		it("is lost when all-correct is required and a wrong answer makes it unreachable", () => {
			const req: PipelineSlotRequirement = {
				type: "short-window",
				pollCount: 4,
				correctRequired: 4,
			};
			const ctx = makeContext({
				pollsInWindow: 4,
				pollsAnsweredInWindow: 2,
				correctAnswersInWindow: 1,
			});
			expect(canCheckStillPass(req, ctx)).toBe(false);
		});
	});

	describe("category-mastery", () => {
		it("is lost for a critical check once an appeared poll was wrong", () => {
			const req: CategoryMasteryRequirement = {
				type: "category-mastery",
				category: "js",
				minCorrect: null,
			};
			const ctx = makeContext({
				categoryPollResults: { js: { appeared: 2, correct: 1 } },
			});
			expect(canCheckStillPass(req, ctx)).toBe(false);
		});

		it("stays possible for a critical check while every appearance is correct", () => {
			const req: CategoryMasteryRequirement = {
				type: "category-mastery",
				category: "react",
				minCorrect: null,
			};
			const ctx = makeContext({
				categoryPollResults: { react: { appeared: 2, correct: 2 } },
			});
			expect(canCheckStillPass(req, ctx)).toBe(true);
		});

		it("does not warn for a numeric target with unpredictable appearances", () => {
			const req: CategoryMasteryRequirement = {
				type: "category-mastery",
				category: "python",
				minCorrect: 2,
			};
			const ctx = makeContext({
				categoryPollResults: { python: { appeared: 3, correct: 0 } },
			});
			expect(canCheckStillPass(req, ctx)).toBe(true);
		});
	});

	it("never locks out a coverage-gain check", () => {
		const req: PipelineSlotRequirement = {
			type: "coverage-gain",
			threshold: 10,
		};
		const ctx = makeContext({
			pollsAnsweredInWindow: 5,
			coverageGainedInWindow: 0,
		});
		expect(canCheckStillPass(req, ctx)).toBe(true);
	});
});

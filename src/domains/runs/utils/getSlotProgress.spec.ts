import { describe, expect, it } from "vitest";

import type {
	CategoryMasteryRequirement,
	PipelineSlotRequirement,
} from "~/domains/runs/models/pipeline.model";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

import { getSlotProgress } from "./getSlotProgress";

const makeContext = (
	overrides: Partial<PipelineEvaluationContext> = {}
): PipelineEvaluationContext => ({
	correctAnswersInWindow: 3,
	pollsAnsweredInWindow: 4,
	coverageGainedInWindow: 7.5,
	currentStreakAtWindowEnd: 3,
	pollsInWindow: 5,
	currentGate: 1,
	firstConsecutiveCorrectFromWindowStart: 2,
	...overrides,
});

describe("getSlotProgress", () => {
	it("maps correct-answers to correct count against the required count", () => {
		const req: PipelineSlotRequirement = { type: "correct-answers", count: 4 };
		expect(getSlotProgress(req, makeContext())).toEqual({
			current: 3,
			target: 4,
			suffix: "correct",
			seen: true,
		});
	});

	it("maps coverage-gain to coverage gained against the threshold", () => {
		const req: PipelineSlotRequirement = {
			type: "coverage-gain",
			threshold: 10,
		};
		expect(getSlotProgress(req, makeContext())).toEqual({
			current: 7.5,
			target: 10,
			suffix: "%",
			seen: true,
		});
	});

	it("maps short-window to polls answered against the window size", () => {
		const req: PipelineSlotRequirement = { type: "short-window", pollCount: 4 };
		expect(getSlotProgress(req, makeContext())).toEqual({
			current: 4,
			target: 4,
			suffix: "answered",
			seen: true,
		});
	});

	it("maps cold-start to the leading correct streak against the required count", () => {
		const req: PipelineSlotRequirement = { type: "cold-start", count: 3 };
		expect(getSlotProgress(req, makeContext())).toEqual({
			current: 2,
			target: 3,
			suffix: "correct start",
			seen: true,
		});
	});

	it("maps category-mastery to correct-in-category against the required minimum", () => {
		const req: CategoryMasteryRequirement = {
			type: "category-mastery",
			category: "js",
			minCorrect: 2,
		};
		const ctx = makeContext({
			categoryPollResults: { js: { appeared: 3, correct: 1 } },
		});
		expect(getSlotProgress(req, ctx)).toEqual({
			current: 1,
			target: 2,
			suffix: "correct",
			seen: true,
		});
	});

	it("targets appeared count for critical category-mastery (minCorrect null)", () => {
		const req: CategoryMasteryRequirement = {
			type: "category-mastery",
			category: "react",
			minCorrect: null,
		};
		const ctx = makeContext({
			categoryPollResults: { react: { appeared: 2, correct: 2 } },
		});
		expect(getSlotProgress(req, ctx)).toEqual({
			current: 2,
			target: 2,
			suffix: "correct",
			seen: true,
		});
	});

	it("marks a category-mastery check unseen when no poll of the category appeared", () => {
		const req: CategoryMasteryRequirement = {
			type: "category-mastery",
			category: "python",
			minCorrect: 2,
		};
		const ctx = makeContext({ categoryPollResults: {} });
		expect(getSlotProgress(req, ctx)).toEqual({
			current: 0,
			target: 2,
			suffix: "correct",
			seen: false,
		});
	});
});

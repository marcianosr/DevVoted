import { describe, it, expect } from "vitest";

import { createMockRunCategoryCoverage } from "~/domains/runs/models/runCategoryCoverage.mock";
import type { PipelineEvaluationContext } from "~/domains/runs/services/pipelineEvaluator.service";

import {
	toCoverageBars,
	toPipelineCells,
	deriveStumpedPct,
	derivePercentile,
	type OptionTally,
} from "./toDailyResultShareData";

describe("toCoverageBars", () => {
	it("keeps only the top 3 categories by coverage, highest first", () => {
		const coverage = [
			createMockRunCategoryCoverage({
				categoryCode: "git",
				currentCoverage: 20,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "js",
				currentCoverage: 80,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "css",
				currentCoverage: 60,
			}),
			createMockRunCategoryCoverage({
				categoryCode: "ts",
				currentCoverage: 10,
			}),
		];

		const bars = toCoverageBars(coverage);

		expect(bars.map((b) => b.label)).toEqual(["JS", "CSS", "Git"]);
	});

	it("converts coverage magnitude to a 0..1 ratio", () => {
		const bars = toCoverageBars([
			createMockRunCategoryCoverage({
				categoryCode: "js",
				currentCoverage: 40,
			}),
		]);

		expect(bars[0].ratio).toBeCloseTo(0.4);
	});
});

describe("toPipelineCells", () => {
	const context = (
		overrides: Partial<PipelineEvaluationContext>
	): PipelineEvaluationContext => ({
		correctAnswersInWindow: 0,
		pollsAnsweredInWindow: 0,
		coverageGainedInWindow: 0,
		currentStreakAtWindowEnd: 0,
		pollsInWindow: 5,
		currentGate: 1,
		firstConsecutiveCorrectFromWindowStart: 0,
		categoryPollResults: {},
		...overrides,
	});

	it("renders one cell per answered poll, correct ones first (counts, not order)", () => {
		const cells = toPipelineCells(
			context({ pollsAnsweredInWindow: 5, correctAnswersInWindow: 3 })
		);

		expect(cells).toEqual([true, true, true, false, false]);
	});

	it("never fabricates cells for polls not yet answered in the window", () => {
		const cells = toPipelineCells(
			context({ pollsAnsweredInWindow: 2, correctAnswersInWindow: 2 })
		);

		expect(cells).toEqual([true, true]);
	});
});

describe("deriveStumpedPct", () => {
	const tallies: OptionTally[] = [
		{ isCorrect: true, votes: 30 },
		{ isCorrect: false, votes: 50 },
		{ isCorrect: false, votes: 20 },
	];

	it("returns the share of votes on incorrect options", () => {
		expect(deriveStumpedPct(tallies)).toBe(70);
	});

	it("returns 0 when nobody has voted yet", () => {
		expect(deriveStumpedPct([])).toBe(0);
	});
});

describe("derivePercentile (placeholder — pending owner decision)", () => {
	const tallies: OptionTally[] = [
		{ isCorrect: true, votes: 40 },
		{ isCorrect: false, votes: 60 },
	];

	it("never produces a humiliating number: bad day still floors at a non-negative value", () => {
		expect(derivePercentile(tallies, false)).toBeGreaterThanOrEqual(0);
	});

	it("credits a correct answer with beating the stumped share (current default)", () => {
		expect(derivePercentile(tallies, true)).toBe(60);
	});
});

import { describe, expect, it } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import { getSlotDefinition } from "~/domains/runs/data/pipelineSlots";
import type { PipelineSlot } from "~/domains/runs/models/pipeline";
import {
	DEFAULT_WINDOW_SIZE,
	evaluatePipeline,
	getWindowSize,
	type PipelineEvaluationContext,
} from "./pipelineEvaluator.service";

// ─── Context factory ──────────────────────────────────────────────────────────

const makeContext = (
	overrides: Partial<PipelineEvaluationContext> = {}
): PipelineEvaluationContext => ({
	correctAnswersInWindow: 5,
	pollsAnsweredInWindow: 5,
	coverageGainedInWindow: 10,
	currentStreakAtWindowEnd: 5,
	pollsInWindow: 5,
	...overrides,
});

// ─── getWindowSize ────────────────────────────────────────────────────────────

describe("getWindowSize", () => {
	it(`returns ${DEFAULT_WINDOW_SIZE} when no short-window slot is active`, () => {
		const slots = [getSlotDefinition("correct-answers", "low")];
		expect(getWindowSize(slots)).toBe(DEFAULT_WINDOW_SIZE);
	});

	it("returns 4 for short-window medium", () => {
		const slots = [getSlotDefinition("short-window", "medium")]; // pollCount: 4
		expect(getWindowSize(slots)).toBe(4);
	});

	it("returns 5 for short-window low", () => {
		const slots = [getSlotDefinition("short-window", "low")]; // pollCount: 5
		expect(getWindowSize(slots)).toBe(5);
	});

	it("returns 3 for short-window high", () => {
		const slots = [getSlotDefinition("short-window", "high")]; // pollCount: 3
		expect(getWindowSize(slots)).toBe(3);
	});

	it("returns 2 for short-window critical", () => {
		const slots = [getSlotDefinition("short-window", "critical")]; // pollCount: 2
		expect(getWindowSize(slots)).toBe(2);
	});

	it("returns default when pipeline is empty", () => {
		expect(getWindowSize([])).toBe(DEFAULT_WINDOW_SIZE);
	});
});

// ─── evaluatePipeline — coverage-gain ────────────────────────────────────────

describe("evaluatePipeline — coverage-gain", () => {
	const slot = getSlotDefinition("coverage-gain", "medium"); // threshold: 5%

	it("passes when coverage gained meets the threshold", () => {
		const result = evaluatePipeline(
			makeContext({ coverageGainedInWindow: 5 }),
			[slot]
		);
		expect(result.passed).toBe(true);
	});

	it("passes when coverage gained exceeds the threshold", () => {
		const result = evaluatePipeline(
			makeContext({ coverageGainedInWindow: 8 }),
			[slot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when coverage gained is below the threshold", () => {
		const result = evaluatePipeline(
			makeContext({ coverageGainedInWindow: 4 }),
			[slot]
		);
		expect(result.passed).toBe(false);
	});
});

// ─── evaluatePipeline — correct-answers ──────────────────────────────────────

describe("evaluatePipeline — correct-answers", () => {
	const lowSlot = getSlotDefinition("correct-answers", "low"); // count: 2
	const criticalSlot = getSlotDefinition("correct-answers", "critical"); // count: 5

	it("passes when correct answers meet the count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 2 }),
			[lowSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when correct answers are below the count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 1 }),
			[lowSlot]
		);
		expect(result.passed).toBe(false);
	});

	it("passes when correct answers meet the critical count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 5 }),
			[criticalSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when correct answers are below the critical count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 4 }),
			[criticalSlot]
		);
		expect(result.passed).toBe(false);
	});
});

// ─── evaluatePipeline — short-window ─────────────────────────────────────────

describe("evaluatePipeline — short-window", () => {
	// short-window is purely a window-size modifier at all tiers — no pass/fail conditions
	const lowSlot = getSlotDefinition("short-window", "low"); // pollCount: 5
	const criticalSlot = getSlotDefinition("short-window", "critical"); // pollCount: 2

	it("passes low regardless of answers", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 0 }),
			[lowSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("passes critical regardless of answers", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 0 }),
			[criticalSlot]
		);
		expect(result.passed).toBe(true);
	});
});

// ─── evaluatePipeline — multi-slot ───────────────────────────────────────────

describe("evaluatePipeline — multiple active slots", () => {
	const slots: PipelineSlot[] = [
		getSlotDefinition("correct-answers", "medium"), // count: 3
		getSlotDefinition("coverage-gain", "low"), // threshold: 3%
	];

	it("passes when all slots pass", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 3,
				coverageGainedInWindow: 5,
			}),
			slots
		);
		expect(result.passed).toBe(true);
	});

	it("fails when any single slot fails", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 2, // fails correct-answers (needs 3)
				coverageGainedInWindow: 5,
			}),
			slots
		);
		expect(result.passed).toBe(false);
	});

	it("reports individual slot evaluations", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 2, // fails correct-answers (needs 3)
				coverageGainedInWindow: 5,
			}),
			slots
		);
		expect(result.slotEvaluations[0].passed).toBe(false);
		expect(result.slotEvaluations[1].passed).toBe(true);
	});

	it("returns total reward as sum of all slot rewards when passed", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 3,
				coverageGainedInWindow: 5,
			}),
			slots
		);
		const expectedReward =
			120 * STORAGE_UNITS.KB + // correct-answers medium
			60 * STORAGE_UNITS.KB; // coverage-gain low
		expect(result.totalReward).toBe(expectedReward);
	});

	it("returns 0 reward when any slot fails", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 0 }),
			slots
		);
		expect(result.totalReward).toBe(0);
	});
});

// ─── evaluatePipeline — edge cases ───────────────────────────────────────────

describe("evaluatePipeline — edge cases", () => {
	it("passes with no slots active", () => {
		const result = evaluatePipeline(makeContext(), []);
		expect(result.passed).toBe(true);
	});

	it("returns 0 reward for empty pipeline", () => {
		const result = evaluatePipeline(makeContext(), []);
		expect(result.totalReward).toBe(0);
	});
});

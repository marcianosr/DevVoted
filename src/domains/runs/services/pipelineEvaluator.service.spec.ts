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
	coverageGainedInWindow: 10,
	currentStreakAtWindowEnd: 5,
	pollsInWindow: 5,
	disabledConfigCount: 0,
	...overrides,
});

// ─── getWindowSize ────────────────────────────────────────────────────────────

describe("getWindowSize", () => {
	it(`returns ${DEFAULT_WINDOW_SIZE} when no short-window slot is active`, () => {
		const slots = [getSlotDefinition("correct-answers", "easy")];
		expect(getWindowSize(slots)).toBe(DEFAULT_WINDOW_SIZE);
	});

	it("returns the short-window slot's poll count", () => {
		const slots = [getSlotDefinition("short-window", "normal")]; // pollCount: 3
		expect(getWindowSize(slots)).toBe(3);
	});

	it("returns 4 for short-window easy", () => {
		const slots = [getSlotDefinition("short-window", "easy")]; // pollCount: 4
		expect(getWindowSize(slots)).toBe(4);
	});

	it("returns default when pipeline is empty", () => {
		expect(getWindowSize([])).toBe(DEFAULT_WINDOW_SIZE);
	});
});

// ─── evaluatePipeline — coverage-gain ────────────────────────────────────────

describe("evaluatePipeline — coverage-gain", () => {
	const slot = getSlotDefinition("coverage-gain", "normal"); // threshold: 5%

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
	const easySlot = getSlotDefinition("correct-answers", "easy"); // count: 3
	const intenseSlot = getSlotDefinition("correct-answers", "intense"); // count: 5, streakRequired: 2

	it("passes when correct answers meet the count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 3 }),
			[easySlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when correct answers are below the count", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 2 }),
			[easySlot]
		);
		expect(result.passed).toBe(false);
	});

	it("passes when count and streak are both met (intense)", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 5, currentStreakAtWindowEnd: 2 }),
			[intenseSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when count is met but streak is not (intense)", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 5, currentStreakAtWindowEnd: 1 }),
			[intenseSlot]
		);
		expect(result.passed).toBe(false);
	});
});

// ─── evaluatePipeline — storage-drain ────────────────────────────────────────

describe("evaluatePipeline — storage-drain", () => {
	it("always passes regardless of context (permanent modifier)", () => {
		const slot = getSlotDefinition("storage-drain", "intense");
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 0 }),
			[slot]
		);
		expect(result.passed).toBe(true);
	});
});

// ─── evaluatePipeline — disabled-config ──────────────────────────────────────

describe("evaluatePipeline — disabled-config", () => {
	const easySlot = getSlotDefinition("disabled-config", "easy"); // count: 1
	const hardSlot = getSlotDefinition("disabled-config", "hard"); // count: 2

	it("passes when the required number of configs are disabled", () => {
		const result = evaluatePipeline(makeContext({ disabledConfigCount: 1 }), [
			easySlot,
		]);
		expect(result.passed).toBe(true);
	});

	it("fails when fewer configs are disabled than required", () => {
		const result = evaluatePipeline(makeContext({ disabledConfigCount: 0 }), [
			easySlot,
		]);
		expect(result.passed).toBe(false);
	});

	it("passes when more configs are disabled than required", () => {
		const result = evaluatePipeline(makeContext({ disabledConfigCount: 3 }), [
			hardSlot,
		]);
		expect(result.passed).toBe(true);
	});
});

// ─── evaluatePipeline — short-window ─────────────────────────────────────────

describe("evaluatePipeline — short-window", () => {
	const easySlot = getSlotDefinition("short-window", "easy"); // pollCount: 4, no extra
	const hardSlot = getSlotDefinition("short-window", "hard"); // pollCount: 3, correctRequired: 3
	const intenseSlot = getSlotDefinition("short-window", "intense"); // pollCount: 2, noWrongRequired: true

	it("passes easy with no extra conditions", () => {
		const result = evaluatePipeline(makeContext({ pollsInWindow: 4 }), [
			easySlot,
		]);
		expect(result.passed).toBe(true);
	});

	it("passes hard when all polls in window are correct", () => {
		const result = evaluatePipeline(
			makeContext({ pollsInWindow: 3, correctAnswersInWindow: 3 }),
			[hardSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails hard when not all polls are correct", () => {
		const result = evaluatePipeline(
			makeContext({ pollsInWindow: 3, correctAnswersInWindow: 2 }),
			[hardSlot]
		);
		expect(result.passed).toBe(false);
	});

	it("passes intense when every poll in the window is correct", () => {
		const result = evaluatePipeline(
			makeContext({ pollsInWindow: 2, correctAnswersInWindow: 2 }),
			[intenseSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails intense when any poll in the window is wrong", () => {
		const result = evaluatePipeline(
			makeContext({ pollsInWindow: 2, correctAnswersInWindow: 1 }),
			[intenseSlot]
		);
		expect(result.passed).toBe(false);
	});
});

// ─── evaluatePipeline — multi-slot ───────────────────────────────────────────

describe("evaluatePipeline — multiple active slots", () => {
	const slots: PipelineSlot[] = [
		getSlotDefinition("correct-answers", "normal"), // count: 4
		getSlotDefinition("coverage-gain", "easy"), // threshold: 3%
	];

	it("passes when all slots pass", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 4,
				coverageGainedInWindow: 5,
			}),
			slots
		);
		expect(result.passed).toBe(true);
	});

	it("fails when any single slot fails", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 3, // fails correct-answers (needs 4)
				coverageGainedInWindow: 5,
			}),
			slots
		);
		expect(result.passed).toBe(false);
	});

	it("reports individual slot evaluations", () => {
		const result = evaluatePipeline(
			makeContext({
				correctAnswersInWindow: 3, // fails correct-answers (needs 4)
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
				correctAnswersInWindow: 4,
				coverageGainedInWindow: 5,
			}),
			slots
		);
		const expectedReward =
			120 * STORAGE_UNITS.KB + // correct-answers normal
			60 * STORAGE_UNITS.KB; // coverage-gain easy
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

// ─── evaluatePipeline — empty pipeline ───────────────────────────────────────

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

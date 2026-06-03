import { describe, expect, it } from "vitest";

import { STORAGE_UNITS } from "~/lib/storage";
import {
	getCategoryMasterySlot,
	getSlotDefinition,
} from "~/domains/runs/data/pipelineSlots";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
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
	currentGate: 1,
	firstConsecutiveCorrectFromWindowStart: 5,
	...overrides,
});

// ─── getWindowSize ────────────────────────────────────────────────────────────

describe("getWindowSize", () => {
	it(`returns ${DEFAULT_WINDOW_SIZE} when no short-window slot is active`, () => {
		const slots = [getSlotDefinition("correct-answers", "low")!];
		expect(getWindowSize(slots)).toBe(DEFAULT_WINDOW_SIZE);
	});

	it("returns 5 for short-window low", () => {
		const slots = [getSlotDefinition("short-window", "low")!]; // pollCount: 5
		expect(getWindowSize(slots)).toBe(5);
	});

	it("returns default when pipeline is empty", () => {
		expect(getWindowSize([])).toBe(DEFAULT_WINDOW_SIZE);
	});
});

// ─── evaluatePipeline — coverage-gain ────────────────────────────────────────

describe("evaluatePipeline — coverage-gain", () => {
	const slot = getSlotDefinition("coverage-gain", "medium")!; // threshold: 5%

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
	const lowSlot = getSlotDefinition("correct-answers", "low")!; // count: 2
	const criticalSlot = getSlotDefinition("correct-answers", "critical")!; // count: 5

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
	// short-window is a fixed window-size modifier — no pass/fail conditions
	const lowSlot = getSlotDefinition("short-window", "low")!; // pollCount: 5

	it("passes regardless of answers", () => {
		const result = evaluatePipeline(
			makeContext({ correctAnswersInWindow: 0 }),
			[lowSlot]
		);
		expect(result.passed).toBe(true);
	});
});

// ─── evaluatePipeline — multi-slot ───────────────────────────────────────────

describe("evaluatePipeline — multiple active slots", () => {
	const slots: PipelineSlot[] = [
		getSlotDefinition("correct-answers", "medium")!, // count: 3
		getSlotDefinition("coverage-gain", "low")!, // threshold: 3%
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

describe("evaluatePipeline — cold-start", () => {
	const highSlot = getSlotDefinition("cold-start", "high")!; // count: 1
	const criticalSlot = getSlotDefinition("cold-start", "critical")!; // count: 2

	it("passes when the first poll of the window is correct (high)", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 1 }),
			[highSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when the first poll of the window is wrong (high)", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 0 }),
			[highSlot]
		);
		expect(result.passed).toBe(false);
	});

	it("passes when the first 2 polls are correct (critical)", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 2 }),
			[criticalSlot]
		);
		expect(result.passed).toBe(true);
	});

	it("fails when only the first poll is correct but 2 are required (critical)", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 1 }),
			[criticalSlot]
		);
		expect(result.passed).toBe(false);
	});

	it("returns the slot reward on pass", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 2 }),
			[criticalSlot]
		);
		expect(result.totalReward).toBe(480 * STORAGE_UNITS.KB);
	});

	it("returns 0 reward on fail", () => {
		const result = evaluatePipeline(
			makeContext({ firstConsecutiveCorrectFromWindowStart: 0 }),
			[highSlot]
		);
		expect(result.totalReward).toBe(0);
	});
});

// ─── evaluatePipeline — category-mastery ─────────────────────────────────────

describe("evaluatePipeline — category-mastery", () => {
	const cssPollResult = (appeared: number, correct: number) =>
		makeContext({ categoryPollResults: { css: { appeared, correct } } });

	describe("low tier (≥1 correct)", () => {
		const slot = getCategoryMasterySlot("css", "low");

		it("passes when 1 CSS poll appeared and was correct", () => {
			const result = evaluatePipeline(cssPollResult(1, 1), [slot]);
			expect(result.passed).toBe(true);
		});

		it("passes when 1 out of 3 CSS polls was correct", () => {
			const result = evaluatePipeline(cssPollResult(3, 1), [slot]);
			expect(result.passed).toBe(true);
		});

		it("fails when 0 CSS polls were correct", () => {
			const result = evaluatePipeline(cssPollResult(3, 0), [slot]);
			expect(result.passed).toBe(false);
		});
	});

	describe("medium tier (≥2 correct)", () => {
		const slot = getCategoryMasterySlot("css", "medium");

		it("passes when 2 CSS polls appeared and both were correct", () => {
			const result = evaluatePipeline(cssPollResult(2, 2), [slot]);
			expect(result.passed).toBe(true);
		});

		it("passes when 2 out of 4 CSS polls were correct", () => {
			const result = evaluatePipeline(cssPollResult(4, 2), [slot]);
			expect(result.passed).toBe(true);
		});

		it("fails when only 1 CSS poll was correct", () => {
			const result = evaluatePipeline(cssPollResult(4, 1), [slot]);
			expect(result.passed).toBe(false);
		});
	});

	describe("critical tier (all must be correct)", () => {
		const slot = getCategoryMasterySlot("css", "critical");

		it("passes when all 2 appearing CSS polls were correct", () => {
			const result = evaluatePipeline(cssPollResult(2, 2), [slot]);
			expect(result.passed).toBe(true);
		});

		it("fails when 1 out of 3 CSS polls was wrong", () => {
			const result = evaluatePipeline(cssPollResult(3, 2), [slot]);
			expect(result.passed).toBe(false);
		});
	});

	describe("skipped when category does not appear", () => {
		const slot = getCategoryMasterySlot("css", "low");

		it("is skipped when no CSS polls appeared", () => {
			const result = evaluatePipeline(
				makeContext({ categoryPollResults: {} }),
				[slot]
			);
			expect(result.passed).toBe(true); // skipped = neutral
			expect(result.slotEvaluations[0].status).toBe("skipped");
		});

		it("is skipped when categoryPollResults is absent", () => {
			const result = evaluatePipeline(makeContext(), [slot]);
			expect(result.slotEvaluations[0].status).toBe("skipped");
		});
	});

	describe("threshold caps at appeared count", () => {
		it("medium slot passes when 1 CSS poll appeared and was correct (min capped to 1)", () => {
			const slot = getCategoryMasterySlot("css", "medium");
			const result = evaluatePipeline(cssPollResult(1, 1), [slot]);
			expect(result.slotEvaluations[0].status).toBe("passed");
			expect(result.passed).toBe(true);
		});

		it("medium slot fails when 1 CSS poll appeared and was wrong", () => {
			const slot = getCategoryMasterySlot("css", "medium");
			const result = evaluatePipeline(cssPollResult(1, 0), [slot]);
			expect(result.slotEvaluations[0].status).toBe("failed");
			expect(result.passed).toBe(false);
		});

		it("high slot passes when 2 JS polls appeared and both were correct (min capped to 2)", () => {
			const slot = getCategoryMasterySlot("js", "high");
			const result = evaluatePipeline(
				makeContext({
					categoryPollResults: { js: { appeared: 2, correct: 2 } },
				}),
				[slot]
			);
			expect(result.slotEvaluations[0].status).toBe("passed");
			expect(result.passed).toBe(true);
		});

		it("critical slot is skipped when no polls of the category appeared", () => {
			const slot = getCategoryMasterySlot("css", "critical");
			const result = evaluatePipeline(
				makeContext({ categoryPollResults: {} }),
				[slot]
			);
			expect(result.slotEvaluations[0].status).toBe("skipped");
		});

		it("critical slot still evaluates when at least 1 poll appeared", () => {
			const slot = getCategoryMasterySlot("css", "critical");
			const result = evaluatePipeline(cssPollResult(1, 0), [slot]);
			expect(result.slotEvaluations[0].status).toBe("failed");
		});
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

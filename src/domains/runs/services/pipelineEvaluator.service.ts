import type {
	PipelineSlot,
	ShortWindowRequirement,
} from "~/domains/runs/models/pipeline";

export type PipelineEvaluationContext = {
	readonly correctAnswersInWindow: number;
	readonly pollsAnsweredInWindow: number; // how many polls have been answered so far this window
	readonly coverageGainedInWindow: number; // percentage points gained this window
	readonly currentStreakAtWindowEnd: number; // consecutive correct answers ending this window
	readonly pollsInWindow: number; // total window size (fixed)
	readonly disabledConfigCount: number; // configs forcibly disabled this window
};

export type SlotEvaluation = {
	readonly slot: PipelineSlot;
	readonly passed: boolean;
};

export type PipelineEvaluation = {
	readonly passed: boolean;
	readonly slotEvaluations: readonly SlotEvaluation[];
	readonly totalReward: number; // bytes — 0 if any slot failed
};

export const DEFAULT_WINDOW_SIZE = 5;

export const getWindowSize = (slots: PipelineSlot[]): number => {
	const shortWindowSlot = slots.find(
		(s) => s.requirement.type === "short-window"
	);

	if (!shortWindowSlot) return DEFAULT_WINDOW_SIZE;

	// Safe — we just confirmed the type above
	const req = shortWindowSlot.requirement as ShortWindowRequirement;
	return req.pollCount;
};

const evaluateSlot = (
	slot: PipelineSlot,
	ctx: PipelineEvaluationContext
): SlotEvaluation => {
	const { requirement: req } = slot;

	switch (req.type) {
		case "coverage-gain":
			return {
				slot,
				passed: ctx.coverageGainedInWindow >= req.threshold,
			};

		case "correct-answers":
			return {
				slot,
				passed:
					ctx.correctAnswersInWindow >= req.count &&
					(!req.streakRequired ||
						ctx.currentStreakAtWindowEnd >= req.streakRequired),
			};

		case "disabled-config":
			return {
				slot,
				passed: ctx.disabledConfigCount >= req.count,
			};

		case "short-window":
			return {
				slot,
				passed:
					!req.correctRequired ||
					ctx.correctAnswersInWindow >= req.correctRequired,
			};
	}
};

// ─── Pipeline evaluation ──────────────────────────────────────────────────────

export const evaluatePipeline = (
	ctx: PipelineEvaluationContext,
	slots: PipelineSlot[]
): PipelineEvaluation => {
	const slotEvaluations = slots.map((slot) => evaluateSlot(slot, ctx));
	const passed = slotEvaluations.every((e) => e.passed);
	const totalReward = passed
		? slots.reduce((sum, slot) => sum + slot.reward, 0)
		: 0;

	return { passed, slotEvaluations, totalReward };
};

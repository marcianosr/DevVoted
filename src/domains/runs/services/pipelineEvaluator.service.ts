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
	readonly currentGate: number; // 1-indexed gate number currently being worked toward
	readonly firstConsecutiveCorrectFromWindowStart: number; // leading correct-answer streak from poll #1 of the window
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
): SlotEvaluation | null => {
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
				passed: ctx.correctAnswersInWindow >= req.count,
			};

		case "short-window":
			return {
				slot,
				passed:
					!req.correctRequired ||
					ctx.correctAnswersInWindow >= req.correctRequired,
			};

		case "cold-start":
			return {
				slot,
				passed: ctx.firstConsecutiveCorrectFromWindowStart >= req.count,
			};

		default:
			// Stale gate type in DB (e.g. a removed gate type like "disabled-config").
			// Without this guard, slots.map(evaluateSlot) returns undefined for unknown
			// types → Array.every() reads undefined.passed → TypeError → handleApiOperation
			// swallows it silently → run never ends despite gate failure.
			console.error(
				`[evaluateSlot] Unknown gate type "${(req as { type: string }).type}" — skipping stale slot`
			);
			return null;
	}
};

// ─── Pipeline evaluation ──────────────────────────────────────────────────────

export const evaluatePipeline = (
	ctx: PipelineEvaluationContext,
	slots: PipelineSlot[]
): PipelineEvaluation => {
	const slotEvaluations = slots
		.map((slot) => evaluateSlot(slot, ctx))
		.filter((e): e is SlotEvaluation => e !== null);
	const passed = slotEvaluations.every((e) => e.passed);
	const totalReward = passed
		? slots.reduce((sum, slot) => sum + slot.reward, 0)
		: 0;

	return { passed, slotEvaluations, totalReward };
};

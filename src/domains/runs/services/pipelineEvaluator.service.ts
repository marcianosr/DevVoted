import type {
	PassFailRequirement,
	PipelineSlot,
	PipelineSlotRequirement,
	ShortWindowRequirement,
} from "~/domains/runs/models/pipeline";

// ─── Evaluation context ───────────────────────────────────────────────────────

export type PipelineEvaluationContext = {
	readonly correctAnswersInWindow: number;
	readonly coverageGainedInWindow: number; // percentage points gained this window
	readonly currentStreakAtWindowEnd: number; // consecutive correct answers ending this window
	readonly pollsInWindow: number;
	readonly disabledConfigCount: number; // configs forcibly disabled this window
};

// ─── Evaluation results ───────────────────────────────────────────────────────

export type SlotEvaluation = {
	readonly slot: PipelineSlot;
	readonly passed: boolean;
};

export type PipelineEvaluation = {
	readonly passed: boolean;
	readonly slotEvaluations: readonly SlotEvaluation[];
	readonly totalReward: number; // bytes — 0 if any slot failed
};

// ─── Window size ──────────────────────────────────────────────────────────────

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

// ─── Type guard ───────────────────────────────────────────────────────────────

const isPassFailRequirement = (
	req: PipelineSlotRequirement
): req is PassFailRequirement => req.type !== "storage-drain";

// ─── Per-type evaluators ──────────────────────────────────────────────────────

const evaluateSlot = (
	slot: PipelineSlot,
	ctx: PipelineEvaluationContext
): SlotEvaluation => {
	const { requirement: req } = slot;

	if (!isPassFailRequirement(req)) {
		// storage-drain is a permanent run modifier — no pass/fail condition.
		return { slot, passed: true };
	}

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
					(!req.correctRequired ||
						ctx.correctAnswersInWindow >= req.correctRequired) &&
					!req.noWrongRequired,
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

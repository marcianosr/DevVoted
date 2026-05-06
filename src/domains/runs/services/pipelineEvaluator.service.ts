import type { CategoryCode } from "~/domains/shared/categories";
import type {
	PipelineSlot,
	ShortWindowRequirement,
} from "~/domains/runs/models/pipeline.model";

export type CategoryPollResult = {
	readonly appeared: number;
	readonly correct: number;
};

export type PipelineEvaluationContext = {
	readonly correctAnswersInWindow: number;
	readonly pollsAnsweredInWindow: number; // how many polls have been answered so far this window
	readonly coverageGainedInWindow: number; // percentage points gained this window
	readonly currentStreakAtWindowEnd: number; // consecutive correct answers ending this window
	readonly pollsInWindow: number; // total window size (fixed)
	readonly currentGate: number; // 1-indexed gate number currently being worked toward
	readonly firstConsecutiveCorrectFromWindowStart: number; // leading correct-answer streak from poll #1 of the window
	readonly categoryPollResults?: Partial<
		Record<CategoryCode, CategoryPollResult>
	>;
};

export const buildCategoryPollResults = (
	windowResults: Array<{ isCorrect: boolean; categoryCode: CategoryCode }>
): Partial<Record<CategoryCode, CategoryPollResult>> =>
	windowResults.reduce<Partial<Record<CategoryCode, CategoryPollResult>>>(
		(acc, { isCorrect, categoryCode }) => {
			const existing = acc[categoryCode] ?? { appeared: 0, correct: 0 };
			return {
				...acc,
				[categoryCode]: {
					appeared: existing.appeared + 1,
					correct: existing.correct + (isCorrect ? 1 : 0),
				},
			};
		},
		{}
	);

export type SlotEvaluationStatus = "passed" | "failed" | "skipped";

export type SlotEvaluation = {
	readonly slot: PipelineSlot;
	readonly passed: boolean; // false only when status === "failed"; skipped counts as passing
	readonly status: SlotEvaluationStatus;
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

const makeResult = (
	slot: PipelineSlot,
	status: SlotEvaluationStatus
): SlotEvaluation => ({
	slot,
	status,
	passed: status !== "failed",
});

const evaluateSlot = (
	slot: PipelineSlot,
	ctx: PipelineEvaluationContext
): SlotEvaluation | null => {
	const { requirement: req } = slot;

	switch (req.type) {
		case "coverage-gain":
			return makeResult(
				slot,
				ctx.coverageGainedInWindow >= req.threshold ? "passed" : "failed"
			);

		case "correct-answers":
			return makeResult(
				slot,
				ctx.correctAnswersInWindow >= req.count ? "passed" : "failed"
			);

		case "short-window":
			return makeResult(
				slot,
				!req.correctRequired ||
					ctx.correctAnswersInWindow >= req.correctRequired
					? "passed"
					: "failed"
			);

		case "cold-start":
			return makeResult(
				slot,
				ctx.firstConsecutiveCorrectFromWindowStart >= req.count
					? "passed"
					: "failed"
			);

		case "category-mastery": {
			const results = ctx.categoryPollResults?.[req.category];
			if (!results || results.appeared === 0)
				return makeResult(slot, "skipped");
			const passed =
				req.minCorrect === null
					? results.correct === results.appeared
					: results.correct >= req.minCorrect;
			return makeResult(slot, passed ? "passed" : "failed");
		}

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
		? slotEvaluations
				.filter((e) => e.status === "passed")
				.reduce((sum, e) => sum + e.slot.reward, 0)
		: 0;

	return { passed, slotEvaluations, totalReward };
};

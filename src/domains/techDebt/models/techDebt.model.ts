import { CategoryCode } from "~/domains/shared/categories";

/**
 * Debuff applied while a Tech Debt is active.
 *
 * Two flavours: mechanical (alters game rules — pipeline grades, shop access,
 * gate logic) and informational (hides signal — UI rendering flag, no game
 * state change). The discriminant lets each consumer match exhaustively.
 */
export type DebuffEffect =
	| { kind: "pipelineGradeModifier"; delta: number }
	| { kind: "forcedPipelinePickCount"; count: number }
	| { kind: "shopLocked" }
	| { kind: "configUpgradesBlocked" }
	| { kind: "hideCategoryInPipelinePicks" }
	| { kind: "obfuscateShopItems" };

/**
 * Condition that, once met, auto-clears the Tech Debt instance.
 *
 * Progress is forward-only — counters start from the moment the TD spawned,
 * not from absolute run state. Each variant carries the `target` the counter
 * must reach.
 */
export type ClearCondition =
	| { kind: "coverageGain"; targetPercent: number }
	| { kind: "singleCategoryCoverageGain"; targetPercent: number }
	| { kind: "pipelinesCompleted"; target: number }
	| { kind: "firstAnswers"; target: number }
	| { kind: "rerollStorageSpent"; targetBytes: number }
	// Clears when *either* a consecutive-correct streak hits streakTarget OR
	// the cross-category correct-answer count in the run hits totalTarget.
	// The OR semantic is local to this variant — used by Flaky Suite. Tracking
	// both counters in one progress object avoids a model-wide refactor for
	// the only TD that needs it.
	| {
			kind: "correctAnswerStreakOrTotal";
			streakTarget: number;
			totalTarget: number;
	  };

export const TECH_DEBT_TEMPLATE_IDS = [
	"legacy-module",
	"lost-docs",
	"flaky-suite",
	"scope-creep",
	"stale-cache",
	"obfuscated-imports",
] as const;

export type TechDebtTemplateId = (typeof TECH_DEBT_TEMPLATE_IDS)[number];

export const isTechDebtTemplateId = (
	value: string
): value is TechDebtTemplateId =>
	(TECH_DEBT_TEMPLATE_IDS as readonly string[]).includes(value);

export type TechDebtTemplate = {
	id: TechDebtTemplateId;
	name: string;
	description: string;
	debuff: DebuffEffect;
	clearCondition: ClearCondition;
};

/**
 * Progress state for a clear condition. Shape mirrors the discriminant of
 * ClearCondition — variant-specific counters live here. Persisted as JSON on
 * the active_tech_debts row.
 */
export type ClearProgress =
	| { kind: "coverageGain"; gainedPercent: number }
	| {
			kind: "singleCategoryCoverageGain";
			gainedByCategory: Partial<Record<CategoryCode, number>>;
	  }
	| { kind: "pipelinesCompleted"; completed: number }
	| { kind: "firstAnswers"; firsts: number }
	| { kind: "rerollStorageSpent"; spentBytes: number }
	| {
			kind: "correctAnswerStreakOrTotal";
			currentStreak: number;
			totalCorrect: number;
	  };

/**
 * An active Tech Debt instance attached to a run.
 */
export type ActiveTechDebt = {
	id: number;
	runId: number;
	templateId: TechDebtTemplateId;
	acquiredAt: Date;
	progress: ClearProgress;
};

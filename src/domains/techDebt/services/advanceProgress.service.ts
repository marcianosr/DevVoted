import {
	ActiveTechDebt,
	ClearCondition,
	ClearProgress,
} from "~/domains/techDebt/models/techDebt.model";
import { getTechDebtTemplate } from "~/domains/techDebt/data/techDebtTemplates";

export type PollAnswerEvent = {
	kind: "pollAnswer";
	isCorrect: boolean;
};

/**
 * Applies a poll-answer event to a Tech Debt's progress, returning the next
 * progress state. Variants that don't react to this event are returned
 * unchanged.
 */
const applyEventToProgress = (
	progress: ClearProgress,
	event: PollAnswerEvent
): ClearProgress => {
	if (progress.kind !== "correctAnswerStreakOrTotal") return progress;
	if (!event.isCorrect) {
		return { ...progress, currentStreak: 0 };
	}
	return {
		...progress,
		currentStreak: progress.currentStreak + 1,
		totalCorrect: progress.totalCorrect + 1,
	};
};

/**
 * True when progress satisfies the clear condition. The Tech Debt should be
 * removed when this returns true.
 */
const isCleared = (
	condition: ClearCondition,
	progress: ClearProgress
): boolean => {
	if (
		condition.kind === "correctAnswerStreakOrTotal" &&
		progress.kind === "correctAnswerStreakOrTotal"
	) {
		return (
			progress.currentStreak >= condition.streakTarget ||
			progress.totalCorrect >= condition.totalTarget
		);
	}
	// Other variants are advanced by their own events (coverage gain, pipeline
	// completion, etc.) and have their own clear checks. The poll-answer
	// pathway only resolves variants that listen to poll answers.
	return false;
};

export type TechDebtProgressOutcome = {
	techDebt: ActiveTechDebt;
	nextProgress: ClearProgress;
	cleared: boolean;
};

export const advanceTechDebtsOnPollAnswer = (
	activeTds: ActiveTechDebt[],
	event: PollAnswerEvent
): TechDebtProgressOutcome[] =>
	activeTds.map((techDebt) => {
		const condition = getTechDebtTemplate(techDebt.templateId).clearCondition;
		const nextProgress = applyEventToProgress(techDebt.progress, event);
		const cleared = isCleared(condition, nextProgress);
		return { techDebt, nextProgress, cleared };
	});

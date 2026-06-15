import {
	ClearCondition,
	ClearProgress,
	TechDebtTemplate,
} from "~/domains/techDebt/models/techDebt.model";

/**
 * Derives the starting ClearProgress for a freshly-spawned Tech Debt.
 *
 * ClearProgress mirrors ClearCondition by discriminant — each variant pairs
 * with a zeroed counter shape. Keeping the mapping centralized means new
 * clear-condition variants only require one switch arm update, not every
 * consumer that spawns a TD.
 */
export const createInitialClearProgress = (
	template: TechDebtTemplate
): ClearProgress => initialProgressForCondition(template.clearCondition);

const initialProgressForCondition = (
	condition: ClearCondition
): ClearProgress => {
	switch (condition.kind) {
		case "coverageGain":
			return { kind: "coverageGain", gainedPercent: 0 };
		case "singleCategoryCoverageGain":
			return { kind: "singleCategoryCoverageGain", gainedByCategory: {} };
		case "pipelinesCompleted":
			return { kind: "pipelinesCompleted", completed: 0 };
		case "firstAnswers":
			return { kind: "firstAnswers", firsts: 0 };
		case "rerollStorageSpent":
			return { kind: "rerollStorageSpent", spentBytes: 0 };
		case "correctAnswerStreakOrTotal":
			return {
				kind: "correctAnswerStreakOrTotal",
				currentStreak: 0,
				totalCorrect: 0,
			};
	}
};

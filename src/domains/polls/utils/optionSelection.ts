import type { AnswerType } from "~/domains/polls/models/poll.model";

/**
 * Toggles an option in the current selection based on the poll's answer type.
 * Single-answer polls replace the whole selection; multiple-answer polls add or
 * remove the option, preserving the rest.
 */
export const toggleOptionSelection = (
	selected: string[],
	optionId: string,
	answerType: AnswerType
): string[] => {
	if (answerType === "single") return [optionId];
	return selected.includes(optionId)
		? selected.filter((id) => id !== optionId)
		: [...selected, optionId];
};

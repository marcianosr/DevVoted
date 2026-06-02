export type PollAnswerOutcome = "full" | "partial" | "wrong";

export type PollAnswerEvaluation = {
	outcome: PollAnswerOutcome;
	isFullyCorrect: boolean;
};

export type PollAnswerCounts = {
	selectedCorrect: number;
	selectedIncorrect: number;
	totalCorrect: number;
};

export const evaluatePollAnswer = ({
	selectedCorrect,
	selectedIncorrect,
	totalCorrect,
}: PollAnswerCounts): PollAnswerEvaluation => {
	if (totalCorrect === 0 || selectedCorrect === 0) {
		return { outcome: "wrong", isFullyCorrect: false };
	}

	const isFullyCorrect =
		selectedCorrect === totalCorrect && selectedIncorrect === 0;

	return {
		outcome: isFullyCorrect ? "full" : "partial",
		isFullyCorrect,
	};
};

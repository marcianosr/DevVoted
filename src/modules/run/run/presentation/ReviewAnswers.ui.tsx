import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
import { AnswerResults } from "~/modules/run/run/presentation/AnswerResults.ui";

type ReviewAnswersProps = {
	answered: readonly AnsweredPoll[];
};

/** The gate's answers, always listed — one tight row per poll, choices behind
 * a tap on the row. */
export const ReviewAnswers = ({ answered }: ReviewAnswersProps) =>
	answered.length === 0 ? null : <AnswerResults answered={answered} />;

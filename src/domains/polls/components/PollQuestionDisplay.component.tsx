import type { Poll } from "~/domains/polls/models/poll.model";
import { PollQuestionHeading } from "~/ui/polls/PollQuestionHeading.ui";

type PollQuestionDisplayProps = {
	poll: Poll;
};

export const PollQuestionDisplay = ({ poll }: PollQuestionDisplayProps) => (
	<PollQuestionHeading question={poll.question} />
);

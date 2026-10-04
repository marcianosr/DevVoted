import { QuestionMarkdown } from "~/modules/run/poll/presentation/PollMarkdown.ui";

type PollQuestionHeadingProps = {
	question: string;
};

export const PollQuestionHeading = ({ question }: PollQuestionHeadingProps) => (
	<div className="markdown mb-6 text-theme text-3xl md:text-5xl text-balance">
		<QuestionMarkdown>{question}</QuestionMarkdown>
	</div>
);

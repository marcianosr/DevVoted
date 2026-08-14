import { QuestionMarkdown } from "~/modules/run/poll/presentation/PollMarkdown.ui";

type PollQuestionHeadingProps = {
	question: string;
};

/**
 * The poll question rendered as the large, theme-colored display heading.
 */
export const PollQuestionHeading = ({ question }: PollQuestionHeadingProps) => (
	<div className="markdown mb-6 text-theme text-3xl md:text-5xl text-balance">
		<QuestionMarkdown>{question}</QuestionMarkdown>
	</div>
);

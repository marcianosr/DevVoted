import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import type { Poll } from "~/domains/polls/models/poll";

type PollQuestionDisplayProps = {
	poll: Poll;
};

export const PollQuestionDisplay = ({ poll }: PollQuestionDisplayProps) => {
	return (
		<div className="markdown mb-4 text-theme text-3xl md:text-5xl">
			<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
				{poll.question}
			</ReactMarkdown>
		</div>
	);
};

import type { Poll } from "~/domains/polls/models/poll";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { PollMetaData } from "./PollMetaData";

type PollQuestionDisplayProps = {
	poll: Poll;
};

export const PollQuestionDisplay = ({ poll }: PollQuestionDisplayProps) => {
	return (
		<div className="mb-6">
			<div className="markdown mb-4">
				<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
					{poll.question}
				</ReactMarkdown>
			</div>

			<PollMetaData poll={poll} />
		</div>
	);
};

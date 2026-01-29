import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

import type { Poll } from "~/domains/polls/models/poll";

const rehypeHighlightOptions = {
	detect: true,
	languages: {
		css,
		javascript,
		js: javascript,
		typescript,
		ts: typescript,
		html: xml,
		vue: xml,
		xml,
	},
};

type PollQuestionDisplayProps = {
	poll: Poll;
};

export const PollQuestionDisplay = ({ poll }: PollQuestionDisplayProps) => {
	return (
		<div className="markdown mb-4 text-theme text-3xl md:text-5xl">
			<ReactMarkdown
				rehypePlugins={[[rehypeHighlight, rehypeHighlightOptions]]}
			>
				{poll.question}
			</ReactMarkdown>
		</div>
	);
};

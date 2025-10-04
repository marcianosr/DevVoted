import type { Poll } from "~/domains/polls/models/poll";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

type PollHeaderProps = {
	poll: Poll;
};

export const PollHeader = ({ poll }: PollHeaderProps) => {
	return (
		<div className="mb-6">
			<div className="markdown mb-4">
				<ReactMarkdown rehypePlugins={[rehypeHighlight]}>
					{poll.question}
				</ReactMarkdown>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="p-4 rounded-lg shadow">
					<h2 className="text-lg font-semibold mb-2">Poll Details</h2>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Status:</span>{" "}
							{poll.status}
						</p>
						<p>
							<span className="font-medium">Type:</span>{" "}
							{poll.answerType}
						</p>
						<p>
							<span className="font-medium">Category:</span>{" "}
							{poll.categoryCode}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

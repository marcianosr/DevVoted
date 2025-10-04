import type { Poll } from "~/domains/polls/models/poll";

type PollMetaDataProps = {
	poll: Pick<Poll, "status" | "answerType" | "categoryCode">;
};

export const PollMetaData = ({ poll }: PollMetaDataProps) => {
	return (
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
	);
};
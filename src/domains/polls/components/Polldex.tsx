import { clsx } from "clsx";

import type { Poll } from "~/domains/polls/models/poll";

type PollWithStats = {
	poll: Poll;
	hasAnswered: boolean;
	timesAnswered: number;
};

type PolldexProps = {
	pollsWithStats: PollWithStats[];
};

export const Polldex: React.FC<PolldexProps> = ({ pollsWithStats }) => {
	const totalPolls = pollsWithStats.length;
	const answeredPolls = pollsWithStats.filter((p) => p.hasAnswered).length;
	const completionPercentage =
		totalPolls > 0 ? Math.round((answeredPolls / totalPolls) * 100) : 0;

	return (
		<div className="max-w-7xl mx-auto p-4">
			<div className="mb-8">
				<h1 className="text-4xl text-theme mb-4">POLLDEX</h1>
				<div className="text-white">
					<div className="text-lg mb-2">
						Discovered: {answeredPolls}/{totalPolls} polls
					</div>
					<div className="w-full bg-gray-800 rounded-full h-4">
						<div
							className="bg-theme h-4 rounded-full transition-all duration-300"
							style={{ width: `${completionPercentage}%` }}
						/>
					</div>
					<div className="text-sm text-gray-400 mt-1">
						Completion: {completionPercentage}%
					</div>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
				{pollsWithStats.map(({ poll, hasAnswered, timesAnswered }) => (
					<PolldexItem
						key={poll.id}
						poll={poll}
						hasAnswered={hasAnswered}
						timesAnswered={timesAnswered}
					/>
				))}
			</div>
		</div>
	);
};

type PolldexItemProps = {
	poll: Poll;
	hasAnswered: boolean;
	timesAnswered: number;
};

const PolldexItem: React.FC<PolldexItemProps> = ({
	poll,
	hasAnswered,
	timesAnswered,
}) => {
	return (
		<div
			className={clsx(
				"border-2 rounded-lg p-4 transition-all duration-200 hover:scale-105 cursor-pointer",
				{
					"border-theme bg-zinc-900 hover:bg-gray-800": hasAnswered,
					"border-gray-600 bg-zinc-950 opacity-40 hover:opacity-60":
						!hasAnswered,
				}
			)}
		>
			<div
				className={clsx("text-lg mb-2", {
					"text-theme": hasAnswered,
					"text-gray-600": !hasAnswered,
				})}
			>
				#{String(poll.id).padStart(3, "0")}
			</div>

			<div
				className={clsx("text-xs mb-2 h-8 line-clamp-2", {
					"text-white": hasAnswered,
					"text-gray-600": !hasAnswered,
				})}
			>
				{hasAnswered ? poll.question : "???"}
			</div>

			{hasAnswered ? (
				<div className="text-xs text-theme">Seen: {timesAnswered}</div>
			) : (
				<div className="text-xs text-gray-600">Not discovered</div>
			)}
		</div>
	);
};

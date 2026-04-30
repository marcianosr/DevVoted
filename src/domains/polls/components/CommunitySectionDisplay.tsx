import { formatDuration, intervalToDuration } from "date-fns";

import UserAvatar from "~/components/UserAvatar";
import ExposedConfigDeckDisplay from "~/domains/configs/components/ExposedConfigDeckDisplay";
import Leaderboard from "~/domains/leaderboards/components/Leaderboard";
import CategoryWeightsDisplay from "~/domains/polls/components/CategoryWeightsDisplay";
import type { ExposedConfigDeck } from "~/domains/runs/api/queries";
import type { CategoryCode } from "~/domains/shared/categories";

import type { CommunityStats } from "../api/queries";

const formatTimeTaken = (ms: number | null): string | null => {
	if (ms === null) return null;

	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

type CommunitySectionDisplayProps = {
	communityStats?: CommunityStats;
	exposedConfigDeck?: ExposedConfigDeck | null;
	categoryCode: CategoryCode;
};

const CommunitySectionDisplay = ({
	communityStats,
	exposedConfigDeck,
	categoryCode,
}: CommunitySectionDisplayProps) => (
	<section className="space-y-2">
		<h3 className="text-4xl">👥 Community</h3>
		<p className="text-xl">
			<span>
				{communityStats?.totalResponses} player(s) participated in this
				poll{" "}
			</span>
			<span className="mx-2">·</span>
			<span>
				{communityStats?.users.map((user) => (
					<UserAvatar key={user.id} user={user} />
				))}
			</span>
		</p>
		{communityStats?.firstToAnswer && (
			<div>
				<p className="text-xl mt-4">First to answer</p>
				<div className="flex gap-2 items-center">
					<UserAvatar user={communityStats.firstToAnswer} />
					<p>{communityStats.firstToAnswer.displayName}</p>
					<span>·</span>
					{communityStats.firstToAnswer.timeTakenMs !== null && (
						<span className="text-zinc-400 text-sm">
							in {formatTimeTaken(communityStats.firstToAnswer.timeTakenMs)}
						</span>
					)}
				</div>
			</div>
		)}
		{communityStats?.fastestResponder && (
			<div>
				<p className="text-xl mt-4">Fastest responder</p>
				<div className="flex gap-2 items-center">
					<UserAvatar user={communityStats.fastestResponder} />
					<p>{communityStats.fastestResponder.displayName}</p>
					<span>·</span>
					{communityStats.fastestResponder.timeTakenMs !== null && (
						<span className="text-zinc-400 text-sm">
							in {formatTimeTaken(communityStats.fastestResponder.timeTakenMs)}
						</span>
					)}
				</div>
			</div>
		)}
		{communityStats?.firstGood && (
			<div>
				<p className="text-xl mt-4">First good</p>
				<div className="flex gap-2 items-center">
					<UserAvatar user={communityStats.firstGood} />
					<p>{communityStats.firstGood.displayName}</p>
					<span>·</span>
					{communityStats.firstGood.timeTakenMs !== null && (
						<span className="text-zinc-400 text-sm">
							in {formatTimeTaken(communityStats.firstGood.timeTakenMs)}
						</span>
					)}
				</div>
			</div>
		)}
		{exposedConfigDeck && <ExposedConfigDeckDisplay deck={exposedConfigDeck} />}
		<CategoryWeightsDisplay />
		<section className="mt-8">
			<Leaderboard categoryCode={categoryCode} />
		</section>
	</section>
);

export default CommunitySectionDisplay;

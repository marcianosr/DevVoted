import { formatDuration, intervalToDuration } from "date-fns";

import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import { AvatarPopover } from "~/domains/economy/components/AvatarPopover.component";
import ExposedConfigDeckDisplay from "~/domains/economy/components/ExposedConfigDeckDisplay.component";
import { GatePathmapComponent } from "~/domains/polls/components/GatePathmap.component";
import { PollAnswerBreakdown } from "~/domains/polls/components/PollAnswerBreakdown.component";
import type { ExposedConfigDeck } from "~/domains/runs/api/run.queries";
import { CATEGORY_METADATA } from "~/domains/shared/categories";
import { Avatar } from "~/domains/users/components/Avatar.component";

type CommunitySectionProps = {
	communityStats: CommunityStats;
	exposedConfigDeck?: ExposedConfigDeck | null;
	viewerUserId: string;
};

const formatTimeTaken = (ms: number | null): string | null => {
	if (ms === null) return null;
	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

const timeTakenSubtitle = (ms: number | null) =>
	ms !== null ? `in ${formatTimeTaken(ms)}` : null;

type CommunityAwardRowProps = {
	title: string;
	meta?: React.ReactNode;
	user: NonNullable<CommunityStats["firstToAnswer"]>;
};

const CommunityAwardRow = ({ title, meta, user }: CommunityAwardRowProps) => (
	<li className="flex items-center gap-4 py-3">
		<Avatar user={user} size="lg" shape="square" />
		<div className="min-w-0 flex-1">
			<p className="text-lg text-theme">{title}</p>
			<p className="text-base text-white truncate">
				<span>{user.displayName ?? user.id}</span>
				{meta && <span className="text-zinc-300"> · {meta}</span>}
			</p>
		</div>
	</li>
);

export const CommunitySection = ({
	communityStats,
	exposedConfigDeck,
	viewerUserId,
}: CommunitySectionProps) => {
	// Only reveal the per-option breakdown (which marks the correct answer) once
	// the viewer has answered — otherwise it would spoil today's poll.
	const viewerHasAnswered = communityStats.optionBreakdown.some((option) =>
		option.voters.some((voter) => voter.id === viewerUserId)
	);

	return (
		<section className="space-y-6">
			<div>
				<h3 className="text-4xl">👥 Community</h3>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xl">
					<span>
						{communityStats.totalResponses} player(s) participated in
						today&apos;s poll ·
					</span>
					<div className="flex -space-x-2">
						{communityStats.users.map((user) => (
							<AvatarPopover
								key={user.id}
								user={user}
								role={user.role}
								pipelineSlots={user.activeRunPipelineSlots}
								activeRunProgress={user.activeRunProgress}
							>
								<Avatar user={user} />
							</AvatarPopover>
						))}
					</div>
				</div>
			</div>

			{viewerHasAnswered && communityStats.optionBreakdown.length > 0 && (
				<div className="pt-2">
					<h4 className="text-2xl text-theme">Who picked what</h4>
					<p className="text-zinc-300 pb-2">
						Every answer and the players who chose it — hover an avatar for
						details
					</p>
					<PollAnswerBreakdown
						optionBreakdown={communityStats.optionBreakdown}
						viewerUserId={viewerUserId}
					/>
				</div>
			)}

			<div className="pt-2">
				<h4 className="text-2xl text-theme">Top Committers</h4>
				<p className="text-zinc-300">Players who stood out today</p>
				<ul>
					{communityStats.firstToAnswer && (
						<CommunityAwardRow
							title="First to answer"
							meta={timeTakenSubtitle(communityStats.firstToAnswer.timeTakenMs)}
							user={communityStats.firstToAnswer}
						/>
					)}
					{communityStats.fastestResponder && (
						<CommunityAwardRow
							title="Fastest responder"
							meta={timeTakenSubtitle(
								communityStats.fastestResponder.timeTakenMs
							)}
							user={communityStats.fastestResponder}
						/>
					)}
					{communityStats.firstGood && (
						<CommunityAwardRow
							title="First good"
							meta={timeTakenSubtitle(communityStats.firstGood.timeTakenMs)}
							user={communityStats.firstGood}
						/>
					)}
					{communityStats.mostPollsInCategory && (
						<CommunityAwardRow
							title={`Highest participation in ${CATEGORY_METADATA[communityStats.mostPollsInCategory.categoryCode].name}`}
							meta={`${communityStats.mostPollsInCategory.count} poll${communityStats.mostPollsInCategory.count === 1 ? "" : "s"}`}
							user={communityStats.mostPollsInCategory.user}
						/>
					)}
					{communityStats.mostCorrectInCategory && (
						<CommunityAwardRow
							title={`Highest correctly answered polls in ${CATEGORY_METADATA[communityStats.mostCorrectInCategory.categoryCode].name}`}
							meta={`${communityStats.mostCorrectInCategory.count} poll${communityStats.mostCorrectInCategory.count === 1 ? "" : "s"}`}
							user={communityStats.mostCorrectInCategory.user}
						/>
					)}
				</ul>
			</div>

			<GatePathmapComponent players={communityStats.playersInActiveRun} />

			{exposedConfigDeck && (
				<ExposedConfigDeckDisplay deck={exposedConfigDeck} />
			)}
		</section>
	);
};

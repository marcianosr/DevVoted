import type { CommunityOptionBreakdown } from "~/domains/polls/api/communityStats.queries";
import { AvatarPopover } from "~/domains/economy/components/AvatarPopover.component";
import { Avatar } from "~/domains/users/components/Avatar.component";
import { PollAnswerReview } from "~/ui/polls/PollAnswerReview.ui";
import type { AnswerReviewOption } from "~/ui/polls/PollAnswerReview.ui";

type PollAnswerBreakdownProps = {
	optionBreakdown: CommunityOptionBreakdown[];
	viewerUserId: string;
};

/**
 * The community "who picked what" view: each poll option rendered with its
 * correct/wrong styling (reusing PollAnswerReview), trailed by a small avatar
 * for every player who chose it — hover an avatar for that player's detail
 * panel. `isYours` marks the viewer's own pick.
 */
export const PollAnswerBreakdown = ({
	optionBreakdown,
	viewerUserId,
}: PollAnswerBreakdownProps) => {
	const options: AnswerReviewOption[] = optionBreakdown.map((option) => ({
		id: String(option.optionId),
		text: option.optionText,
		correct: option.isCorrect,
		isYours: option.voters.some((voter) => voter.id === viewerUserId),
		voters:
			option.voters.length > 0 ? (
				<div className="flex flex-wrap justify-end gap-y-1 -space-x-2">
					{option.voters.map((voter) => (
						<AvatarPopover
							key={voter.id}
							user={voter}
							role={voter.role}
							pipelineSlots={voter.activeRunPipelineSlots}
							activeRunProgress={voter.activeRunProgress}
						>
							<Avatar user={voter} size="sm" />
						</AvatarPopover>
					))}
				</div>
			) : undefined,
	}));

	return <PollAnswerReview options={options} />;
};

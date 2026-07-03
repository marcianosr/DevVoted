import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import { buildAnswerReview } from "~/domains/polls/utils/pollResult";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { PollResultScreen } from "~/ui/polls/PollResultScreen.ui";

import type { Poll } from "../models/poll.model";

type PollResultsSectionProps = {
	poll: Poll;
	selectedOptions: string[];
	communityStats?: CommunityStats;
	explanation?: string | null;
	continueAction?: { label: string; onClick: () => void };
	secondaryAction?: { label: string; onClick: () => void };
	pollsUntilGate?: number;
};

export const PollResultsSection = ({
	poll,
	selectedOptions,
	communityStats,
	explanation,
	continueAction,
	secondaryAction,
	pollsUntilGate,
}: PollResultsSectionProps) => {
	const optionBreakdown = communityStats?.optionBreakdown ?? [];

	return (
		<PollResultScreen
			question={poll.question}
			options={buildAnswerReview(optionBreakdown, selectedOptions)}
			explanation={explanation}
			continueAction={continueAction}
			secondaryAction={secondaryAction}
			pollsUntilGate={pollsUntilGate}
			codeSlot={
				<>
					{poll.codeSandboxExample && (
						<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
					)}
					{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
				</>
			}
		/>
	);
};

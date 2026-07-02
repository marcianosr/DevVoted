import { configs } from "~/domains/economy/data/configs";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";
import { getCategoryMetadata } from "~/domains/shared/categories";

import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import {
	buildAnswerReview,
	buildScoreSummary,
} from "~/domains/polls/utils/pollResult";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { PollResultScreen } from "~/ui/polls/PollResultScreen.ui";

import type { Poll } from "../models/poll.model";

type PollResultsSectionProps = {
	poll: Poll;
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	explanation?: string | null;
	perConfigCoverageEffects?: {
		configId: string;
		coverageAdd: number;
		coverageMult: number;
	}[];
};

export const PollResultsSection = ({
	poll,
	selectedOptions,
	score,
	communityStats,
	explanation,
	perConfigCoverageEffects,
}: PollResultsSectionProps) => {
	const optionBreakdown = communityStats?.optionBreakdown ?? [];
	const coverageEffects = perConfigCoverageEffects ?? [];

	return (
		<PollResultScreen
			question={poll.question}
			categoryName={getCategoryMetadata(poll.categoryCode).name}
			options={buildAnswerReview(optionBreakdown, selectedOptions)}
			scoreSummary={
				score ? buildScoreSummary(score, coverageEffects, configs) : undefined
			}
			explanation={explanation}
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

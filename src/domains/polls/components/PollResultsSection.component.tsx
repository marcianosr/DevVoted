import { Config } from "~/domains/economy/models/config.model";
import type { ExposedConfigDeck } from "~/domains/runs/api/run.queries";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";
import type { CategoryCode } from "~/domains/shared/categories";
import type { Run } from "~/domains/runs/models/run.model";

import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import type { CategoryAwardWithHolder } from "~/domains/awards/models/award";
import type { Poll } from "../models/poll.model";
import type { PollOption } from "../models/pollOption.model";
import { PostAnswerCarousel } from "./PostAnswerCarousel.component";

type PipelineResultProps = {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

type PollResultsSectionProps = {
	poll: Poll;
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	categoryAwards?: CategoryAwardWithHolder[];
	categoryCode: CategoryCode;
	explanation?: string | null;
	exposedConfigDeck?: ExposedConfigDeck | null;
	offeredConfigs: (Config & { originalCost?: number })[];
	nextOfferedConfigs: (Config & { originalCost?: number })[];
	activeRun: Run;
	reductionCost: number;
	storageBonus?: number;
	perConfigCoverageEffects?: {
		configId: string;
		coverageAdd: number;
		coverageMult: number;
	}[];
	pipeline?: PipelineResultProps;
	date: string;
};

export const PollResultsSection = (props: PollResultsSectionProps) => (
	<PostAnswerCarousel {...props} />
);

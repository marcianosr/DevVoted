import { Config } from "~/domains/configs/models/config";
import type { ExposedConfigDeck } from "~/domains/runs/api/queries";
import type { PipelineSlot } from "~/domains/runs/models/pipeline";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type { ScoreCalculation } from "~/domains/score/services/score.service";
import type { CategoryCode } from "~/domains/shared/categories";
import type { Run } from "~/domains/runs/models/run";

import type { CommunityStats } from "~/domains/polls/daily/communityStats.queries";
import type { Poll } from "../models/poll";
import type { PollOption } from "../models/pollOption";
import { PostAnswerCarousel } from "./PostAnswerCarousel";

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
};

export const PollResultsSection = (props: PollResultsSectionProps) => (
	<PostAnswerCarousel {...props} />
);

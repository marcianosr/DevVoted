import { useEffect, useState } from "react";

import { clsx } from "clsx";

import type { ApplyEffects } from "~/domains/configs/data/configs";
import type { Config } from "~/domains/configs/models/config";
import ShopContainer from "~/domains/economy/components/ShopContainer";
import CommunitySectionDisplay from "~/domains/polls/components/CommunitySectionDisplay";
import SelectedOptionsSummary from "~/domains/polls/components/SelectedOptionsSummary";
import type { ExposedConfigDeck } from "~/domains/runs/api/queries";
import { UpgradePipelineSection } from "~/domains/runs/components/UpgradePipelineSection";
import type { UpgradeCard } from "~/domains/runs/models/pipeline";
import type { Run } from "~/domains/runs/models/run";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import type { ScoreCalculation } from "~/domains/score/services/score.service";
import type { CategoryCode } from "~/domains/shared/categories";
import { PrimaryButton } from "~/ui/PrimaryButton";
import { getTodayDateString } from "~/lib/dateUtils";

import type { CommunityStats } from "../api/queries";
import type { PollOption } from "../models/pollOption";

type PostAnswerStep = "result" | "pipeline-selection" | "shop" | "community";

const STEP_LABELS: Record<PostAnswerStep, string> = {
	result: "Results",
	"pipeline-selection": "Pipeline",
	shop: "Shop",
	community: "Community",
};

type PostAnswerFlowProps = {
	pendingUpgradeCards: UpgradeCard[];
	onUpgradeAccepted: (card: UpgradeCard) => void;
	isUpgradePending: boolean;
	activeRun: Run;
	options: PollOption[];
	selectedOptions: string[];
	score?: ScoreCalculation;
	communityStats?: CommunityStats;
	categoryCode: CategoryCode;
	explanation?: string | null;
	exposedConfigDeck?: ExposedConfigDeck | null;
	lastEvaluationContext: PipelineEvaluationContext | null;
	lastPipelineEvaluation: PipelineEvaluation | null;
	offeredConfigs: (Config & { originalCost?: number })[];
	configEffects: ApplyEffects;
};

const PostAnswerFlow = ({
	pendingUpgradeCards,
	onUpgradeAccepted,
	isUpgradePending,
	activeRun,
	options,
	selectedOptions,
	score,
	communityStats,
	categoryCode,
	explanation,
	exposedConfigDeck,
	lastEvaluationContext,
	lastPipelineEvaluation,
	offeredConfigs,
	configEffects,
}: PostAnswerFlowProps) => {
	const [currentStep, setCurrentStep] = useState<PostAnswerStep>("result");
	const [unlockedSteps, setUnlockedSteps] = useState<Set<PostAnswerStep>>(
		new Set(["result"])
	);

	const today = getTodayDateString();

	const steps: PostAnswerStep[] =
		pendingUpgradeCards.length > 0
			? ["result", "pipeline-selection", "shop", "community"]
			: ["result", "shop", "community"];

	const currentIndex = steps.indexOf(currentStep);

	const goToStep = (step: PostAnswerStep) => {
		if (!unlockedSteps.has(step)) return;
		setCurrentStep(step);
	};

	const goToNextStep = () => {
		if (currentIndex < steps.length - 1) {
			const next = steps[currentIndex + 1];
			setCurrentStep(next);
			setUnlockedSteps((prev) => new Set([...prev, next]));
		}
	};

	// Auto-advance from pipeline-selection once upgrade is applied (cards clear)
	useEffect(() => {
		if (
			currentStep === "pipeline-selection" &&
			pendingUpgradeCards.length === 0
		) {
			setCurrentStep("shop");
			setUnlockedSteps((prev) => new Set([...prev, "shop"]));
		}
	}, [pendingUpgradeCards.length, currentStep]);

	const isShopOpen = activeRun.shopSkippedDate !== today;

	return (
		<div>
			<nav className="flex items-center gap-6 mb-8 py-4 border-b border-theme">
				{steps.map((step, i) => {
					const isActive = step === currentStep;
					const isUnlocked = unlockedSteps.has(step);

					return (
						<button
							key={step}
							onClick={() => goToStep(step)}
							disabled={!isUnlocked}
							className={clsx(
								"flex items-center gap-2 text-sm transition-colors",
								isActive && "text-white font-semibold",
								!isActive && isUnlocked && "text-gray-400 hover:text-white",
								!isUnlocked && "text-gray-600 cursor-not-allowed"
							)}
						>
							<span
								className={clsx(
									"w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0",
									isActive
										? "bg-white text-black border-white"
										: isUnlocked
											? "border-gray-400 text-gray-400"
											: "border-gray-600 text-gray-600"
								)}
							>
								{i + 1}
							</span>
							{STEP_LABELS[step]}
						</button>
					);
				})}
			</nav>

			{currentStep === "result" && (
				<div>
					<SelectedOptionsSummary
						options={options}
						selectedOptions={selectedOptions}
						score={score}
						explanation={explanation}
						pipeline={{
							slots: activeRun.pipelineSlots,
							evaluationContext: lastEvaluationContext ?? undefined,
							evaluation: lastPipelineEvaluation ?? undefined,
						}}
					/>
					<div className="mt-8 mb-8">
						<PrimaryButton onClick={goToNextStep}>Continue →</PrimaryButton>
					</div>
				</div>
			)}

			{currentStep === "pipeline-selection" && (
				<div className="mt-4">
					<h2 className="text-green-400 text-2xl mb-6">
						Pipeline check passed! Select a new pipeline or upgrade an existing
						one.
					</h2>
					<UpgradePipelineSection
						cards={pendingUpgradeCards}
						currentSlots={activeRun.pipelineSlots}
						onAccept={onUpgradeAccepted}
						isPending={isUpgradePending}
						evaluationContext={lastEvaluationContext ?? undefined}
						evaluation={lastPipelineEvaluation ?? undefined}
					/>
				</div>
			)}

			{currentStep === "shop" && (
				<div>
					<ShopContainer
						activeRun={activeRun}
						offeredConfigs={offeredConfigs}
						nextOfferedConfigs={[]}
						reductionCost={configEffects.reductionCost}
						isOpen={isShopOpen}
						storageBonus={configEffects.storage.skipBonus}
					/>
					<div className="mt-8 mb-8">
						<PrimaryButton onClick={goToNextStep}>
							Continue to community →
						</PrimaryButton>
					</div>
				</div>
			)}

			{currentStep === "community" && (
				<CommunitySectionDisplay
					communityStats={communityStats}
					exposedConfigDeck={exposedConfigDeck}
					categoryCode={categoryCode}
				/>
			)}
		</div>
	);
};

export default PostAnswerFlow;

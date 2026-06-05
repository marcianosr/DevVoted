import { useState } from "react";

import { clsx } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";

import UserAvatar from "~/domains/users/components/UserAvatar.component";
import { UserTitle } from "~/domains/users/components/UserTitle.component";
import { AwardsGrid } from "~/domains/awards/components/AwardsGrid.component";
import { AvatarPopover } from "~/domains/economy/components/AvatarPopover.component";
import { AvatarWithBorder } from "~/domains/economy/components/AvatarWithBorder.component";
import ExposedConfigDeckDisplay from "~/domains/economy/components/ExposedConfigDeckDisplay.component";
import { Config } from "~/domains/economy/models/config.model";
import ShopContainer from "~/domains/economy/components/ShopContainer.component";
import CategoryWeightsDisplay from "~/domains/polls/components/CategoryWeightsDisplay.component";
import GatesMinimap from "~/domains/polls/components/GatesMinimap.component";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { PollQuestionDisplay } from "~/domains/polls/components/PollQuestionDisplay.component";
import type { ExposedConfigDeck } from "~/domains/runs/api/run.queries";
import type { PipelineSlot } from "~/domains/runs/models/pipeline.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { CategoryCoverageGrid } from "~/domains/runs/components/CategoryCoverageGrid.component";
import { CurrentPipeline } from "~/domains/runs/components/UpgradePipelineSection.component";
import type { Run } from "~/domains/runs/models/run.model";
import type { ScoreCalculation } from "~/domains/runs/services/score.service";
import {
	CATEGORY_METADATA,
	type CategoryCode,
} from "~/domains/shared/categories";

import MarkdownText from "./MarkdownText.component";
import { ScoreBlock } from "./ScoreBlock.component";
import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import { sortCommunityOptions } from "~/domains/polls/utils/sortCommunityOptions";
import type { Poll } from "../models/poll.model";

type PipelineProps = {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

type PostAnswerCarouselProps = {
	poll: Poll;
	selectedOptions: string[];
	score?: ScoreCalculation;
	perConfigCoverageEffects?: {
		configId: string;
		coverageAdd: number;
		coverageMult: number;
	}[];
	communityStats?: CommunityStats;
	categoryCode: CategoryCode;
	explanation?: string | null;
	exposedConfigDeck?: ExposedConfigDeck | null;
	pipeline?: PipelineProps;
	offeredConfigs: (Config & { originalCost?: number })[];
	nextOfferedConfigs: (Config & { originalCost?: number })[];
	activeRun: Run;
	reductionCost: number;
	storageBonus?: number;
	date: string;
};

const STEPS = ["Today's Poll", "Score & Pipelines", "Shop"] as const;

const formatTimeTaken = (ms: number | null): string | null => {
	if (ms === null) return null;
	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

type CommunityAwardCardProps = {
	title: string;
	subtitle?: React.ReactNode;
	user: NonNullable<CommunityStats["firstToAnswer"]>;
};

const CommunityAwardCard = ({
	title,
	subtitle,
	user,
}: CommunityAwardCardProps) => (
	<div className="w-48 flex flex-col h-full">
		<div className="space-y-1">
			<p className="text-xl">{title}</p>
			{subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
		</div>
		<div className="flex flex-col items-start gap-4 w-32 mx-auto mt-auto pt-6">
			<AvatarWithBorder
				photoUrl={user.photoUrl}
				displayName={user.displayName ?? user.id}
				borderId={user.equippedBorderId}
				size="xl"
			/>
			<p
				className="w-full truncate text-sm"
				title={user.displayName ?? undefined}
			>
				{user.displayName}
			</p>
			<UserTitle role={user.role} />
		</div>
	</div>
);

const timeTakenSubtitle = (ms: number | null) =>
	ms !== null ? `in ${formatTimeTaken(ms)}` : null;

export const PostAnswerCarousel = ({
	poll,
	selectedOptions,
	score,
	perConfigCoverageEffects,
	communityStats,
	categoryCode,
	explanation,
	exposedConfigDeck,
	pipeline,
	offeredConfigs,
	nextOfferedConfigs,
	activeRun,
	reductionCost,
	storageBonus,
	date,
}: PostAnswerCarouselProps) => {
	const [step, setStep] = useState(0);

	const isShopOpen = activeRun.shopSkippedDate !== date;

	const stepLabel = (label: string) => {
		if (label !== "Shop") return label;
		return (
			<span className="flex items-center gap-1.5">
				{label}
				<span className={isShopOpen ? "text-green-400" : "text-red-400"}>
					{isShopOpen ? "(open)" : "(closed)"}
				</span>
			</span>
		);
	};

	return (
		<div>
			<nav className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0 py-4 border-b border-theme mb-8">
				<div className="flex justify-between md:contents">
					<button
						onClick={() => setStep((s) => s - 1)}
						disabled={step === 0}
						className="text-md disabled:opacity-20 cursor-pointer disabled:cursor-default"
					>
						← Back
					</button>
					<button
						onClick={() => setStep((s) => s + 1)}
						disabled={step === STEPS.length - 1}
						className="text-md disabled:opacity-20 cursor-pointer disabled:cursor-default md:order-last"
					>
						Next →
					</button>
				</div>
				<div className="flex gap-3 justify-center">
					{STEPS.map((label, i) => (
						<button
							key={label}
							onClick={() => setStep(i)}
							className={clsx(
								"cursor-pointer",
								i === step ? "text-white" : "text-zinc-600"
							)}
						>
							{stepLabel(label)}
						</button>
					))}
				</div>
			</nav>

			<div>
				{step === 0 && (
					<div className="space-y-8">
						<section className="space-y-4">
							<PollQuestionDisplay poll={poll} />
							{poll.codeSandboxExample && (
								<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
							)}
							{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
						</section>

						<section className="space-y-2">
							{communityStats?.optionBreakdown &&
								communityStats.optionBreakdown.length > 0 && (
									<>
										<p className="text-2xl">
											{communityStats.totalResponses} other player
											{communityStats.totalResponses === 1 ? "" : "s"} answered:
										</p>
										<ul className="flex flex-col gap-4">
											{sortCommunityOptions(communityStats.optionBreakdown).map(
												(opt) => {
													const hasVotes = opt.voters.length > 0;
													const isYourPick = selectedOptions.includes(
														opt.optionId.toString()
													);
													return (
														<li
															key={opt.optionId}
															className={clsx(
																"flex items-center gap-3 border-l-4",
																isYourPick
																	? "border-theme bg-theme/30"
																	: "border-transparent"
															)}
														>
															<span
																className={clsx(
																	"shrink-0 inline-flex items-center justify-center w-5 h-5 text-lg",
																	opt.isCorrect
																		? "text-green-400"
																		: "text-red-400"
																)}
																aria-label={
																	opt.isCorrect
																		? "Correct option"
																		: "Incorrect option"
																}
															>
																{opt.isCorrect ? "✓" : "✗"}
															</span>
															<div className="text-white markdown flex-1 min-w-0 wrap-break-word [&_p]:m-0">
																<MarkdownText>{opt.optionText}</MarkdownText>
															</div>
															<div className="shrink-0 flex items-center gap-2 text-sm">
																{isYourPick && (
																	<span className="px-1.5 py-0.5 text-xs uppercase tracking-wide bg-theme text-black">
																		Your pick
																	</span>
																)}
																<span>
																	{opt.voters.length} pick
																	{opt.voters.length === 1 ? "" : "s"}
																</span>
																{hasVotes && (
																	<div className="flex -space-x-2 items-center">
																		{opt.voters.map((user) => (
																			<AvatarPopover
																				key={user.id}
																				displayName={
																					user.displayName ?? user.id
																				}
																				photoUrl={user.photoUrl}
																				borderId={user.equippedBorderId}
																				role={user.role}
																				pipelineSlots={
																					user.activeRunPipelineSlots
																				}
																			>
																				<AvatarWithBorder
																					photoUrl={user.photoUrl}
																					displayName={
																						user.displayName ?? user.id
																					}
																					borderId={user.equippedBorderId}
																					size="xs"
																				/>
																			</AvatarPopover>
																		))}
																	</div>
																)}
															</div>
														</li>
													);
												}
											)}
										</ul>
									</>
								)}

							{explanation && (
								<div className="mt-6 p-4 bg-gray-800/40 border border-gray-700">
									<h4 className="text-xl mb-2">💡 Explanation</h4>
									<div className="markdown text-gray-300">
										<MarkdownText>{explanation}</MarkdownText>
									</div>
								</div>
							)}
						</section>

						<section className="border-t border-theme pt-8 space-y-2">
							<h3 className="text-4xl">👥 Community</h3>
							<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xl">
								<span>
									{communityStats?.totalResponses} player(s) participated in
									today&apos;s poll
								</span>
								<div className="flex -space-x-2">
									{communityStats?.users.map((user) => (
										<AvatarPopover
											key={user.id}
											displayName={user.displayName ?? user.id}
											photoUrl={user.photoUrl}
											borderId={user.equippedBorderId}
											role={user.role}
											pipelineSlots={user.activeRunPipelineSlots}
										>
											<UserAvatar user={user} />
										</AvatarPopover>
									))}
								</div>
							</div>
							<div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-6 mt-4">
								{communityStats?.firstToAnswer && (
									<CommunityAwardCard
										title="First to answer"
										subtitle={timeTakenSubtitle(
											communityStats.firstToAnswer.timeTakenMs
										)}
										user={communityStats.firstToAnswer}
									/>
								)}
								{communityStats?.fastestResponder && (
									<CommunityAwardCard
										title="Fastest responder"
										subtitle={timeTakenSubtitle(
											communityStats.fastestResponder.timeTakenMs
										)}
										user={communityStats.fastestResponder}
									/>
								)}
								{communityStats?.firstGood && (
									<CommunityAwardCard
										title="First good"
										subtitle={timeTakenSubtitle(
											communityStats.firstGood.timeTakenMs
										)}
										user={communityStats.firstGood}
									/>
								)}
								{communityStats?.mostPollsInCategory && (
									<CommunityAwardCard
										title={`Most polls in ${CATEGORY_METADATA[communityStats.mostPollsInCategory.categoryCode].name}`}
										subtitle={`Answered the most polls in ${CATEGORY_METADATA[communityStats.mostPollsInCategory.categoryCode].name} with ${communityStats.mostPollsInCategory.count} poll${communityStats.mostPollsInCategory.count === 1 ? "" : "s"}!`}
										user={communityStats.mostPollsInCategory.user}
									/>
								)}
							</div>
							{communityStats?.playersInActiveRun &&
								(communityStats.playersInActiveRun.length > 0 ||
									(communityStats.playersFallenOnDate?.length ?? 0) > 0) && (
									<GatesMinimap
										players={communityStats.playersInActiveRun}
										fallenPlayers={communityStats.playersFallenOnDate}
										viewerUserId={activeRun.userId}
									/>
								)}
							{exposedConfigDeck && (
								<ExposedConfigDeckDisplay deck={exposedConfigDeck} />
							)}
							<CategoryWeightsDisplay />
						</section>
					</div>
				)}

				{step === 1 && (
					<div className="space-y-8">
						<div className="flex flex-col gap-8 md:flex-row md:gap-12">
							<div className="md:w-1/3 shrink-0">
								{score ? (
									<ScoreBlock
										score={score}
										perConfigCoverageEffects={perConfigCoverageEffects}
									/>
								) : (
									<p className="text-zinc-500 text-xl">No score available.</p>
								)}
							</div>
							{pipeline && pipeline.slots.length > 0 && (
								<div className="flex-1 min-w-0">
									<CurrentPipeline
										slots={pipeline.slots}
										evaluationContext={pipeline.evaluationContext}
										evaluation={pipeline.evaluation}
									/>
								</div>
							)}
						</div>
						<section className="md:w-1/2">
							<CategoryCoverageGrid
								categoryCoverage={activeRun.categoryCoverage}
								currentCategoryCode={categoryCode}
							/>
						</section>

						<section className="border-t border-theme pt-8">
							<AwardsGrid />
						</section>
					</div>
				)}

				{step === 2 && (
					<ShopContainer
						activeRun={activeRun}
						offeredConfigs={offeredConfigs}
						nextOfferedConfigs={nextOfferedConfigs}
						reductionCost={reductionCost}
						storageBonus={storageBonus}
						isOpen={isShopOpen}
						date={date}
					/>
				)}
			</div>
		</div>
	);
};

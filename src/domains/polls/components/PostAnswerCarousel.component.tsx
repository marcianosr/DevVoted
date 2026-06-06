import { useState } from "react";

import { clsx } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";

import { Avatar } from "~/domains/users/components/Avatar.component";
import { AvatarPopover } from "~/domains/economy/components/AvatarPopover.component";
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

const STEPS = ["Today's Poll", "Pipeline", "Shop"] as const;

const formatTimeTaken = (ms: number | null): string | null => {
	if (ms === null) return null;
	const duration = intervalToDuration({ start: 0, end: ms });
	return formatDuration(duration, { format: ["hours", "minutes", "seconds"] });
};

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

const timeTakenSubtitle = (ms: number | null) =>
	ms !== null ? `in ${formatTimeTaken(ms)}` : null;

export const PostAnswerCarousel = ({
	poll,
	selectedOptions,
	score,
	perConfigCoverageEffects,
	communityStats,
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
							<h2 className="text-4xl">Review your answer</h2>
							<div className="flex flex-col lg:flex-row gap-8">
								<div className="flex-1 min-w-0 space-y-2">
									{communityStats?.optionBreakdown &&
										communityStats.optionBreakdown.length > 0 && (
											<>
												<p className="text-xl text-zinc-300">
													{communityStats.totalResponses} other player
													{communityStats.totalResponses === 1 ? "" : "s"}{" "}
													answered:
												</p>
												<ul className="flex flex-col gap-4">
													{sortCommunityOptions(
														communityStats.optionBreakdown
													).map((opt) => {
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
																					user={user}
																					role={user.role}
																					pipelineSlots={
																						user.activeRunPipelineSlots
																					}
																					activeRunProgress={
																						user.activeRunProgress
																					}
																				>
																					<Avatar
																						user={user}
																						size="sm"
																						shape="square"
																					/>
																				</AvatarPopover>
																			))}
																		</div>
																	)}
																</div>
															</li>
														);
													})}
												</ul>
											</>
										)}
								</div>
							</div>

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
									today&apos;s poll ·
								</span>
								<div className="flex -space-x-2">
									{communityStats?.users.map((user) => (
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
							<div className="pt-2">
								<h4 className="text-2xl text-theme">Top Committers</h4>
								<p className="text-zinc-300">Players who stood out today</p>
								<ul>
									{communityStats?.firstToAnswer && (
										<CommunityAwardRow
											title="First to answer"
											meta={timeTakenSubtitle(
												communityStats.firstToAnswer.timeTakenMs
											)}
											user={communityStats.firstToAnswer}
										/>
									)}
									{communityStats?.fastestResponder && (
										<CommunityAwardRow
											title="Fastest responder"
											meta={timeTakenSubtitle(
												communityStats.fastestResponder.timeTakenMs
											)}
											user={communityStats.fastestResponder}
										/>
									)}
									{communityStats?.firstGood && (
										<CommunityAwardRow
											title="First good"
											meta={timeTakenSubtitle(
												communityStats.firstGood.timeTakenMs
											)}
											user={communityStats.firstGood}
										/>
									)}
									{communityStats?.mostPollsInCategory && (
										<CommunityAwardRow
											title={`Highest participation in ${CATEGORY_METADATA[communityStats.mostPollsInCategory.categoryCode].name}`}
											meta={`${communityStats.mostPollsInCategory.count} poll${communityStats.mostPollsInCategory.count === 1 ? "" : "s"}`}
											user={communityStats.mostPollsInCategory.user}
										/>
									)}
									{communityStats?.mostCorrectInCategory && (
										<CommunityAwardRow
											title={`Highest correctly answered polls in ${CATEGORY_METADATA[communityStats.mostCorrectInCategory.categoryCode].name}`}
											meta={`${communityStats.mostCorrectInCategory.count} poll${communityStats.mostCorrectInCategory.count === 1 ? "" : "s"}`}
											user={communityStats.mostCorrectInCategory.user}
										/>
									)}
								</ul>
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
					<div className="flex flex-col lg:flex-row gap-8">
						{score && (
							<aside className="lg:w-80 shrink-0 bg-zinc-900 p-4">
								<ScoreBlock
									score={score}
									perConfigCoverageEffects={perConfigCoverageEffects}
								/>
							</aside>
						)}
						<div className="flex-1 min-w-0">
							{pipeline && pipeline.slots.length > 0 ? (
								<CurrentPipeline
									slots={pipeline.slots}
									evaluationContext={pipeline.evaluationContext}
									evaluation={pipeline.evaluation}
								/>
							) : (
								<p className="text-zinc-500 text-xl">No pipeline available.</p>
							)}
						</div>
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

import { useState } from "react";

import { clsx } from "clsx";
import { formatDuration, intervalToDuration } from "date-fns";

import UserAvatar from "~/domains/users/components/UserAvatar.component";
import ExposedConfigDeckDisplay from "~/domains/economy/components/ExposedConfigDeckDisplay.component";
import { Config } from "~/domains/economy/models/config.model";
import ShopContainer from "~/domains/economy/components/ShopContainer.component";
import CategoryWeightsDisplay from "~/domains/polls/components/CategoryWeightsDisplay.component";
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
import type { CategoryCode } from "~/domains/shared/categories";

import MarkdownText from "./MarkdownText.component";
import { ScoreBlock } from "./ScoreBlock.component";
import type { CommunityStats } from "~/domains/polls/api/communityStats.queries";
import { sortCommunityOptions } from "~/domains/polls/utils/sortCommunityOptions";
import type { Poll } from "../models/poll.model";
import type { PollOption } from "../models/pollOption.model";

type PipelineProps = {
	slots: PipelineSlot[];
	evaluationContext?: PipelineEvaluationContext;
	evaluation?: PipelineEvaluation;
};

type PostAnswerCarouselProps = {
	poll: Poll;
	options: PollOption[];
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

export const PostAnswerCarousel = ({
	poll,
	options,
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

	const allAnswersCorrect = selectedOptions.every((optionId) => {
		const option = options.find((opt) => opt.id === Number(optionId));
		return option?.correct;
	});

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
			<nav className="flex items-center justify-between py-4 border-b border-theme mb-8">
				<button
					onClick={() => setStep((s) => s - 1)}
					disabled={step === 0}
					className="text-xl disabled:opacity-20 cursor-pointer disabled:cursor-default"
				>
					← Back
				</button>
				<div className="flex gap-3">
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
				<button
					onClick={() => setStep((s) => s + 1)}
					disabled={step === STEPS.length - 1}
					className="text-xl disabled:opacity-20 cursor-pointer disabled:cursor-default"
				>
					Next →
				</button>
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
							<p className="text-2xl">Your choice(s):</p>
							<ul className="list-disc px-4">
								{selectedOptions.map((optionId) => {
									const option = options.find(
										(opt) => opt.id === Number(optionId)
									);
									if (!option) return null;
									return (
										<li
											key={option.id}
											className={clsx(
												"text-xl markdown",
												option.correct ? "text-green-400" : "text-red-400"
											)}
										>
											<MarkdownText>{option.option}</MarkdownText>
										</li>
									);
								})}
							</ul>

							{!allAnswersCorrect && (
								<>
									<h3 className="text-2xl">Correct answer(s) you missed:</h3>
									<ul className="list-disc px-4">
										{options.map((opt) =>
											!selectedOptions.includes(opt.id.toString()) &&
											opt.correct ? (
												<li
													key={opt.id}
													className="text-green-400 text-xl markdown"
												>
													<MarkdownText>{opt.option}</MarkdownText>
												</li>
											) : null
										)}
									</ul>
								</>
							)}

							<h3 className="text-2xl">Correct answer(s):</h3>
							<ul className="list-disc px-4">
								{options
									.filter((opt) => opt.correct)
									.map((opt) => (
										<li
											key={opt.id}
											className="text-green-400 text-xl markdown"
										>
											<MarkdownText>{opt.option}</MarkdownText>
										</li>
									))}
							</ul>

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
							<div className="flex items-center gap-2 text-xl">
								<span>
									{communityStats?.totalResponses} player(s) participated in
									today&apos;s poll
								</span>
								<span>·</span>
								<div className="flex -space-x-2">
									{communityStats?.users.map((user) => (
										<UserAvatar key={user.id} user={user} />
									))}
								</div>
							</div>
							{communityStats?.firstToAnswer && (
								<div>
									<p className="text-xl mt-4">First to answer</p>
									<div className="flex gap-2 items-center">
										<UserAvatar user={communityStats.firstToAnswer} />
										<p>{communityStats.firstToAnswer.displayName}</p>
										<span>·</span>
										{communityStats.firstToAnswer.timeTakenMs !== null && (
											<span className="text-zinc-400 text-sm">
												in{" "}
												{formatTimeTaken(
													communityStats.firstToAnswer.timeTakenMs
												)}
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
												in{" "}
												{formatTimeTaken(
													communityStats.fastestResponder.timeTakenMs
												)}
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
												in{" "}
												{formatTimeTaken(communityStats.firstGood.timeTakenMs)}
											</span>
										)}
									</div>
								</div>
							)}
							{communityStats?.playersInActiveRun &&
								communityStats.playersInActiveRun.length > 0 && (
									<div className="mt-4">
										<p className="text-xl">
											{communityStats.playersInActiveRun.length} player(s)
											currently in a run
										</p>
										<div className="flex -space-x-2 items-center mt-1">
											{communityStats.playersInActiveRun.map((user) => (
												<UserAvatar key={user.id} user={user} />
											))}
										</div>
									</div>
								)}
							{communityStats?.optionBreakdown &&
								communityStats.optionBreakdown.length > 0 &&
								communityStats.totalResponses > 0 && (
									<div className="mt-6">
										<p className="text-xl mb-2">
											How the {communityStats.totalResponses} voter(s) split
										</p>
										<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
											{sortCommunityOptions(communityStats.optionBreakdown).map(
												(opt) => {
													const hasVotes = opt.voters.length > 0;
													const isWideOption = opt.optionText.length > 60;
													return (
														<li
															key={opt.optionId}
															className={clsx(
																"border border-gray-800 p-3",
																isWideOption && "sm:col-span-2 lg:col-span-3"
															)}
														>
															<div className="flex items-start gap-2">
																<span
																	className={clsx(
																		"shrink-0 text-lg leading-none",
																		opt.isCorrect
																			? "text-green-400"
																			: "text-gray-600"
																	)}
																	aria-label={
																		opt.isCorrect
																			? "Correct option"
																			: "Incorrect option"
																	}
																>
																	{opt.isCorrect ? "✓" : "·"}
																</span>
																<div className="markdown flex-1 min-w-0 break-words">
																	<MarkdownText>{opt.optionText}</MarkdownText>
																</div>
															</div>
															<div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
																<span>
																	{opt.voters.length} pick
																	{opt.voters.length === 1 ? "" : "s"}
																</span>
																{hasVotes && (
																	<>
																		<span>·</span>
																		<div className="flex -space-x-2 items-center">
																			{opt.voters.map((user) => (
																				<UserAvatar key={user.id} user={user} />
																			))}
																		</div>
																	</>
																)}
															</div>
														</li>
													);
												}
											)}
										</ul>
									</div>
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

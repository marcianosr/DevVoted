import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ApplyEffects } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import {
	getRandomAnswerHandler,
	getScoreBreakdownHandler,
} from "~/domains/polls/api/dailyPoll.handlers";
import { getCommunityStats } from "~/domains/polls/api/communityStats";
import { postPollOptions } from "~/domains/polls/api/polls";
import { PollLastSeenBadge } from "~/domains/polls/components/PollLastSeenBadge.component";
import PollOptionsForm from "~/domains/polls/components/PollOptionsForm.component";
import { PollResultsSection } from "~/domains/polls/components/PollResultsSection.component";
import { getActiveConfigs } from "~/domains/economy/services/configManager.service";
import {
	findWrongOptionConfig,
	getConfigsApplyingToPollCategory,
} from "~/domains/polls/utils/pollConfigs";
import type { ActivePollConfig } from "~/ui/polls/PollActiveConfigStrip.ui";
import type { RemovedByConfig } from "~/ui/polls/PollOptionRow.ui";
import { Poll } from "~/domains/polls/models/poll.model";
import { PollOption } from "~/domains/polls/models/pollOption.model";
import type { Run } from "~/domains/runs/models/run.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { ScoreCalculation } from "~/domains/runs/services/score.service";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { getAuthenticatedUserId } from "~/utils/authorization";

export const getScoreBreakdown = createServerFn({ method: "GET" })
	.validator(
		z.object({
			pollId: z.number().int().positive(),
			selectedOptions: z.array(z.string()),
			hasAnswered: z.boolean(),
		})
	)
	.handler(async ({ data }) => {
		const userId = await getAuthenticatedUserId();
		const result = await getScoreBreakdownHandler({
			data: {
				pollId: data.pollId,
				selectedOptions: data.selectedOptions,
				hasAnswered: data.hasAnswered,
				userId,
			},
		});

		if (!result || !result.success) {
			throw new Error("Failed to get score breakdown");
		}

		return result.data;
	});

const getRandomAnswer = createServerFn({ method: "GET" })
	.validator(z.object({ pollId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const result = await getRandomAnswerHandler({ data });

		if (!result || !result.success) {
			return null;
		}

		return result.data;
	});

type DailyPollContainerProps = {
	poll: Poll;
	options: PollOption[];
	hasAnswered: boolean;
	activeRun: Run;
	selectedOptions: string[];
	score: ScoreCalculation;
	configEffects: ApplyEffects;
	creatorDisplayName: string | null;
	isAdmin: boolean;
	offeredConfigs: (Config & { originalCost?: number })[];
	nextOfferedConfigs: (Config & { originalCost?: number })[];
	initialWindowContext: PipelineEvaluationContext | null;
	date: string;
	lastSeenAt: string | null;
	lastEncounteredAt: Date | null;
	timesEncountered: number;
};

const DailyPollContainer = ({
	poll,
	options,
	hasAnswered,
	selectedOptions,
	score,
	configEffects,
	creatorDisplayName,
	activeRun,
	isAdmin,
	initialWindowContext,
	lastSeenAt,
	lastEncounteredAt,
	timesEncountered,
}: DailyPollContainerProps) => {
	const router = useRouter();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const category = getCategoryMetadata(poll.categoryCode);

	// Installed configs that can act on THIS poll, shown as the "active configs"
	// strip on the answering screen.
	const applyingConfigs = getConfigsApplyingToPollCategory(
		getActiveConfigs(activeRun),
		poll.categoryCode
	);
	const activePollConfigs: ActivePollConfig[] = applyingConfigs.map(
		(config) => ({
			id: config.id,
			name: config.name,
			description: config.description,
			rarity: config.rarity,
		})
	);
	// The config (ESLint/Stylelint) that removed a wrong option, shown as a card
	// beside the disabled answer.
	const wrongOptionConfig = findWrongOptionConfig(applyingConfigs);
	const removalConfig: RemovedByConfig | undefined = wrongOptionConfig
		? {
				name: wrongOptionConfig.name,
				rarity: wrongOptionConfig.rarity,
				description: wrongOptionConfig.description,
			}
		: undefined;

	// Store the score from mutation to avoid stale data after router.invalidate()
	// The loader recalculates score with updated run data, which gives wrong values
	const [submittedScore, setSubmittedScore] = useState<ScoreCalculation | null>(
		null
	);

	const [lastEvaluationContext, setLastEvaluationContext] =
		useState<PipelineEvaluationContext | null>(initialWindowContext);
	const [lastPipelineEvaluation, setLastPipelineEvaluation] =
		useState<PipelineEvaluation | null>(null);

	useEffect(() => {
		if (initialWindowContext) {
			setLastEvaluationContext(initialWindowContext);
		}
	}, [initialWindowContext]);

	// Stays as query: would be nice to have real-time community stats after answering, see it update over time
	const { data: communityStats } = useQuery({
		queryKey: ["communityStats", poll.id],
		queryFn: () =>
			getCommunityStats({
				data: {
					pollId: poll.id,
				},
			}),
	});

	// Fetch random answer for telemetry hint (only when config is active and user hasn't answered)
	const showWhoPickedWhat = configEffects.showWhoPickedWhat ?? false;
	const { data: randomAnswer } = useQuery({
		queryKey: ["randomAnswer", poll.id],
		queryFn: () => getRandomAnswer({ data: { pollId: poll.id } }),
		enabled: showWhoPickedWhat && !hasAnswered,
	});

	const mutation = useMutation({
		mutationFn: postPollOptions,

		onSuccess: async (response) => {
			if (response.success) {
				// Store the breakdown from the mutation - this is the correct score
				// that was actually saved to the DB
				if (response.data.breakdown) {
					setSubmittedScore({
						breakdown: response.data.breakdown,
						newTotalCoverage: response.data.newTotalCoverage ?? 0,
						newBestStreak: 0,
						newStreak: response.data.breakdown.streak,
						newPollsAnswered: 0,
					});
				}

				if (response.data.evaluationContext) {
					setLastEvaluationContext(response.data.evaluationContext);
				}

				if (response.data.pipelineEvaluation) {
					setLastPipelineEvaluation(response.data.pipelineEvaluation);
				}

				if (response.data.runEnded) {
					await router.invalidate();
					navigate({ to: "/pipeline-failure" });
					return;
				}
			}

			await queryClient.invalidateQueries({
				queryKey: ["communityStats", poll.id],
			});
			router.invalidate();
		},
		onError: (error) => {
			console.error("Error submitting poll options", error);
		},
	});

	// Use the submitted score if available (just answered), otherwise fall back to loader's score
	const displayScore = submittedScore ?? score;

	// The review-screen forward button depends on whether this poll closed a
	// pipeline window. A pass routes to the reward screen; otherwise it just links
	// to the current pipeline. Failures never reach the review screen — they
	// redirect straight to /pipeline-failure from the mutation below. Both target
	// screens derive their own data server-side, so no params are passed.
	const reviewContinueAction = lastPipelineEvaluation?.passed
		? {
				label: "Go to pipeline check →",
				onClick: () => navigate({ to: "/pipeline-success" }),
			}
		: {
				label: "See pipelines →",
				onClick: () => navigate({ to: "/pipelines" }),
			};
	// Polls remaining in the current window before the next gate is evaluated.
	const pollsUntilGate = lastEvaluationContext
		? Math.max(
				0,
				lastEvaluationContext.pollsInWindow -
					lastEvaluationContext.pollsAnsweredInWindow
			)
		: undefined;
	const isInPostVictoryMode = activeRun.victoryAchievedAt !== null;

	const adminLink = isAdmin && (
		<div className="mb-4 pb-2 border-b border-gray-700">
			<Link
				to="/polls/$pollId/edit"
				params={{ pollId: String(poll.id) }}
				className="text-primary hover:text-primary/80 hover:underline text-sm"
			>
				Edit Poll
			</Link>
		</div>
	);

	const header = (
		<header className="border-b border-theme py-4 mb-8">
			<div className="flex flex-col">
				<p className="text-4xl text-theme">{category.name}</p>
				<p>Created by: {creatorDisplayName ?? "Unknown"}</p>
				<PollLastSeenBadge
					lastSeenAt={lastSeenAt}
					lastEncounteredAt={lastEncounteredAt}
					timesEncountered={timesEncountered}
				/>
			</div>
		</header>
	);

	return (
		<div className="flex gap-6 items-start">
			<section className="flex-1 min-w-0">
				{isInPostVictoryMode && (
					<div className="mb-6 p-4 border-2 border-green-500 bg-green-500/10">
						<p className="text-green-400 text-lg font-bold">
							You passed all CI gates!
						</p>
						<p className="text-gray-300 text-sm">
							You&apos;re now in post-victory mode. Keep playing to reach 100%
							coverage or start a new run anytime.
						</p>
					</div>
				)}
				{adminLink}
				{header}
				<div className="mt-4 mb-4">
					{hasAnswered ? (
						<PollResultsSection
							poll={poll}
							selectedOptions={selectedOptions}
							score={displayScore}
							communityStats={communityStats}
							explanation={poll.explanation}
							perConfigCoverageEffects={configEffects.perConfigCoverageEffects}
							continueAction={reviewContinueAction}
							pollsUntilGate={pollsUntilGate}
						/>
					) : (
						<PollOptionsForm
							poll={poll}
							options={options}
							hasAnswered={hasAnswered}
							effect={configEffects}
							selectedOptions={selectedOptions}
							activeConfigs={activePollConfigs}
							removalConfig={removalConfig}
							mutation={mutation}
							randomAnswer={randomAnswer ?? null}
						/>
					)}
				</div>
			</section>
		</div>
	);
};

export default DailyPollContainer;

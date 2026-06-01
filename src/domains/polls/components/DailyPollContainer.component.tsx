import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ApplyEffects } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import { removeConfigFromRunServerFn } from "~/domains/economy/api/configs";
import {
	getCommunityStatsHandler,
	getRandomAnswerHandler,
	getScoreBreakdownHandler,
} from "~/domains/polls/api/dailyPoll.handlers";
import { postPollOptions } from "~/domains/polls/api/polls";
import { PollCodeBlock } from "~/domains/polls/components/PollCodeBlock.component";
import { PollCodeSandboxEmbed } from "~/domains/polls/components/PollCodeSandboxEmbed.component";
import { PollLastSeenBadge } from "~/domains/polls/components/PollLastSeenBadge.component";
import PollOptionsForm from "~/domains/polls/components/PollOptionsForm.component";
import { PollQuestionDisplay } from "~/domains/polls/components/PollQuestionDisplay.component";
import { PollResultsSection } from "~/domains/polls/components/PollResultsSection.component";
import { Poll } from "~/domains/polls/models/poll.model";
import { PollOption } from "~/domains/polls/models/pollOption.model";
import { getExposedConfigDeck } from "~/domains/runs/api/runs";
import { ConfigDeckFooter } from "~/domains/economy/components/ConfigDeckFooter.component";
import { PipelineUpgradeContainer } from "~/domains/runs/components/PipelineUpgradeContainer.component";
import { useApplyPipelineUpgrade } from "~/domains/runs/hooks/useApplyPipelineUpgrade";
import type { UpgradeCard } from "~/domains/runs/models/pipeline.model";
import type { Run } from "~/domains/runs/models/run.model";
import type {
	PipelineEvaluation,
	PipelineEvaluationContext,
} from "~/domains/runs/services/pipelineEvaluator.service";
import { ScoreCalculation } from "~/domains/runs/services/score.service";
import { getCategoryMetadata } from "~/domains/shared/categories";
import { getAuthenticatedUserId } from "~/utils/authorization";

export const getScoreBreakdown = createServerFn({ method: "GET" })
	.inputValidator(
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

const getCommunityStats = createServerFn({ method: "GET" })
	.inputValidator(z.object({ pollId: z.number().int().positive() }))
	.handler(async ({ data }) => {
		const result = await getCommunityStatsHandler({ data });

		if (!result || !result.success) {
			throw new Error("Failed to get community stats");
		}

		return result.data;
	});

const getRandomAnswer = createServerFn({ method: "GET" })
	.inputValidator(z.object({ pollId: z.number().int().positive() }))
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
	initialPendingUpgradeCards: UpgradeCard[];
	initialWindowContext: PipelineEvaluationContext | null;
	date: string;
	lastSeenAt: Date | null;
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
	offeredConfigs,
	nextOfferedConfigs,
	initialPendingUpgradeCards,
	initialWindowContext,
	date,
	lastSeenAt,
}: DailyPollContainerProps) => {
	const router = useRouter();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const category = getCategoryMetadata(poll.categoryCode);

	// Store the score from mutation to avoid stale data after router.invalidate()
	// The loader recalculates score with updated run data, which gives wrong values
	const [submittedScore, setSubmittedScore] = useState<ScoreCalculation | null>(
		null
	);

	// Seeded from the run's persisted state so it survives page refreshes.
	const [pendingUpgradeCards, setPendingUpgradeCards] = useState<UpgradeCard[]>(
		initialPendingUpgradeCards
	);
	const [lastEvaluationContext, setLastEvaluationContext] =
		useState<PipelineEvaluationContext | null>(initialWindowContext);
	const [lastPipelineEvaluation, setLastPipelineEvaluation] =
		useState<PipelineEvaluation | null>(null);

	// Sync local state when the server-side cards update via router.invalidate().
	// useState only uses its argument on mount — when the context refreshes with new
	// cards (e.g., after a gate pass), the prop changes but state doesn't unless we
	// explicitly sync here.
	useEffect(() => {
		if (initialPendingUpgradeCards.length > 0) {
			setPendingUpgradeCards(initialPendingUpgradeCards);
		}
	}, [initialPendingUpgradeCards]);

	useEffect(() => {
		if (initialWindowContext) {
			setLastEvaluationContext(initialWindowContext);
		}
	}, [initialWindowContext]);

	const deinstallConfigMutation = useMutation({
		mutationFn: removeConfigFromRunServerFn,
		onSuccess: () => router.invalidate(),
	});

	const { apply: applyUpgrade, isPending: isUpgradePending } =
		useApplyPipelineUpgrade({
			onApplied: () => setPendingUpgradeCards([]),
		});

	const handleUpgradeAccepted = (card: UpgradeCard) => {
		setPendingUpgradeCards([]);
		applyUpgrade(card);
	};

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

	// Fetch exposed config deck (only when config is active and user has answered)
	const exposeConfigDeck = configEffects.exposeConfigDeck ?? false;

	const today = date;
	const isShopOpen = hasAnswered && activeRun.shopSkippedDate !== today;
	const onDeinstallConfig = (config: Config) => {
		deinstallConfigMutation.mutate({
			data: { configIds: [config.id], runId: activeRun.id, date: today },
		});
	};

	const { data: exposedConfigDeckResult } = useQuery({
		queryKey: ["exposedConfigDeck", today],
		queryFn: () => getExposedConfigDeck({ data: { date: today } }),
		enabled: exposeConfigDeck && hasAnswered,
	});

	const exposedConfigDeck =
		exposedConfigDeckResult?.success && exposedConfigDeckResult.data
			? exposedConfigDeckResult.data
			: null;

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

				if (response.data.upgradeCards?.length) {
					setPendingUpgradeCards(response.data.upgradeCards);
				}

				if (response.data.runEnded) {
					await router.invalidate();
					navigate({ to: "/game-over" });
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
				<PollLastSeenBadge lastSeenAt={lastSeenAt} />
			</div>
		</header>
	);

	const hasPendingUpgrade = pendingUpgradeCards.length > 0;

	if (hasPendingUpgrade && !hasAnswered) {
		return (
			<PipelineUpgradeContainer
				cards={pendingUpgradeCards}
				currentSlots={activeRun.pipelineSlots}
				onAccept={handleUpgradeAccepted}
				isPending={isUpgradePending}
				evaluationContext={lastEvaluationContext ?? undefined}
				evaluation={lastPipelineEvaluation ?? undefined}
			/>
		);
	}

	return (
		<section>
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
			{hasPendingUpgrade && hasAnswered && (
				<div className="mb-6 p-4 border border-green-500 bg-green-500/10 flex items-center justify-between">
					<div>
						<p className="text-green-400 font-bold">Pipeline upgrade ready</p>
						<p className="text-gray-300 text-sm">
							You cleared a gate — pick your reward before tomorrow&apos;s poll.
						</p>
					</div>
					<Link
						to="/pipelines"
						className="text-green-400 underline whitespace-nowrap"
					>
						Pick now
					</Link>
				</div>
			)}
			<div className="mt-4 mb-4">
				{hasAnswered ? (
					<PollResultsSection
						poll={poll}
						options={options}
						selectedOptions={selectedOptions}
						score={displayScore}
						communityStats={communityStats}
						categoryCode={poll.categoryCode}
						explanation={poll.explanation}
						exposedConfigDeck={exposedConfigDeck}
						offeredConfigs={offeredConfigs}
						nextOfferedConfigs={nextOfferedConfigs}
						activeRun={activeRun}
						reductionCost={configEffects.reductionCost}
						storageBonus={configEffects.storage?.skipBonus}
						perConfigCoverageEffects={configEffects.perConfigCoverageEffects}
						pipeline={{
							slots: activeRun.pipelineSlots,
							evaluationContext: lastEvaluationContext ?? undefined,
							evaluation: lastPipelineEvaluation ?? undefined,
						}}
						date={today}
					/>
				) : (
					<>
						<PollQuestionDisplay poll={poll} />
						{poll.codeSandboxExample && (
							<PollCodeSandboxEmbed url={poll.codeSandboxExample} />
						)}
						{poll.codeBlock && <PollCodeBlock code={poll.codeBlock} />}
						<PollOptionsForm
							poll={poll}
							options={options}
							hasAnswered={hasAnswered}
							effect={configEffects}
							selectedOptions={selectedOptions}
							mutation={mutation}
							randomAnswer={randomAnswer ?? null}
						/>
					</>
				)}
			</div>
			<ConfigDeckFooter
				activeRun={activeRun}
				onDeinstall={isShopOpen ? onDeinstallConfig : undefined}
			/>
		</section>
	);
};

export default DailyPollContainer;

import { useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { ApplyEffects } from "~/domains/economy/data/configs";
import { Config } from "~/domains/economy/models/config.model";
import { getRandomAnswerHandler } from "~/domains/polls/api/dailyPoll.handlers";
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
import { getCategoryMetadata } from "~/domains/shared/categories";
import {
	nextSnippetProgress,
	SNIPPET_MILESTONE_STEP,
} from "~/domains/runs/utils/snippetEarning";
import {
	snippetForMilestone,
	snippetTypeByIndex,
	type SnippetEffectKind,
	type SnippetType,
} from "~/domains/polls/data/snippets";
import { SnippetBar } from "~/ui/polls/SnippetBar.ui";

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

	// Snippet-prototype state the answer mutation reads (full block further down).
	const [earnMessage, setEarnMessage] = useState<string | null>(null);
	const [tryCatchArmed, setTryCatchArmed] = useState(false);
	const armedTryCatchRef = useRef(false);

	const mutation = useMutation({
		mutationFn: (vars: Parameters<typeof postPollOptions>[0]) =>
			postPollOptions({
				data: { ...vars.data, armedTryCatch: armedTryCatchRef.current },
			}),

		onSuccess: async (response) => {
			if (response.success) {
				if (response.data.evaluationContext) {
					setLastEvaluationContext(response.data.evaluationContext);
				}

				if (response.data.pipelineEvaluation) {
					setLastPipelineEvaluation(response.data.pipelineEvaluation);
				}

				if (response.data.tryCatchUsed) {
					armedTryCatchRef.current = false;
					setTryCatchArmed(false);
					setEarnMessage("try/catch caught a gate failure — run survives!");
				} else if (
					response.data.pipelineEvaluation &&
					armedTryCatchRef.current
				) {
					armedTryCatchRef.current = false;
					setTryCatchArmed(false);
					setEarnMessage("try/catch went unused this window — spent.");
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

	// --- Snippet prototype (Model A) -----------------------------------------
	// Earn typed snippets by crossing coverage milestones; spend them on a poll.
	// State is in-memory (survives answer refreshes, resets on hard reload) —
	// deliberately no persistence for this slice.
	const progress = nextSnippetProgress(activeRun.categoryCoverage);
	const [heldSnippets, setHeldSnippets] = useState<SnippetType[]>([]);
	// Snippets spent on the current poll, and which poll they apply to.
	const [spentPollId, setSpentPollId] = useState<number | null>(null);
	const [spentEffects, setSpentEffects] = useState<SnippetEffectKind[]>([]);

	// Debug "+1": grant a rotating snippet without gaining coverage first.
	const grantedCountRef = useRef(0);
	const grantDebugSnippet = () => {
		const snippet = snippetTypeByIndex(grantedCountRef.current);
		grantedCountRef.current += 1;
		setHeldSnippets((current) => [...current, snippet]);
	};

	const milestoneCount = (coverage: number) =>
		Math.floor(Math.max(0, coverage) / SNIPPET_MILESTONE_STEP);

	// Per-category milestones already reached, so only FUTURE crossings grant
	// snippets (avoids flooding the belt on a mid-run reload).
	const prevMilestonesRef = useRef<Record<string, number>>(
		Object.fromEntries(
			activeRun.categoryCoverage.map((category) => [
				category.categoryCode,
				milestoneCount(category.currentCoverage),
			])
		)
	);

	// When a category crosses another milestone, grant the snippet for that
	// category + tier — deep tiers (75%+) yield the category's signature snippet.
	useEffect(() => {
		const earned: SnippetType[] = [];
		activeRun.categoryCoverage.forEach((category) => {
			const current = milestoneCount(category.currentCoverage);
			const prev = prevMilestonesRef.current[category.categoryCode] ?? 0;
			for (let tier = prev + 1; tier <= current; tier += 1) {
				earned.push(snippetForMilestone(category.categoryCode, tier));
			}
			prevMilestonesRef.current[category.categoryCode] = current;
		});
		if (earned.length === 0) return;
		setHeldSnippets((current) => [...current, ...earned]);
		const last = earned[earned.length - 1];
		setEarnMessage(`Earned ${last.name} — coverage milestone reached.`);
		const timer = setTimeout(() => setEarnMessage(null), 4000);
		return () => clearTimeout(timer);
	}, [activeRun.categoryCoverage]);

	// Effects active on THIS poll (reset when the poll changes or after answering).
	const activeEffects =
		spentPollId === poll.id && !hasAnswered ? spentEffects : [];
	const wrongOptionIds = options
		.filter((option) => !option.correct)
		.map((option) => option.id);
	const removesTwo = activeEffects.includes("removeTwoWrong");
	const removesAll = activeEffects.includes("removeAllWrong");
	const removedOptionIds = removesAll
		? wrongOptionIds
		: removesTwo
			? wrongOptionIds.slice(0, 2)
			: [];
	const showsCorrectCount = activeEffects.includes("revealCorrectCount");

	const effectForForm: ApplyEffects = {
		...configEffects,
		showCorrectCount: configEffects.showCorrectCount || showsCorrectCount,
		renderProps: {
			...configEffects.renderProps,
			disabledOptionIds: [
				...(configEffects.renderProps.disabledOptionIds ?? []),
				...removedOptionIds,
			],
		},
	};

	const removalForForm: RemovedByConfig | undefined = removedOptionIds.length
		? {
				name: "Snippet",
				rarity: "rare",
				description: "You spent a snippet to remove wrong answers.",
			}
		: removalConfig;

	const spendSnippet = (index: number) => {
		const snippet = heldSnippets[index];
		if (!snippet || hasAnswered) return;
		if (snippet.effect === "armTryCatch") {
			armedTryCatchRef.current = true;
			setTryCatchArmed(true);
			setHeldSnippets((current) => current.filter((_, i) => i !== index));
			return;
		}
		const carried = spentPollId === poll.id ? spentEffects : [];
		setSpentPollId(poll.id);
		setSpentEffects([...carried, snippet.effect]);
		setHeldSnippets((current) => current.filter((_, i) => i !== index));
	};
	// -------------------------------------------------------------------------

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
				<SnippetBar
					held={heldSnippets}
					canSpend={!hasAnswered}
					onSpend={spendSnippet}
					onDebugEarn={grantDebugSnippet}
					earnMessage={earnMessage}
					tryCatchArmed={tryCatchArmed}
					progress={{
						toGo: progress.toGo,
						label: progress.categoryCode,
						pct: progress.pct,
					}}
				/>
				<div className="mt-4 mb-4">
					{hasAnswered ? (
						<PollResultsSection
							poll={poll}
							selectedOptions={selectedOptions}
							communityStats={communityStats}
							explanation={poll.explanation}
							continueAction={reviewContinueAction}
							pollsUntilGate={pollsUntilGate}
						/>
					) : (
						<PollOptionsForm
							poll={poll}
							options={options}
							hasAnswered={hasAnswered}
							effect={effectForForm}
							selectedOptions={selectedOptions}
							activeConfigs={activePollConfigs}
							removalConfig={removalForForm}
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

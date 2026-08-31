import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { createRun } from "~/modules/run/run/domain/run.model";
import {
	runReducer,
	RunAction,
} from "~/modules/run/run/domain/runAction.model";
import {
	type AnsweredPoll,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import type {
	CommunityOptionResult,
	CommunityStandout,
	CommunityVoter,
	RunCommunityPoll,
} from "~/modules/run/community/application/community.service";
import {
	RunCommunityBoard,
	type RunCommunityBoardProps,
} from "~/modules/run/community/presentation/RunCommunity.ui";
import { longestCorrectStreak } from "~/modules/run/community/domain/standouts.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { showsSampleSize } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { usePollClock } from "~/modules/run/run/presentation/usePollClock.hook";
import type { PollSplitView } from "~/modules/run/poll/presentation/PollCard.ui";
import { StartView } from "~/modules/run/build/presentation/StartView.component";
import { PollView } from "~/modules/run/run/presentation/PollView.component";
import { PrepView } from "~/modules/run/run/presentation/PrepView.component";
import { RevealView } from "~/modules/run/run/presentation/RevealView.component";
import { ReviewView } from "~/modules/run/run/presentation/ReviewView.component";
import { RemovalView } from "~/modules/run/gate/presentation/RemovalView.component";
import { RewardView } from "~/modules/run/gate/presentation/RewardView.component";
import { ShopView } from "~/modules/run/shop/presentation/ShopView.component";
import { RunHud } from "~/modules/run/run/presentation/RunHud.ui";
import { RunSummary } from "~/modules/run/run/presentation/RunSummary.ui";
import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { toRunView } from "~/modules/run/run/application/runView.viewmodel";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	type CategoryCode,
	getCategoryMetadata,
} from "~/shared/lib/categories";
import { Screen } from "~/ui/Screen.ui";
import { setScreenNavDirection } from "~/ui/screenNavDirection";
import { Stack } from "~/ui/Stack.ui";

export const Route = createFileRoute("/proto-run")({
	component: RouteComponent,
	beforeLoad: () => {
		if (import.meta.env.PROD) throw redirect({ to: "/" });
	},
});

const single = (
	id: string,
	category: CategoryCode,
	question: string,
	right: string,
	wrongs: string[]
): RunPoll => ({
	id,
	category,
	question,
	answerType: "single",
	options: [
		{ id: `${id}-r`, label: right, correct: true },
		...wrongs.map((w, i) => ({ id: `${id}-${i}`, label: w, correct: false })),
	],
});

const BASE_POLLS: RunPoll[] = [
	single(
		"js1",
		"js",
		"Which method returns the last element of an array?",
		"at(-1)",
		["pop()", "last()"]
	),
	single(
		"ts1",
		"ts",
		"Which type means 'any value except null/undefined'?",
		"NonNullable<T>",
		["Partial<T>", "Readonly<T>"]
	),
	single(
		"css1",
		"css",
		"Which centers a flex item on both axes?",
		"place-items: center",
		["align: middle", "float: center"]
	),
	single(
		"react1",
		"react",
		"What key should list items get?",
		"A stable unique id",
		["The array index", "Math.random()"]
	),
	single(
		"html1",
		"html",
		"Which tag prevents a line break?",
		"<nobr> / white-space:nowrap",
		["<br>", "<hr>"]
	),
	single(
		"git1",
		"git",
		"Which undoes a commit but keeps changes staged?",
		"git reset --soft",
		["git revert", "git checkout"]
	),
	{
		id: "ts-multi",
		category: "ts",
		question: "Which of these are TypeScript utility types? (pick all)",
		answerType: "multiple",
		options: [
			{ id: "m-a", label: "Partial", correct: true },
			{ id: "m-b", label: "Pick", correct: true },
			{ id: "m-c", label: "Banjo", correct: false },
		],
	},
	single("js2", "js", "typeof null === ?", '"object"', [
		'"null"',
		'"undefined"',
	]),
];

type RigOutcome = "right" | "wrong";

const rigOptionIds = (
	poll: RunPoll,
	outcome: RigOutcome
): readonly string[] => {
	if (outcome === "right") {
		return poll.options
			.filter((option) => option.correct)
			.map((option) => option.id);
	}
	const wrong = poll.options.find((option) => !option.correct);
	return wrong ? [wrong.id] : [];
};

type SimTrainer = { id: string; displayName: string; accuracy: number };

const TRAINERS: readonly SimTrainer[] = [
	{ id: "gary", displayName: "Gary Oak", accuracy: 0.9 },
	{ id: "lance", displayName: "Lance", accuracy: 0.8 },
	{ id: "sabrina", displayName: "Sabrina", accuracy: 0.7 },
	{ id: "erika", displayName: "Erika", accuracy: 0.6 },
	{ id: "misty", displayName: "Misty", accuracy: 0.5 },
	{ id: "brock", displayName: "Brock", accuracy: 0.45 },
	{ id: "ash", displayName: "Ash Ketchum", accuracy: 0.35 },
];

const hashOf = (text: string): number =>
	[...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);

const simulatedPickLabels = (poll: RunPoll, trainer: SimTrainer): string[] => {
	const roll = hashOf(trainer.id + poll.id) % 100;
	const right = poll.options.filter((option) => option.correct);
	const wrong = poll.options.filter((option) => !option.correct);
	if (roll < trainer.accuracy * 100) return right.map((option) => option.label);
	if (poll.answerType === "multiple" && roll % 2 === 0 && right[0] && wrong[0])
		return [right[0].label, wrong[0].label];
	if (wrong.length === 0) return right.map((option) => option.label);
	return [wrong[roll % wrong.length].label];
};

const sameLabelSet = (a: readonly string[], b: readonly string[]): boolean =>
	a.length === b.length && a.every((label) => b.includes(label));

const simulatePollSplit = (poll: RunPoll, peeker: Config): PollSplitView => {
	const percentByOptionId = Object.fromEntries(
		poll.options.map((option) => [
			option.id,
			Math.round(
				(TRAINERS.filter((trainer) =>
					simulatedPickLabels(poll, trainer).includes(option.label)
				).length /
					TRAINERS.length) *
					100
			),
		])
	);
	return {
		percentByOptionId,
		...(showsSampleSize(peeker) ? { answeredCount: TRAINERS.length } : {}),
	};
};

const YOU: CommunityVoter = { id: "you", displayName: "You", you: true };

type SimulatedCommunity = RunCommunityBoardProps & {
	standouts: CommunityStandout[];
};

const simulateCommunityBoard = (
	answered: readonly AnsweredPoll[],
	polls: readonly RunPoll[],
	run: { gatesCleared: number; coverage: number; configCount: number }
): SimulatedCommunity => {
	const pollsById = new Map(polls.map((poll) => [poll.id, poll]));
	const answeredCount = TRAINERS.length + 1;

	const trainerRightsOn = (poll: RunPoll): SimTrainer[] => {
		const rightLabels = poll.options
			.filter((option) => option.correct)
			.map((option) => option.label);
		return TRAINERS.filter((trainer) =>
			sameLabelSet(simulatedPickLabels(poll, trainer), rightLabels)
		);
	};

	const boardPolls = answered.flatMap((entry, index): RunCommunityPoll[] => {
		const poll = pollsById.get(entry.id);
		if (!poll) return [];
		const gotItRightCount =
			trainerRightsOn(poll).length + (entry.outcome === "correct" ? 1 : 0);

		const options = poll.options.map((option): CommunityOptionResult => {
			const yours = entry.picked.includes(option.label);
			const pickers = TRAINERS.filter((trainer) =>
				simulatedPickLabels(poll, trainer).includes(option.label)
			);
			const count = pickers.length + (yours ? 1 : 0);
			return {
				label: option.label,
				isRight: option.correct,
				count,
				percent: Math.round((count / answeredCount) * 100),
				yours,
				voters: [
					...(yours ? [YOU] : []),
					...pickers.map((trainer) => ({
						id: trainer.id,
						displayName: trainer.displayName,
						you: false,
					})),
				],
			};
		});

		return [
			{
				pollId: index,
				index,
				question: poll.question,
				category: poll.category,
				outcome: entry.outcome,
				detail: {
					answerType: poll.answerType,
					answeredCount,
					gotItRightCount,
					youGotItRight: entry.outcome === "correct",
					options,
				},
			},
		];
	});

	const yourRights = answered.filter(
		(entry) => entry.outcome === "correct"
	).length;
	const rightsPerTrainer = TRAINERS.map(
		(trainer) =>
			answered.filter((entry) => {
				const poll = pollsById.get(entry.id);
				return poll && trainerRightsOn(poll).includes(trainer);
			}).length
	);
	const better = rightsPerTrainer.filter((count) => count > yourRights).length;
	const topPercent = Math.max(
		1,
		Math.ceil(((better + 1) / answeredCount) * 100)
	);

	const trainerVoter = (trainer: SimTrainer): CommunityVoter => ({
		id: trainer.id,
		displayName: trainer.displayName,
		you: false,
	});
	const trainerBy = (seedText: string): SimTrainer =>
		TRAINERS[hashOf(seedText) % TRAINERS.length];
	const categoryCounts = new Map<CategoryCode, number>();
	for (const entry of answered)
		categoryCounts.set(
			entry.category,
			(categoryCounts.get(entry.category) ?? 0) + 1
		);
	const topCategory = [...categoryCounts.entries()].sort(
		(a, b) => b[1] - a[1]
	)[0];
	const gateKey = answered[0]?.id ?? "";
	const streak = longestCorrectStreak(answered.map((entry) => entry.outcome));
	const deepest = swatchForGate(run.gatesCleared);
	const hardest = answered.find((entry) => entry.outcome !== "correct");
	const standouts: CommunityStandout[] =
		answered.length === 0 || !topCategory
			? []
			: [
					{
						voter: trainerVoter(trainerBy(`fastest:${gateKey}`)),
						title: "fastest answer",
						value: {
							unit: "duration",
							ms: (4 + (hashOf(`fastms:${gateKey}`) % 51)) * 1_000,
						},
					},
					{
						voter: trainerVoter(trainerBy(`first:${gateKey}`)),
						title: "first to answer",
						value: {
							unit: "duration",
							ms: (60 + (hashOf(`firsts:${gateKey}`) % 60)) * 1_000,
						},
					},
					{
						voter: trainerVoter(trainerBy(`good:${gateKey}`)),
						title: "first good",
						value: {
							unit: "duration",
							ms: (90 + (hashOf(`goods:${gateKey}`) % 90)) * 1_000,
						},
					},
					...(topCategory[1] >= 2
						? [
								{
									voter: trainerVoter(trainerBy(`most:${topCategory[0]}`)),
									title: `most ${getCategoryMetadata(topCategory[0]).name} polls`,
									value: { unit: "count" as const, amount: topCategory[1] },
								},
							]
						: []),
					...(hardest
						? [
								{
									voter: trainerVoter(trainerBy(`lone:${hardest.id}`)),
									title: "only one right",
									value: {
										unit: "text" as const,
										text:
											hardest.question.length > 32
												? `${hardest.question.slice(0, 31).trimEnd()}…`
												: hardest.question,
									},
								},
							]
						: []),
					{
						voter: trainerVoter(trainerBy(`gate:${gateKey}`)),
						title: "deepest gate",
						value: {
							unit: "text" as const,
							text: deepest?.gateName ?? "the climb",
						},
						...(deepest
							? { swatch: { theme: deepest.theme, finish: deepest.finish } }
							: {}),
					},
					...(streak >= 2
						? [
								{
									voter: trainerVoter(trainerBy(`streak:${gateKey}`)),
									title: "longest streak",
									value: { unit: "count" as const, amount: streak },
								},
							]
						: []),
					{
						voter: trainerVoter(trainerBy(`cov:${gateKey}`)),
						title: "most coverage",
						value: {
							unit: "percent" as const,
							amount: roundToOneDecimal(run.coverage),
						},
					},
					{
						voter: trainerVoter(trainerBy(`wide:${gateKey}`)),
						title: "widest build",
						value: { unit: "configs" as const, amount: run.configCount },
					},
				];

	return {
		totalPlayers: answeredCount,
		topPercent,
		standouts,
		polls: boardPolls,
	};
};

const POOL_SIZE = VICTORY_GATE * SLICE_WINDOW + SLICE_WINDOW;
const POOLS: RunPoll[] = Array.from({ length: POOL_SIZE }, (_, i) => {
	const base = BASE_POLLS[i % BASE_POLLS.length];
	return { ...base, id: `${base.id}-${i}` };
});

const HANDED = [...Object.values(CONFIGS)];

const RunGame = ({ onRestart }: { onRestart: () => void }) => {
	const [state, setState] = useState(() => createRun(POOLS, HANDED));
	const dispatch = (action: RunAction) =>
		setState((current) => runReducer(current, action));
	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
	}, [state.currentIndex]);
	const [revealing, setRevealing] = useState(false);
	const [rewardStep, setRewardStep] = useState<
		"summary" | "review" | "shop" | "prep" | "community"
	>("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [state.gatesCleared]);
	const [stripStep, setStripStep] = useState<"summary" | "removal" | "review">(
		"summary"
	);
	useEffect(() => {
		setStripStep("summary");
	}, [state.status]);

	const view = toRunView(state);
	const reveal = revealing ? view.answeredThisGate.at(-1) : undefined;
	const pollClock = usePollClock(
		reveal ? null : (view.poll?.id ?? null),
		view.pollTimeLimitMs
	);
	const community = simulateCommunityBoard(view.answeredThisGate, state.polls, {
		gatesCleared: view.gatesCleared,
		coverage: view.coverage,
		configCount: view.configs.length,
	});
	const answer = (optionIds: readonly string[]) => {
		dispatch({ type: "answer", optionIds, elapsedMs: pollClock.elapsedMs() });
		setRevealing(true);
	};
	const answerCurrent = (outcome: RigOutcome) => {
		const poll = state.polls[state.currentIndex];
		if (poll) answer(rigOptionIds(poll, outcome));
	};
	const answerRestOfWindow = (outcome: RigOutcome) =>
		setState((current) => {
			let next = current;
			while (next.status === "answering") {
				const poll = next.polls[next.currentIndex];
				if (!poll) return next;
				next = runReducer(next, {
					type: "answer",
					optionIds: rigOptionIds(poll, outcome),
				});
			}
			return next;
		});
	const onSelect = (optionId: string) => {
		if (view.poll?.answerType === "single") return setSelected([optionId]);
		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};

	const showsHud = state.status === "rewarding" && rewardStep === "community";

	return (
		<>
			{showsHud ? (
				<div className="mx-auto w-full max-w-6xl p-2">
					<RunHud
						storage={view.storage}
						gatesCleared={view.gatesCleared}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						gateCoverage={view.gateStake.coverageHeld}
						gateCoverageDemand={view.gateStake.coverageDemand}
						coverageByCategory={view.coverageByCategory}
					/>
				</div>
			) : null}
			{state.status === "configuring" && (
				<StartView
					view={view}
					onToggle={(id) =>
						dispatch({
							type: view.configs.some((config) => config.id === id)
								? "uninstall"
								: "install",
							configId: id,
						})
					}
					onPickStack={(stackId) => dispatch({ type: "pick-stack", stackId })}
					onStart={() => {
						setScreenNavDirection("forward");
						dispatch({ type: "start" });
					}}
				/>
			)}

			{reveal && (
				<RevealView
					view={view}
					answered={reveal}
					onNext={() => setRevealing(false)}
				/>
			)}

			{!reveal && state.status === "answering" && view.poll && (
				<PollView
					view={view}
					poll={view.poll}
					selectedOptionIds={selected}
					splitByOptionId={
						view.currentPollPeeked && view.paidActions.peeker
							? simulatePollSplit(
									state.polls[state.currentIndex],
									view.paidActions.peeker
								).percentByOptionId
							: undefined
					}
					onSelect={onSelect}
					onSubmit={() => answer(selected)}
					onLint={() => dispatch({ type: "lint-poll" })}
					onPeek={() => dispatch({ type: "peek-poll" })}
				/>
			)}

			{!reveal && state.status === "rewarding" && rewardStep === "summary" && (
				<RewardView
					view={view}
					outcome="cleared"
					onReviewAnswers={() => setRewardStep("review")}
					onContinue={() => setRewardStep("shop")}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "review" && (
				<ReviewView
					view={view}
					back={{
						label: "\u2190 Back to rewards",
						onUse: () => setRewardStep("summary"),
					}}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "shop" && (
				<ShopView
					view={view}
					onDraft={(id) => dispatch({ type: "draft", configId: id })}
					onSell={(id) => dispatch({ type: "sell", configId: id })}
					onUpgrade={(id) => dispatch({ type: "upgrade", configId: id })}
					onLock={(id) => dispatch({ type: "lock-offer", configId: id })}
					onRebuild={() => dispatch({ type: "rebuild-draft" })}
					onExtend={() => dispatch({ type: "extend-offers" })}
					onPlantPin={() => dispatch({ type: "plant-pin" })}
					onBuySlot={() => dispatch({ type: "buy-slot" })}
					onCashSlot={() => dispatch({ type: "cash-slot" })}
					onSetStoragePlan={(tier) =>
						dispatch({ type: "set-storage-plan", tier })
					}
					onContinue={() => setRewardStep("prep")}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "prep" && (
				<PrepView
					view={view}
					onStart={() => dispatch({ type: "finish-reward" })}
					onBackToShop={() => setRewardStep("shop")}
					onCommunity={() => setRewardStep("community")}
				/>
			)}

			{state.status === "rewarding" && rewardStep === "community" && (
				<Screen
					gateTheme={view.gateTheme}
					leftAction={{
						label: "← Back to prep",
						onClick: () => setRewardStep("prep"),
					}}
				>
					<Stack gap="6" divided>
						<StandoutsPanel standouts={community.standouts} />
						<RunCommunityBoard
							totalPlayers={community.totalPlayers}
							topPercent={community.topPercent}
							polls={community.polls}
						/>
					</Stack>
				</Screen>
			)}

			{!reveal &&
				state.status === "awaiting-strip" &&
				stripStep === "summary" && (
					<RewardView
						view={view}
						outcome="held"
						onReviewAnswers={() => setStripStep("review")}
						onChooseRemoval={() => setStripStep("removal")}
					/>
				)}

			{state.status === "awaiting-strip" && stripStep === "removal" && (
				<RemovalView
					view={view}
					onRemove={(configIds) => {
						setRewardStep("shop");
						setState((current) =>
							runReducer(
								configIds.reduce(
									(next, configId) =>
										runReducer(next, { type: "strip", configId }),
									current
								),
								{ type: "resume-climb" }
							)
						);
					}}
				/>
			)}

			{state.status === "awaiting-strip" && stripStep === "review" && (
				<ReviewView
					view={view}
					back={{
						label: "\u2190 Back to the gate",
						onUse: () => setStripStep("summary"),
					}}
				/>
			)}

			{!reveal && (state.status === "won" || state.status === "dead") && (
				<Screen
					width="narrow"
					rightAction={{ label: "Play again →", onClick: onRestart }}
				>
					<RunSummary
						won={state.status === "won"}
						gatesCleared={view.gatesCleared}
						victoryGate={view.victoryGate}
						coverage={view.coverage}
						storage={view.storage}
						configs={view.configs}
						answered={view.allAnswered}
					/>
				</Screen>
			)}

			{!reveal && state.status === "answering" && (
				<div className="mx-auto mt-4 flex w-full max-w-6xl shrink-0 flex-wrap items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-3 text-xs text-pewter">
					<span className="font-semibold uppercase tracking-wide">Dev rig</span>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => answerCurrent("right")}
					>
						✓ Answer right
					</button>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => answerCurrent("wrong")}
					>
						✕ Answer wrong
					</button>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => answerRestOfWindow("right")}
					>
						⏩ All right → gate
					</button>
					<button
						type="button"
						className="rounded bg-zinc-800 px-2 py-1 hover:bg-zinc-700"
						onClick={() => answerRestOfWindow("wrong")}
					>
						⏩ All wrong → gate
					</button>
				</div>
			)}

			{state.log.length > 0 && (
				<div className="mx-auto mt-4 w-full max-w-6xl shrink-0 rounded-lg bg-zinc-900 p-4 text-xs text-pewter">
					{state.log.slice(-4).map((line, index) => (
						<p key={index}>▸ {line}</p>
					))}
				</div>
			)}
		</>
	);
};

function RouteComponent() {
	const [seed, setSeed] = useState(0);
	return (
		<div className="flex flex-1 flex-col text-white [--screen-floor:0px]">
			<RunGame key={seed} onRestart={() => setSeed((current) => current + 1)} />
		</div>
	);
}

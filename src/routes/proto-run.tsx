import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
	type AnsweredPoll,
	createRun,
	runReducer,
	RunAction,
	RunPoll,
} from "~/modules/run/run/domain/run.model";
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
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { rebuildCost } from "~/modules/run/shop/domain/draft.model";
import { coverageToAddSlot } from "~/modules/run/pipeline/domain/pipeline.model";
import { AnsweringScreen } from "~/modules/run/run/presentation/AnsweringScreen.ui";
import { ConfiguringScreen } from "~/modules/run/pipeline/presentation/ConfiguringScreen.ui";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";
import { RewardScreen } from "~/modules/run/gate/presentation/RewardScreen.ui";
import {
	ShopScreen,
	shopExitAction,
} from "~/modules/run/shop/presentation/ShopScreen.ui";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { ReviewAnswers } from "~/modules/run/run/presentation/ReviewAnswers.ui";
import { RunHud } from "~/modules/run/run/presentation/RunHud.ui";
import { RunSummary } from "~/modules/run/run/presentation/RunSummary.ui";
import { StandoutsPanel } from "~/modules/run/community/presentation/Standouts.ui";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	shopExitFor,
	toRunView,
} from "~/modules/run/run/application/runView.viewmodel";
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
						title: "widest pipeline",
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
	const [rewardStep, setRewardStep] = useState<
		"summary" | "review" | "shop" | "prep" | "community"
	>("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [state.gatesCleared]);
	const [stripStep, setStripStep] = useState<"strip" | "review">("strip");
	useEffect(() => {
		setStripStep("strip");
	}, [state.status]);

	const view = toRunView(state);
	const community = simulateCommunityBoard(view.answeredThisGate, state.polls, {
		gatesCleared: view.gatesCleared,
		coverage: view.coverage,
		configCount: view.configs.length,
	});
	const disabled = state.manualDisabled;
	const cost = rebuildCost(state.rebuildsUsed);
	const shopExit = shopExitFor(view);

	const answer = (optionIds: readonly string[]) =>
		dispatch({ type: "answer", optionIds });
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
	const canSubmit = selected.length > 0;
	const canStart = view.configs.length >= view.slots;

	const quotaMet = view.stripsRemaining === 0;

	const runOver = state.status === "won" || state.status === "dead";
	const hidesHud =
		runOver || (state.status === "rewarding" && rewardStep === "summary");

	return (
		<>
			{hidesHud ? null : (
				<div className="mx-auto w-full max-w-6xl p-2">
					<RunHud
						storage={view.storage}
						capKb={view.storageCap}
						gatesCleared={view.gatesCleared}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						coverage={view.coverage}
						coverageByCategory={view.coverageByCategory}
					/>
				</div>
			)}
			{state.status === "configuring" && (
				<Screen gateTheme={view.gateTheme}>
					<ConfiguringScreen
						configs={view.configs}
						slots={view.slots}
						stake={view.gateStake}
						bench={view.available}
						checks={view.checks}
						onSlot={(id) => dispatch({ type: "slot", configId: id })}
						onUnslot={(id) => dispatch({ type: "unslot", configId: id })}
						stacks={STARTER_STACKS}
						onPickStack={(stackId) => dispatch({ type: "pick-stack", stackId })}
						startAction={{
							label: "Start run →",
							onClick: () => {
								setScreenNavDirection("forward");
								dispatch({ type: "start" });
							},
							disabled: !canStart,
							hint: canStart ? undefined : "Pick a stack to start",
						}}
					/>
				</Screen>
			)}

			{state.status === "answering" && view.poll && (
				<Screen gateTheme={view.gateTheme}>
					<AnsweringScreen
						configs={view.configs}
						checks={view.checks}
						category={view.poll.category}
						question={view.poll.question}
						answerType={view.poll.answerType}
						options={view.poll.options}
						selectedOptionIds={selected}
						disabledOptionIds={disabled}
						pollOutcomes={view.answeredThisGate.map((poll) => poll.outcome)}
						pollsPerGate={view.pollsPerGate}
						slots={view.slots}
						stripsOnFailure={view.stripsOnFailure}
						canLint={view.canLint}
						lintReady={view.lintReady}
						linter={view.linter ?? undefined}
						lintCost={view.lintCost}
						canSubmit={canSubmit}
						onSelect={onSelect}
						onSubmit={() => answer(selected)}
						onNext={() => {}}
						onLint={() => dispatch({ type: "lint-poll" })}
					/>
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "summary" && (
				<Screen theme="celadon">
					<RewardScreen
						clearedGate={view.clearedGateNumber}
						gateReward={view.gateRewardPaidKb}
						answered={view.answeredThisGate}
						configs={view.configs}
						storage={view.storage}
						capKb={view.storageCap}
						faucetThisGateKb={view.faucetThisGateKb}
						billKb={view.gateBillPaidKb}
						planDowngraded={view.planDowngraded}
						onReviewAnswers={() => setRewardStep("review")}
						onContinue={() => setRewardStep("shop")}
					/>
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "review" && (
				<Screen
					theme="celadon"
					leftAction={{
						label: "← Back to rewards",
						onClick: () => setRewardStep("summary"),
					}}
					rightAction={{
						label: "Continue to shop →",
						onClick: () => setRewardStep("shop"),
					}}
				>
					<ReviewAnswers answered={view.answeredThisGate} />
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "shop" && (
				<Screen
					width="wide"
					gateTheme={view.gateTheme}
					leftAction={{
						label: "← Back",
						onClick: () => setRewardStep("summary"),
					}}
					rightAction={{
						...shopExitAction(shopExit),
						onClick:
							shopExit.state === "stuck"
								? () => dispatch({ type: "finish-reward" })
								: () => setRewardStep("prep"),
					}}
				>
					<ShopScreen
						storage={view.storage}
						stake={view.gateStake}
						coverageByCategory={view.coverageByCategory}
						checks={view.checks}
						configs={view.configs}
						newConfigIds={view.newConfigIds}
						draftOptions={view.draftOptions}
						onDraft={(id) => dispatch({ type: "draft", configId: id })}
						rebuildCost={cost}
						canRebuild={state.storage >= cost}
						onRebuild={() => dispatch({ type: "rebuild-draft" })}
						lockAvailable={view.lockAvailable}
						lockCost={view.lockCost}
						canLock={view.canLock}
						lockedOfferIds={view.lockedOfferIds}
						onLock={(id) => dispatch({ type: "lock-offer", configId: id })}
						extendAvailable={view.extendAvailable}
						extendCost={view.extendCost}
						canExtend={view.canExtend}
						onExtend={() => dispatch({ type: "extend-offers" })}
						slots={view.slots}
						coverage={view.coverage}
						slotCoverageRequired={coverageToAddSlot(state.pipeline.slots)}
						justUnlockedSlots={view.justUnlockedSlots}
						onUpgrade={(id) => dispatch({ type: "upgrade", configId: id })}
						onSell={(id) => dispatch({ type: "sell", configId: id })}
						storagePlans={view.storagePlans}
						onChangePlan={(tier) => dispatch({ type: "change-plan", tier })}
					/>
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "prep" && (
				<Screen
					gateTheme={view.gateTheme}
					leftAction={{
						label: "← Back to shop",
						onClick: () => setRewardStep("shop"),
					}}
					rightAction={{
						label: "Community →",
						onClick: () => setRewardStep("community"),
					}}
				>
					<PrepScreen
						stake={view.gateStake}
						configs={view.configs}
						shopAction={{
							label: "← Back to shop",
							onClick: () => setRewardStep("shop"),
						}}
						onStartGate={() => dispatch({ type: "finish-reward" })}
						onDropConfig={(id) => dispatch({ type: "drop", configId: id })}
					/>
				</Screen>
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

			{state.status === "awaiting-strip" && stripStep === "strip" && (
				<Screen
					theme="cinnabar"
					rightAction={{
						label: "Review answers →",
						onClick: () => setStripStep("review"),
						disabled: !quotaMet,
						hint: quotaMet
							? undefined
							: `Peel ${view.stripsRemaining} more to continue`,
					}}
				>
					<StripScreen
						gateNumber={view.gatesCleared}
						stripsRemaining={view.stripsRemaining}
						configs={view.configs}
						checks={view.checks}
						answered={view.answeredThisGate}
						billKb={view.gateBillPaidKb}
						planDowngraded={view.planDowngraded}
						onStrip={(id) => dispatch({ type: "strip", configId: id })}
					/>
				</Screen>
			)}

			{state.status === "awaiting-strip" && stripStep === "review" && (
				<Screen
					theme="cinnabar"
					leftAction={{
						label: "← Back to the gate",
						onClick: () => setStripStep("strip"),
					}}
					rightAction={{
						label: "Climb on →",
						onClick: () => dispatch({ type: "resume-climb" }),
					}}
				>
					<ReviewAnswers answered={view.answeredThisGate} />
				</Screen>
			)}

			{(state.status === "won" || state.status === "dead") && (
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

			{state.status === "answering" && (
				<div className="mx-auto mt-4 flex max-w-5xl flex-wrap items-center gap-2 rounded-lg border border-dashed border-zinc-700 bg-zinc-900 p-3 text-xs text-pewter">
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
				<div className="mx-auto mt-4 max-w-5xl rounded-lg bg-zinc-900 p-4 text-xs text-pewter">
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
		<div className="min-h-screen text-white">
			<RunGame key={seed} onRestart={() => setSeed((current) => current + 1)} />
		</div>
	);
}

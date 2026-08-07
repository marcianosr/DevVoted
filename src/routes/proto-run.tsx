import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
	type AnsweredPoll,
	createRun,
	runReducer,
	RunAction,
	RunPoll,
} from "~/modules/run/climb/run.model";
import type {
	CommunityOptionResult,
	CommunityStandout,
	CommunityVoter,
	RunCommunityPoll,
} from "~/modules/run/api/community.handlers";
import {
	RunCommunityBoard,
	type RunCommunityBoardProps,
} from "~/modules/run/presentation/community/RunCommunity.ui";
import { longestCorrectStreak } from "~/modules/run/community/standouts.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { rebuildCost } from "~/modules/run/draft/draft.model";
import {
	canAddSlot,
	coverageToAddSlot,
} from "~/modules/run/pipeline/pipeline.model";
import { AnsweringScreen } from "~/modules/run/presentation/screens/AnsweringScreen.ui";
import { ConfiguringScreen } from "~/modules/run/presentation/screens/ConfiguringScreen.ui";
import { RewardScreen } from "~/modules/run/presentation/screens/RewardScreen.ui";
import { ShopScreen } from "~/modules/run/presentation/screens/ShopScreen.ui";
import { StripScreen } from "~/modules/run/presentation/screens/StripScreen.ui";
import { ReviewAnswers } from "~/modules/run/presentation/run/ReviewAnswers.ui";
import { RunHud } from "~/modules/run/presentation/run/RunHud.ui";
import { RunSummary } from "~/modules/run/presentation/run/RunSummary.ui";
import { StandoutsPanel } from "~/modules/run/presentation/community/Standouts.ui";
import { swatchForGate } from "~/modules/run/gate/swatch.model";
import { toRunView } from "~/modules/run/view/runView.viewmodel";
import {
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/rules.model";
import {
	type CategoryCode,
	getCategoryMetadata,
} from "~/domains/shared/categories";
import { formatDurationMs } from "~/lib/dateUtils";
import { Screen } from "~/ui/Screen.ui";
import { Stack } from "~/ui/Stack.ui";

export const Route = createFileRoute("/proto-run")({
	component: RouteComponent,
	beforeLoad: () => {
		// Test harness with cheat controls — never reachable on a deployed build.
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

// The rig reads answers from the unredacted poll. Only possible here: the proto
// route holds the full RunState client-side, while the real game strips
// `correct` flags via toRunView before anything reaches the browser.
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

// ─── Simulated community ─────────────────────────────────────────────────────
// The rig has no server, so the community step fakes the town: Kanto trainers
// whose picks derive from a (trainer, poll) hash — stable across re-renders,
// varied across polls. Roster mirrors src/database/seedCommunity.ts.
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

/**
 * The rig has no other runs, so the run-scoped awards are faked from *your*
 * standing and handed to random trainers. The point here is that the panel looks
 * and reads like production, not that the numbers mean anything.
 */
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

	// Percentile mirrors the real page: trainers with more correct answers
	// this gate push "you" down.
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

	// Standouts, hash-faked like the votes; "most X polls" counts the gate's
	// real category mix so the award tracks what was actually played.
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
						value: formatDurationMs(
							(4 + (hashOf(`fastms:${gateKey}`) % 51)) * 1_000
						),
					},
					{
						voter: trainerVoter(trainerBy(`first:${gateKey}`)),
						title: "first to answer",
						value: formatDurationMs(
							(60 + (hashOf(`firsts:${gateKey}`) % 60)) * 1_000
						),
					},
					{
						voter: trainerVoter(trainerBy(`good:${gateKey}`)),
						title: "first good",
						value: formatDurationMs(
							(90 + (hashOf(`goods:${gateKey}`) % 90)) * 1_000
						),
					},
					// Same floor the model applies: a "most" of one is no distinction.
					...(topCategory[1] >= 2
						? [
								{
									voter: trainerVoter(trainerBy(`most:${topCategory[0]}`)),
									title: `most ${getCategoryMetadata(topCategory[0]).name} polls`,
									value: String(topCategory[1]),
								},
							]
						: []),
					...(hardest
						? [
								{
									voter: trainerVoter(trainerBy(`lone:${hardest.id}`)),
									title: "only one right",
									value:
										hardest.question.length > 32
											? `${hardest.question.slice(0, 31).trimEnd()}…`
											: hardest.question,
								},
							]
						: []),
					{
						voter: trainerVoter(trainerBy(`gate:${gateKey}`)),
						title: "deepest gate",
						value: deepest?.gateName ?? "the climb",
						...(deepest
							? { swatch: { theme: deepest.theme, finish: deepest.finish } }
							: {}),
					},
					...(streak >= 2
						? [
								{
									voter: trainerVoter(trainerBy(`streak:${gateKey}`)),
									title: "longest streak",
									value: String(streak),
								},
							]
						: []),
					{
						voter: trainerVoter(trainerBy(`cov:${gateKey}`)),
						title: "most coverage",
						value: `+${roundToOneDecimal(run.coverage)}%`,
					},
					{
						voter: trainerVoter(trainerBy(`wide:${gateKey}`)),
						title: "widest pipeline",
						value: `${run.configCount} config${run.configCount === 1 ? "" : "s"}`,
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
	// useState instead of useReducer so the rig can step the pure reducer in a
	// loop (fast-forward needs each intermediate state to pick the next answer).
	const [state, setState] = useState(() => createRun(POOLS, HANDED));
	const dispatch = (action: RunAction) =>
		setState((current) => runReducer(current, action));
	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
	}, [state.currentIndex]);
	// The reward flows over four pages, the same sequence the routed app walks
	// (reward → review → shop → community). Reset to the summary each new gate.
	const [rewardStep, setRewardStep] = useState<
		"summary" | "review" | "shop" | "community"
	>("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [state.gatesCleared]);
	// The failed gate's own two pages: peel the build, then read the answers —
	// mirroring RunStrip → RunReview.
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
	// Only options the player paid to lint off are crossed out — no automatic masking.
	const disabled = state.manualDisabled;
	const cost = rebuildCost(state.rebuildsUsed);

	const answer = (optionIds: readonly string[]) =>
		dispatch({ type: "answer", optionIds });
	const answerCurrent = (outcome: RigOutcome) => {
		const poll = state.polls[state.currentIndex];
		if (poll) answer(rigOptionIds(poll, outcome));
	};
	// Auto-answer until the reducer closes the window (rewarding, strip, won or
	// dead all exit the loop), so any gate — and game over — is a few clicks away.
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
	// Selecting no longer auto-answers — the player commits deliberately via the
	// Screen's "Submit answer" footer action.
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

	return (
		<>
			{runOver ? null : (
				<div className="mx-auto w-full max-w-6xl p-2">
					<RunHud
						storage={view.storage}
						capKb={view.storageCap}
						gatesCleared={view.gatesCleared}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						pollOutcomes={view.answeredThisGate.map((poll) => poll.outcome)}
						coverage={view.coverage}
						coverageByCategory={view.coverageByCategory}
					/>
				</div>
			)}
			{state.status === "configuring" && (
				<Screen
					gateTheme={view.gateTheme}
					rightAction={{
						label: "Start run →",
						onClick: () => dispatch({ type: "start" }),
						disabled: !canStart,
						hint: canStart
							? undefined
							: "Select a config for every pipeline slot",
					}}
				>
					<ConfiguringScreen
						configs={view.configs}
						slots={view.slots}
						gatesCleared={view.gatesCleared}
						bench={view.available}
						checks={view.checks}
						gateReward={view.gateReward}
						rewardMultiplier={view.rewardMultiplier}
						coverageMultiplier={view.coverageMultiplier}
						coverageAdd={view.coverageAdd}
						coverage={view.coverage}
						slotCoverageRequired={view.slotCoverageRequired}
						onSlot={(id) => dispatch({ type: "slot", configId: id })}
						onUnslot={(id) => dispatch({ type: "unslot", configId: id })}
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
				<Screen
					theme="celadon"
					rightAction={{
						label: "Continue to shop →",
						onClick: () => setRewardStep("shop"),
					}}
				>
					<RewardScreen
						clearedGate={view.clearedGateNumber}
						// The PAID amount, not the full-correctness ceiling (ADR-017):
						// a 2/5 clear banks 13KB, and the report must say 13.
						gateReward={view.gateRewardPaidKb}
						answered={view.answeredThisGate}
						coverageGainedByCategory={view.coverageGainedThisGate}
						passedChecks={view.passedChecks}
						configs={view.configs}
						faucetThisGateKb={view.faucetThisGateKb}
						storage={view.storage}
						coverage={view.coverage}
						slotCoverageRequired={view.slotCoverageRequired}
						slots={view.slots}
						onReviewAnswers={() => setRewardStep("review")}
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
						label: "Community →",
						onClick: () => setRewardStep("community"),
					}}
				>
					<ShopScreen
						storage={view.storage}
						storageCap={view.storageCap}
						ownedStorageConfigs={view.ownedStorageConfigs}
						availableStorageConfigs={view.availableStorageConfigs}
						draftCostReduction={view.draftCostReduction}
						refundBoost={view.refundBoost}
						payoutBoost={view.payoutBoost}
						freeRebuild={view.freeRebuild}
						gateNumber={view.gatesCleared}
						coverageByCategory={view.coverageByCategory}
						checks={view.checks}
						configs={view.configs}
						gateReward={view.gateReward}
						rewardMultiplier={view.rewardMultiplier}
						coverageMultiplier={view.coverageMultiplier}
						coverageAdd={view.coverageAdd}
						newConfigIds={view.newConfigIds}
						draftOptions={view.draftOptions}
						onDraft={(id) => dispatch({ type: "draft", configId: id })}
						rebuildCost={cost}
						canRebuild={state.storage >= cost}
						onRebuild={() => dispatch({ type: "rebuild-draft" })}
						slots={view.slots}
						coverage={view.coverage}
						slotCoverageRequired={coverageToAddSlot(state.pipeline.slots)}
						canAddSlot={canAddSlot(state.pipeline.slots, state.coverage)}
						onAddSlot={() => dispatch({ type: "add-slot" })}
						onUpgrade={(id) => dispatch({ type: "upgrade", configId: id })}
						onSell={(id) => dispatch({ type: "sell", configId: id })}
					/>
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "community" && (
				<Screen
					gateTheme={view.gateTheme}
					leftAction={{
						label: "← Back",
						onClick: () => setRewardStep("shop"),
					}}
					rightAction={{
						label: `Continue to gate ${view.gatesCleared + 1} →`,
						onClick: () => dispatch({ type: "finish-reward" }),
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

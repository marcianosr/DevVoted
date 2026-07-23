import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";

import {
	createRun,
	LINT_COST,
	runReducer,
	RunPoll,
} from "~/modules/run/climb/run.model";
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
import { RunHud } from "~/modules/run/presentation/run/RunHud.ui";
import { RunSummary } from "~/modules/run/presentation/run/RunSummary.ui";
import { toRunView } from "~/modules/run/view/runView.viewmodel";
import { SLICE_WINDOW, VICTORY_GATE } from "~/modules/run/rules.model";
import type { CategoryCode } from "~/domains/shared/categories";
import { Screen } from "~/ui/Screen.ui";

export const Route = createFileRoute("/proto-run")({
	component: RouteComponent,
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

const POOL_SIZE = VICTORY_GATE * SLICE_WINDOW + SLICE_WINDOW;
const POOLS: RunPoll[] = Array.from({ length: POOL_SIZE }, (_, i) => {
	const base = BASE_POLLS[i % BASE_POLLS.length];
	return { ...base, id: `${base.id}-${i}` };
});

const HANDED = [
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.copilot,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
];

const RunGame = ({ onRestart }: { onRestart: () => void }) => {
	const [state, dispatch] = useReducer(runReducer, 0, () =>
		createRun(POOLS, HANDED, [CONFIGS.unitTests])
	);
	const [selected, setSelected] = useState<readonly string[]>([]);
	useEffect(() => {
		setSelected([]);
	}, [state.currentIndex]);
	// The reward flows over two pages: the rewards summary, then the shop. Reset to the
	// summary each time a new gate clears.
	const [rewardStep, setRewardStep] = useState<"summary" | "shop">("summary");
	useEffect(() => {
		setRewardStep("summary");
	}, [state.gatesCleared]);

	const view = toRunView(state);
	// Only options the player paid to lint off are crossed out — no automatic masking.
	const disabled = state.manualDisabled;
	const cost = rebuildCost(state.rebuildsUsed);

	const answer = (optionIds: readonly string[]) =>
		dispatch({ type: "answer", optionIds });
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
	const canStart = view.configs.filter((config) => !config.fixed).length > 0;
	const quotaMet = view.stripsRemaining === 0;

	const runOver = state.status === "won" || state.status === "dead";

	return (
		<>
			{runOver ? null : (
				<div className="mx-auto w-full max-w-5xl px-4 pt-6">
					<RunHud
						storage={view.storage}
						gateNumber={view.gatesCleared + 1}
						victoryGate={view.victoryGate}
						pollsAnswered={view.pollsAnswered}
						pollsPerGate={view.pollsPerGate}
						streak={view.streak}
						category={view.poll?.category}
						coverage={view.coverage}
						coverageByCategory={view.coverageByCategory}
						configs={view.configs}
						slots={view.slots}
						checks={view.checks}
					/>
				</div>
			)}
			{state.status === "configuring" && (
				<Screen
					rightAction={{
						label: "Start run →",
						onClick: () => dispatch({ type: "start" }),
						disabled: !canStart,
						hint: canStart ? undefined : "Choose a config to start",
					}}
				>
					<ConfiguringScreen
						configs={view.configs}
						slots={view.slots}
						bench={view.available}
						checks={view.checks}
						gateReward={view.gateReward}
						rewardMultiplier={view.rewardMultiplier}
						coverageMultiplier={view.coverageMultiplier}
						coverageAdd={view.coverageAdd}
						onSlot={(id) => dispatch({ type: "slot", configId: id })}
						onUnslot={(id) => dispatch({ type: "unslot", configId: id })}
					/>
				</Screen>
			)}

			{state.status === "answering" && view.poll && (
				<Screen categoryCode={view.poll.category}>
					<AnsweringScreen
						configs={view.configs}
						checks={view.checks}
						category={view.poll.category}
						question={view.poll.question}
						answerType={view.poll.answerType}
						options={view.poll.options}
						selectedOptionIds={selected}
						disabledOptionIds={disabled}
						canLint={view.canLint}
						lintReady={view.lintReady}
						linter={view.linter ?? undefined}
						lintCost={LINT_COST}
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
					rightAction={{
						label: "Continue →",
						onClick: () => setRewardStep("shop"),
					}}
				>
					<RewardScreen
						gatesCleared={view.gatesCleared}
						gateReward={view.gateReward}
						answered={view.answeredThisGate}
						coverageGainedByCategory={view.coverageGainedThisGate}
						passedChecks={view.passedChecks}
						configs={view.configs}
					/>
				</Screen>
			)}

			{state.status === "rewarding" && rewardStep === "shop" && (
				<Screen
					width="wide"
					leftAction={{
						label: "← Back",
						onClick: () => setRewardStep("summary"),
					}}
					rightAction={{
						label: "Continue →",
						onClick: () => dispatch({ type: "finish-reward" }),
					}}
				>
					<ShopScreen
						storage={view.storage}
						coverageByCategory={view.coverageByCategory}
						checks={view.checks}
						gateNumber={view.gatesCleared + 1}
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

			{state.status === "awaiting-strip" && (
				<Screen
					rightAction={{
						label: "Climb on →",
						onClick: () => dispatch({ type: "resume-climb" }),
						disabled: !quotaMet,
						hint: quotaMet
							? undefined
							: `Peel ${view.stripsRemaining} more to continue`,
					}}
				>
					<StripScreen
						stripsRemaining={view.stripsRemaining}
						gateNumber={view.gatesCleared + 1}
						configs={view.configs}
						checks={view.checks}
						answered={view.answeredThisGate}
						onStrip={(id) => dispatch({ type: "strip", configId: id })}
					/>
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
						coverage={view.coverage}
						storage={view.storage}
					/>
				</Screen>
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

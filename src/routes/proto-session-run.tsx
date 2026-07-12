/**
 * Client-side playtest harness for the REBUILT session-run (src/modules/session-run).
 * Open at /proto-session-run. Client-authoritative (holds full state incl. answer key) —
 * fine for local feel-testing; the server-authoritative version (DVTD-ay5e) comes later.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useReducer, useRef, useState } from "react";

import {
	createSession,
	LINT_COST,
	sessionReducer,
	SessionPoll,
} from "~/modules/session-run/climb/sessionRun.model";
import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { rebuildCost } from "~/modules/session-run/draft/draft.model";
import {
	canLint,
	disabledOptionIds,
	MAX_SLOTS,
} from "~/modules/session-run/pipeline/pipeline.model";
import { AnsweringScreen } from "~/modules/session-run/presentation/screens/AnsweringScreen.ui";
import { ConfiguringScreen } from "~/modules/session-run/presentation/screens/ConfiguringScreen.ui";
import { RewardScreen } from "~/modules/session-run/presentation/screens/RewardScreen.ui";
import { StripScreen } from "~/modules/session-run/presentation/screens/StripScreen.ui";
import { RunSummary } from "~/modules/session-run/presentation/run/RunSummary.ui";
import { toSessionView } from "~/modules/session-run/view/sessionView.viewmodel";
import { SLICE_WINDOW, VICTORY_GATE } from "~/modules/session-run/rules.model";
import type { CategoryCode } from "~/domains/shared/categories";

export const Route = createFileRoute("/proto-session-run")({
	component: RouteComponent,
});

const single = (
	id: string,
	category: CategoryCode,
	question: string,
	right: string,
	wrongs: string[]
): SessionPoll => ({
	id,
	category,
	question,
	answerType: "single",
	options: [
		{ id: `${id}-r`, label: right, correct: true },
		...wrongs.map((w, i) => ({ id: `${id}-${i}`, label: w, correct: false })),
	],
});

const BASE_POLLS: SessionPoll[] = [
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
const POOLS: SessionPoll[] = Array.from({ length: POOL_SIZE }, (_, i) => {
	const base = BASE_POLLS[i % BASE_POLLS.length];
	return { ...base, id: `${base.id}-${i}` };
});

const HANDED = [
	CONFIGS.js,
	CONFIGS.eslint,
	CONFIGS.copilot,
	CONFIGS.coverageGain,
	CONFIGS.speed,
	CONFIGS.pushForce,
];

const SessionGame = ({ onRestart }: { onRestart: () => void }) => {
	const [state, dispatch] = useReducer(sessionReducer, 0, () =>
		createSession(POOLS, HANDED)
	);
	const [selected, setSelected] = useState<readonly string[]>([]);
	const shownAt = useRef<number>(Date.now());
	useEffect(() => {
		shownAt.current = Date.now();
		setSelected([]);
	}, [state.currentIndex]);

	const view = toSessionView(state);
	const currentPoll = state.polls[state.currentIndex];
	const disabled = currentPoll
		? [
				...disabledOptionIds(
					state.pipeline.configs,
					currentPoll.category,
					currentPoll.options
				),
				...state.manualDisabled,
			]
		: [];
	const cost = rebuildCost(state.rebuildsUsed);
	const upgradeable = state.pipeline.configs.filter(
		(config) => config.focusCategory
	);

	const answer = (optionIds: readonly string[]) =>
		dispatch({
			type: "answer",
			optionIds,
			elapsedMs: Date.now() - shownAt.current,
		});
	const onSelect = (optionId: string) => {
		if (view.poll?.answerType === "single") return answer([optionId]);
		setSelected((current) =>
			current.includes(optionId)
				? current.filter((id) => id !== optionId)
				: [...current, optionId]
		);
	};

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
			{state.status === "configuring" && (
				<ConfiguringScreen
					configs={view.configs}
					slots={view.slots}
					bench={view.available}
					demands={view.demands}
					rewardMultiplier={view.rewardMultiplier}
					onSlot={(id) => dispatch({ type: "slot", configId: id })}
					onUnslot={(id) => dispatch({ type: "unslot", configId: id })}
					onStart={() => dispatch({ type: "start" })}
				/>
			)}

			{state.status === "answering" && view.poll && (
				<AnsweringScreen
					gatesCleared={view.gatesCleared}
					victoryGate={view.victoryGate}
					pollsToGate={view.pollsToGate}
					coverage={view.coverage}
					storage={view.storage}
					configs={view.configs}
					slots={view.slots}
					checks={view.checks}
					category={view.poll.category}
					question={view.poll.question}
					options={view.poll.options}
					answerType={view.poll.answerType}
					selectedOptionIds={selected}
					disabledOptionIds={disabled}
					canLint={canLint(state.pipeline.configs)}
					lintCost={LINT_COST}
					onSelect={onSelect}
					onSubmit={() => answer(selected)}
					onLint={() => dispatch({ type: "lint-poll" })}
				/>
			)}

			{state.status === "rewarding" && (
				<RewardScreen
					storage={view.storage}
					draftOptions={view.draftOptions}
					onDraft={(id) => dispatch({ type: "draft", configId: id })}
					rebuildCost={cost}
					canRebuild={state.storage >= cost}
					onRebuild={() => dispatch({ type: "rebuild-draft" })}
					slots={view.slots}
					canAddSlot={state.pipeline.slots < MAX_SLOTS}
					onAddSlot={() => dispatch({ type: "add-slot" })}
					upgradeable={upgradeable}
					onUpgrade={(id) => dispatch({ type: "upgrade", configId: id })}
				/>
			)}

			{state.status === "awaiting-strip" && (
				<StripScreen
					stripsRemaining={view.stripsRemaining}
					configs={view.configs}
					onStrip={(id) => dispatch({ type: "strip", configId: id })}
				/>
			)}

			{(state.status === "won" || state.status === "dead") && (
				<RunSummary
					won={state.status === "won"}
					gatesCleared={view.gatesCleared}
					coverage={view.coverage}
					storage={view.storage}
					onRestart={onRestart}
				/>
			)}

			{state.log.length > 0 && (
				<div className="mt-4 rounded-lg bg-zinc-900 p-4 text-xs text-pewter">
					{state.log.slice(-4).map((line, index) => (
						<p key={index}>▸ {line}</p>
					))}
				</div>
			)}
		</div>
	);
};

function RouteComponent() {
	const [seed, setSeed] = useState(0);
	return (
		<div className="min-h-screen bg-[#141221] text-white">
			<div className="mx-auto max-w-2xl px-8 pt-8 text-xs text-pewter">
				DEVVOTED · REBUILD · session-run
			</div>
			<SessionGame
				key={seed}
				onRestart={() => setSeed((current) => current + 1)}
			/>
		</div>
	);
}

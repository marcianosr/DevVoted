import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useState } from "react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ScoreEquationChips } from "~/modules/run/run/presentation/ScoreEquationChips.ui";
import { ConfigChip } from "~/modules/run/config/presentation/ConfigChip.ui";
import { PollCard } from "~/modules/run/poll/presentation/PollCard.ui";
import { createMockPollView } from "~/test/runView.factory";
import {
	RevealScore,
	type RevealStep,
} from "~/modules/run/poll/presentation/RevealScore.ui";

/**
 * Feel-test for "the reveal should be the scoring": three ways to show coverage
 * being earned while the ✓/✕ badges pop in. Hit Replay to re-watch each.
 * Once a treatment is chosen the losers get deleted and it wires into the run.
 */
const meta: Meta = {
	title: "Run/ScoringReveal",
};
export default meta;

type Story = StoryObj;

const CATEGORY = "js" as const;
const QUESTION =
	"Which of these are valid ways to make a fetch request cancellable? (5 correct answers exist)";

const OPTIONS = [
	{ id: "a", label: "AbortController + signal" },
	{ id: "b", label: "Cancel via a race with a timeout promise" },
	{ id: "c", label: "Setting fetch's timeout: property" },
	{ id: "d", label: "Ignoring the response if a newer request started" },
	{ id: "e", label: "Wrapping fetch in a cancellable promise library" },
];
// Correct: a, b, d, e. The player picked a, b, c, d — three right, one wrong (c),
// one correct answer missed (e).
const CORRECT = ["a", "b", "d", "e"];
const CHOSEN = ["a", "b", "c", "d"];

// Each right pick adds its share, the wrong pick dips, the missed correct adds
// nothing. Net = +1.3%. Module const so RevealScore's timers stay stable.
const STEPS: readonly RevealStep[] = [
	{ index: 0, delta: 0.6 },
	{ index: 1, delta: 0.6 },
	{ index: 2, delta: -0.5 },
	{ index: 3, delta: 0.6 },
];

const CHIP_DATA = {
	isCorrect: true,
	baseCoverage: 0.8,
	bonuses: [
		{ label: "streak", value: 0.3 },
		// Only coverage-affecting configs earn score chips — Code Coverage (flat
		// +0.5%) and AGENTS.md (×2). They render as the real ConfigChip, injected
		// here (the ui tier can't import module components — see ScoreEquationChips).
		// noTooltip avoids ConfigChip's tooltip nesting a <p> inside a <p>.
		{
			label: "code-coverage",
			value: 0.5,
			chip: <ConfigChip config={CONFIGS.codeCoverage} noTooltip />,
		},
		{
			label: "agents-md",
			value: 0.6,
			chip: <ConfigChip config={CONFIGS.agentsMd} noTooltip />,
		},
	],
	earnedCoverage: 2.2,
	// 5-option multiple-choice → the base "correct" chip carries a difficulty
	// tooltip (hover it) explaining why a harder poll paid more.
	difficulty: { multiplier: 1.7, optionCount: 5, isMultiple: true },
};

// The option pops run ~620ms (window + pop duration); chips start as the last
// badges land so the equation reads as the follow-through of the reveal.
const CHIP_START_MS = 500;

const RevealStage = ({
	children,
}: {
	children: (replayKey: number) => ReactNode;
}) => {
	const [replayKey, setReplayKey] = useState(0);
	return (
		<div className="mx-auto flex max-w-xl flex-col gap-4 p-6">
			<button
				type="button"
				onClick={() => setReplayKey((key) => key + 1)}
				className="self-start rounded border border-theme px-3 py-1 text-sm text-theme transition hover:bg-theme-soft"
			>
				↺ Replay
			</button>
			<div key={replayKey} className="flex flex-col gap-4">
				{children(replayKey)}
			</div>
		</div>
	);
};

const pollProps = {
	poll: createMockPollView({
		category: CATEGORY,
		question: QUESTION,
		answerType: "multiple",
		options: OPTIONS,
	}),
	reveal: { correctOptionIds: CORRECT, chosenOptionIds: CHOSEN },
	onSelect: () => {},
};

/** Coverage climbs step-by-step as each badge lands — each ✓ visibly scores. */
export const PerPopTally: Story = {
	render: () => (
		<RevealStage>
			{() => (
				<>
					<PollCard {...pollProps} />
					<RevealScore
						steps={STEPS}
						optionCount={OPTIONS.length}
						mode="perPop"
						label="JavaScript coverage"
					/>
				</>
			)}
		</RevealStage>
	),
};

/** One total sweeps smoothly from 0 across the whole reveal window. */
export const CountUpTotal: Story = {
	render: () => (
		<RevealStage>
			{() => (
				<>
					<PollCard {...pollProps} />
					<RevealScore
						steps={STEPS}
						optionCount={OPTIONS.length}
						mode="countUp"
						label="JavaScript coverage"
					/>
				</>
			)}
		</RevealStage>
	),
};

/** Chosen direction: chips pop in after the badges — base + bonuses = earned.
 *  No coverage bar, no streak line. */
export const ChipEquation: Story = {
	render: () => (
		<RevealStage>
			{() => (
				<>
					<PollCard {...pollProps} />
					<hr className="border-theme border-t" />
					<ScoreEquationChips
						{...CHIP_DATA}
						animated
						startDelayMs={CHIP_START_MS}
					/>
				</>
			)}
		</RevealStage>
	),
};

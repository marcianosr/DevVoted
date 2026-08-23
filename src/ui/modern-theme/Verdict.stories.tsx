import type { Meta, StoryObj } from "@storybook/react";

import { Token } from "./Code.ui";
import { Verdict, type AnswerOption } from "./Verdict.ui";

const meta: Meta<typeof Verdict> = {
	component: Verdict,
	title: "Modern/Verdict",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="max-w-4xl">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Verdict>;

const ARRAY_OPTIONS: readonly AnswerOption[] = [
	{ id: "slice-negative", label: "arr.slice(-2)", expected: true },
	{ id: "splice", label: "arr.splice(-2)", received: true },
	{ id: "slice-positive", label: "arr.slice(2)" },
	{ id: "at", label: "arr.at(-2)" },
];

const STACKING_OPTIONS: readonly AnswerOption[] = [
	{ id: "opacity", label: "opacity < 1", expected: true, received: true },
	{ id: "static", label: "position: static", received: true },
	{ id: "transform", label: "transform", expected: true, received: true },
	{ id: "float", label: "float: left" },
	{ id: "isolation", label: "isolation: isolate", expected: true },
	{ id: "overflow", label: "overflow: hidden" },
	{ id: "z-index", label: "z-index: auto" },
	{ id: "display", label: "display: flex" },
];

const code = [
	<>
		{"const arr = ["}
		<Token tone="vermillion">{'"init","lint","test","build","ship"'}</Token>
		{"] as const;"}
	</>,
	<>
		{"const tail = "}
		<Token tone="muted">{"/* ??? */"}</Token>
		{"; "}
		<Token tone="muted">{'// ["build","ship"]'}</Token>
	</>,
];

export const Passed: Story = {
	args: {
		outcome: "correct",
		question: "Which array method returns a shallow copy?",
		score: 2.6,
		options: ARRAY_OPTIONS,
	},
};

export const Failed: Story = {
	args: {
		outcome: "wrong",
		question:
			"Don't ask me why these polls all rhyme — to lift the final two from arr in TypeScript time, which line returns them, and leaves the source sublime?",
		score: -1.4,
		options: ARRAY_OPTIONS,
		code,
		explainer:
			"slice returns a new array and leaves the source untouched. splice mutates in place, which as const forbids, and it returns the removed items rather than a copy.",
	},
};

export const Partial: Story = {
	args: {
		outcome: "partial",
		question: "Select every CSS property that creates a stacking context",
		score: 0.7,
		options: STACKING_OPTIONS,
		explainer:
			"isolation: isolate exists purely to create a stacking context. position: static is the one positioning value that never does.",
	},
};

export const NothingPicked: Story = {
	args: {
		outcome: "wrong",
		question: "Which Python built-in returns an iterator of tuples?",
		score: -0.4,
		options: [
			{ id: "map", label: "map()" },
			{ id: "filter", label: "filter()" },
			{ id: "reversed", label: "reversed()" },
			{ id: "zip", label: "zip()", expected: true },
		],
		explainer: "The clock ran out before an answer landed.",
	},
};

export const EveryOptionAccountedFor: Story = {
	args: {
		outcome: "wrong",
		question: "Which git command rewrites history without a merge?",
		score: -0.9,
		options: [
			{ id: "rebase", label: "git rebase", expected: true },
			{ id: "cherry-pick", label: "git cherry-pick", received: true },
		],
		explainer:
			"rebase replays commits onto a new base. cherry-pick copies one commit and leaves the original history alone.",
	},
};

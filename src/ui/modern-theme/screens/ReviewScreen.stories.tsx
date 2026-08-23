import type { Meta, StoryObj } from "@storybook/react";

import { Token } from "../Code.ui";
import { ReviewScreen, type ReviewPoll } from "./ReviewScreen.ui";

const meta: Meta<typeof ReviewScreen> = {
	component: ReviewScreen,
	title: "Modern/Screens/Review",
};
export default meta;

type Story = StoryObj<typeof ReviewScreen>;

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

const polls: readonly ReviewPoll[] = [
	{
		id: "shallow-copy",
		outcome: "correct",
		question: "Which array method returns a shallow copy?",
		score: 2.6,
		options: [
			{ id: "slice", label: "arr.slice()", expected: true, received: true },
			{ id: "splice", label: "arr.splice()" },
			{ id: "sort", label: "arr.sort()" },
			{ id: "reverse", label: "arr.reverse()" },
		],
	},
	{
		id: "tail",
		outcome: "wrong",
		question:
			"Don't ask me why these polls all rhyme — to lift the final two from arr in TypeScript time, which line returns them, and leaves the source sublime?",
		score: -1.4,
		code,
		options: [
			{ id: "slice-negative", label: "arr.slice(-2)", expected: true },
			{ id: "splice", label: "arr.splice(-2)", received: true },
			{ id: "slice-positive", label: "arr.slice(2)" },
			{ id: "at", label: "arr.at(-2)" },
		],
		explainer:
			"slice returns a new array and leaves the source untouched. splice mutates in place, which as const forbids, and it returns the removed items rather than a copy.",
	},
	{
		id: "rewrite-history",
		outcome: "correct",
		question: "Which git command rewrites history without a merge?",
		score: 3.1,
		options: [
			{ id: "rebase", label: "git rebase", expected: true, received: true },
			{ id: "merge", label: "git merge" },
			{ id: "revert", label: "git revert" },
			{ id: "reset", label: "git reset" },
		],
	},
	{
		id: "stacking-context",
		outcome: "partial",
		question: "Select every CSS property that creates a stacking context",
		score: 0.7,
		options: [
			{ id: "opacity", label: "opacity < 1", expected: true, received: true },
			{ id: "static", label: "position: static", received: true },
			{ id: "transform", label: "transform", expected: true, received: true },
			{ id: "float", label: "float: left" },
			{ id: "isolation", label: "isolation: isolate", expected: true },
			{ id: "overflow", label: "overflow: hidden" },
			{ id: "z-index", label: "z-index: auto" },
			{ id: "display", label: "display: flex" },
		],
		explainer:
			"isolation: isolate exists purely to create a stacking context. position: static is the one positioning value that never does.",
	},
	{
		id: "tuples",
		outcome: "wrong",
		question: "Which Python built-in returns an iterator of tuples?",
		score: -0.4,
		options: [
			{ id: "map", label: "map()", received: true },
			{ id: "filter", label: "filter()" },
			{ id: "reversed", label: "reversed()" },
			{ id: "zip", label: "zip()", expected: true },
		],
		explainer:
			"zip() pairs items from several iterables into tuples. map() yields whatever the function returns, one value at a time.",
	},
];

const base = {
	gateName: "Lavender",
	gate: 4,
	theme: "lavender" as const,
	polls,
};

export const AfterAMiss: Story = {
	render: () => (
		<ReviewScreen
			{...base}
			back={{ label: "← Back to removal", onUse: () => {} }}
			note="2 configs still to pick"
		/>
	),
};

export const AfterAClear: Story = {
	render: () => (
		<ReviewScreen
			{...base}
			polls={polls.filter((poll) => poll.outcome === "correct")}
			back={{ label: "← Back to the shop", onUse: () => {} }}
			note="102 KB to spend"
		/>
	),
};

export const Unwired: Story = { render: () => <ReviewScreen {...base} /> };

export const Elite: Story = {
	render: () => (
		<ReviewScreen
			{...base}
			gateName="Elite"
			gate={11}
			theme="elite"
			back={{ label: "← Back to removal", onUse: () => {} }}
			note="3 configs still to pick"
		/>
	),
};

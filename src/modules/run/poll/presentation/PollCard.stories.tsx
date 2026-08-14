import type { Meta, StoryObj } from "@storybook/react";

import { PollCard } from "~/modules/run/poll/presentation/PollCard.ui";

const meta: Meta<typeof PollCard> = {
	component: PollCard,
	title: "Run/PollCard",
};
export default meta;

type Story = StoryObj<typeof PollCard>;

const options = [
	{ id: "a", label: "A stable unique id" },
	{ id: "b", label: "The array index, always" },
	{ id: "c", label: "Math.random()" },
];

export const SingleChoice: Story = {
	args: {
		category: "react",
		question: "What is the correct key to give list items in React?",
		answerType: "single",
		options,
		onSelect: () => {},
	},
};

export const MultipleChoice: Story = {
	args: {
		category: "ts",
		question: "Which of these are TypeScript utility types?",
		answerType: "multiple",
		options,
		selectedOptionIds: ["a"],
		onSelect: () => {},
	},
};

// The lint action itself lives on the linter's pipeline row (RoleList) — the
// card only shows its outcome: the crossed-out option.
export const WithLintedOption: Story = {
	args: {
		category: "js",
		question: "Which coerces to true?",
		answerType: "single",
		options,
		disabledOptionIds: ["c"],
		onSelect: () => {},
	},
};

/**
 * A bought peek at Telemetry level 1 (DVTD-fpf9). The bars are pewter on purpose:
 * a crowd favourite is not a right answer, and the player is reading a hint, not
 * a verdict. What they cannot see is how many people those percentages stand on —
 * this could be 42 developers or three.
 */
export const WithCommunitySplit: Story = {
	args: {
		category: "js",
		question: "Which coerces to true?",
		answerType: "single",
		options,
		split: { percentByOptionId: { a: 71, b: 22, c: 7 } },
		onSelect: () => {},
	},
};

/**
 * The same peek at level 2, where the sample size arrives. It is the whole
 * upgrade: 71% of 127 answers is worth following, 71% of 7 is a coin toss with
 * extra steps.
 */
export const WithCommunitySplitAndSampleSize: Story = {
	args: {
		category: "js",
		question: "Which coerces to true?",
		answerType: "single",
		options,
		split: { percentByOptionId: { a: 71, b: 22, c: 7 }, answeredCount: 127 },
		onSelect: () => {},
	},
};

export const WithCodeExample: Story = {
	args: {
		category: "js",
		question:
			"What does this log?\n\n```js\nconst nums = [1, 2, 3];\nconsole.log(nums.map((n) => n * 2));\n```",
		answerType: "single",
		options: [
			{ id: "a", label: "[2, 4, 6]" },
			{ id: "b", label: "[1, 2, 3]" },
			{ id: "c", label: "undefined" },
		],
		onSelect: () => {},
	},
};

/**
 * A poll whose code lives in the `code_block` column (raw source, no fences) rather
 * than inline in the question. The card wraps and highlights it so the player can
 * actually read the code the question refers to.
 */
export const WithCodeBlock: Story = {
	args: {
		category: "react",
		question:
			"In React, the following code can be seen, why will it not render anything on the screen?",
		codeBlock: "const App = () => {\n  <div>Hello world</div>;\n};",
		answerType: "single",
		options: [
			{ id: "a", label: "It doesn't render, you need the `return` statement" },
			{ id: "b", label: "It does render, this is implicit return" },
			{
				id: "c",
				label: "It doesn't render because a render function is required",
			},
		],
		onSelect: () => {},
	},
};

export const Revealed: Story = {
	args: {
		category: "react",
		question: "What is the correct key to give list items in React?",
		answerType: "single",
		options,
		onSelect: () => {},
		correctOptionIds: ["a"],
		chosenOptionIds: ["b"],
	},
};

/**
 * The scored reveal: each option's ✓/✕ badge pops in top→bottom (staggered)
 * so the player feels the game tallying their answer. Reload the story to
 * replay the animation.
 */
export const RevealedMultiple: Story = {
	args: {
		category: "js",
		question: "Which of these are valid ways to make a fetch cancellable?",
		answerType: "multiple",
		options: [
			{ id: "a", label: "AbortController + signal" },
			{ id: "b", label: "Cancel via a race with a timeout promise" },
			{ id: "c", label: "Setting fetch's timeout: property" },
			{ id: "d", label: "Ignoring the response if a newer request started" },
			{ id: "e", label: "Wrapping fetch in a cancellable promise library" },
		],
		onSelect: () => {},
		correctOptionIds: ["a", "b", "d", "e"],
		chosenOptionIds: ["a", "c", "d"],
	},
};

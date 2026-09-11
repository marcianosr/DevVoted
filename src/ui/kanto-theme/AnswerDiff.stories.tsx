import type { Meta, StoryObj } from "@storybook/react";

import { AnswerDiff } from "./AnswerDiff.ui";
import { Screen } from "./Screen.ui";

const MISS = {
	outcome: "wrong",
	answerType: "single",
	expected: [{ letter: "A", label: "justify-content" }],
	received: [{ letter: "B", label: "align-items" }],
	others: [
		{ letter: "C", label: "text-align" },
		{ letter: "D", label: "place-items" },
	],
	othersLabel: "2 other options",
} as const;

const meta: Meta<typeof AnswerDiff> = {
	component: AnswerDiff,
	title: "Kanto/AnswerDiff",
	args: MISS,
	render: (args) => (
		<Screen theme="lavender" width="narrow">
			<AnswerDiff {...args} />
		</Screen>
	),
};
export default meta;

type Story = StoryObj<typeof AnswerDiff>;

export const Missed: Story = {};

export const Caught: Story = {
	args: {
		outcome: "correct",
		expected: [{ letter: "A", label: "justify-content" }],
		received: [{ letter: "A", label: "justify-content" }],
	},
};

export const HalfCaught: Story = {
	args: {
		outcome: "partial",
		answerType: "multiple",
		expected: [
			{ letter: "A", label: "Partial<T>" },
			{ letter: "C", label: "Readonly<T>" },
			{ letter: "D", label: "Record<K,V>" },
		],
		received: [
			{ letter: "A", label: "Partial<T>" },
			{ letter: "C", label: "Readonly<T>" },
		],
		others: [
			{ letter: "B", label: "Maybe<T>" },
			{ letter: "E", label: "Nullable<T>" },
		],
		tally: "2 of 3 caught",
		othersLabel: "2 other options",
	},
};

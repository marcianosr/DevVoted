import type { Meta, StoryObj } from "@storybook/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { AnswerResults } from "./AnswerResults.ui";

const answered: AnsweredPoll[] = [
	{
		id: "js1",
		question: "Which method returns the last element of an array?",
		category: "js",
		outcome: "correct",
		picked: ["at(-1)"],
		correct: ["at(-1)"],
		options: ["at(-1)", "last()", "pop()"],
		answerType: "single",
		coverageEarned: 10,
	},
	{
		id: "css1",
		question: "Which centers a flex item on both axes?",
		category: "css",
		outcome: "wrong",
		picked: ["align: middle"],
		correct: ["place-items: center"],
		options: ["align: middle", "place-items: center", "float: center"],
		answerType: "single",
		explanation:
			"place-items sets align-items and justify-items in one go, centering on both axes.",
		coverageEarned: 0,
	},
	{
		id: "react1",
		question: "What key should list items get?",
		category: "react",
		outcome: "correct",
		picked: ["A stable unique id"],
		correct: ["A stable unique id"],
		options: ["A stable unique id", "The array index", "Math.random()"],
		answerType: "single",
		coverageEarned: 10,
	},
	{
		id: "ts1",
		question: "Which are TS utility types?",
		category: "ts",
		outcome: "partial",
		picked: ["Partial", "Banjo"],
		correct: ["Partial", "Pick"],
		options: ["Partial", "Banjo", "Pick", "Kazooie"],
		answerType: "multiple",
		coverageEarned: 4,
	},
];

const meta: Meta<typeof AnswerResults> = {
	component: AnswerResults,
	title: "Run/AnswerResults",
};
export default meta;

type Story = StoryObj<typeof AnswerResults>;

export const Default: Story = {
	args: { answered },
};

// Older run snapshots predate coverageEarned — the score column drops to the
// bare outcome icon, no percentage.
export const WithoutScores: Story = {
	args: {
		answered: answered.map(({ coverageEarned: _drop, ...poll }) => poll),
	},
};

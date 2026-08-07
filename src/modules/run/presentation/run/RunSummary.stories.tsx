import type { Meta, StoryObj } from "@storybook/react";

import type { AnsweredPoll } from "~/modules/run/climb/run.model";
import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RunSummary } from "./RunSummary.ui";

const answered: AnsweredPoll[] = [
	{
		id: "p1",
		question: "Which selector has the highest specificity?",
		category: "css",
		outcome: "correct",
		picked: ["#id"],
		correct: ["#id"],
		options: ["#id", ".class", "div"],
		answerType: "single",
		coverageEarned: 1.1,
	},
	{
		id: "p2",
		question: "What does `useMemo` return?",
		category: "js",
		outcome: "wrong",
		picked: ["a new function"],
		correct: ["a memoized value"],
		options: ["a memoized value", "a new function", "a ref"],
		answerType: "single",
	},
	{
		id: "p3",
		question: "Pick the falsy values.",
		category: "js",
		outcome: "partial",
		picked: ["0"],
		correct: ["0", "''", "NaN"],
		options: ["0", "''", "NaN", "[]"],
		answerType: "multiple",
	},
];

const configs = [CONFIGS.css, CONFIGS.agentsMd, CONFIGS.indexedDb];

const meta: Meta<typeof RunSummary> = {
	component: RunSummary,
	title: "Run/RunSummary",
};
export default meta;

type Story = StoryObj<typeof RunSummary>;

export const Summited: Story = {
	args: {
		won: true,
		gatesCleared: 5,
		victoryGate: 12,
		coverage: 24,
		storage: 640,
		configs,
		answered,
	},
};

export const RunOver: Story = {
	args: {
		won: false,
		gatesCleared: 2,
		victoryGate: 12,
		coverage: 9,
		storage: 137,
		configs,
		answered,
	},
};

export const StalledAtFirstGate: Story = {
	args: {
		won: false,
		gatesCleared: 0,
		victoryGate: 12,
		coverage: 2,
		storage: 24,
		configs: [CONFIGS.css],
		answered: answered.slice(0, 1),
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { SnippetBar } from "./SnippetBar.ui";

const meta: Meta<typeof SnippetBar> = {
	component: SnippetBar,
	title: "Polls/SnippetBar",
	args: {
		onSpend: () => {},
		onDebugEarn: () => {},
		earnMessage: null,
		tryCatchArmed: false,
		progress: { toGo: 12.4, label: "css", pct: 50 },
	},
};
export default meta;

type Story = StoryObj<typeof SnippetBar>;

const fiftyFifty = {
	id: "fifty-fifty",
	name: "50/50",
	description: "Strike out two wrong answers on this poll.",
};
const consoleLog = {
	id: "console-log",
	name: "console.log",
	description: "See how many of your picked answers are correct as you select.",
};
const prettier = {
	id: "prettier",
	name: "Prettier",
	description: "Strike out every wrong answer on this poll.",
};

export const NoneEarned: Story = {
	args: { held: [], canSpend: true },
};

export const MixedHeld: Story = {
	args: { held: [fiftyFifty, consoleLog, prettier], canSpend: true },
};

export const JustEarned: Story = {
	args: {
		held: [fiftyFifty, consoleLog],
		canSpend: true,
		earnMessage:
			"Earned console.log — a category passed a 25% coverage milestone.",
	},
};

export const AlreadyAnswered: Story = {
	args: { held: [fiftyFifty, prettier], canSpend: false },
};

const tryCatch = {
	id: "try-catch",
	name: "try/catch",
	description: "Arm it: a gate failure this window is caught.",
};

export const TryCatchArmed: Story = {
	args: {
		held: [fiftyFifty, tryCatch],
		canSpend: true,
		tryCatchArmed: true,
		earnMessage: "try/catch caught a gate failure — run survives!",
	},
};

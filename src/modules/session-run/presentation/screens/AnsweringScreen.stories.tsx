import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster";
import { AnsweringScreen } from "./AnsweringScreen.ui";

const meta: Meta<typeof AnsweringScreen> = {
	component: AnsweringScreen,
	title: "Session Run/Screens/Answering",
};
export default meta;

type Story = StoryObj<typeof AnsweringScreen>;

export const Default: Story = {
	args: {
		gatesCleared: 2,
		victoryGate: 5,
		pollsToGate: 3,
		coverage: 6,
		storage: 440,
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		slots: 3,
		checks: [
			{ label: "Correct", progress: "1/2", state: "running" },
			{ label: "Coverage", progress: "2%/4%", state: "running" },
		],
		category: "react",
		question: "What is the correct key to give list items in React?",
		options: [
			{ id: "a", label: "A stable unique id" },
			{ id: "b", label: "The array index, always" },
			{ id: "c", label: "Math.random()" },
		],
		answerType: "single",
		onSelect: () => {},
	},
};

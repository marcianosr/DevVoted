import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { AnsweringScreen } from "./AnsweringScreen.ui";

const meta: Meta<typeof AnsweringScreen> = {
	component: AnsweringScreen,
	title: "Session Run/Screens/Answering",
};
export default meta;

type Story = StoryObj<typeof AnsweringScreen>;

export const Default: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		checks: [
			{
				label: "Correct",
				progress: "1/2",
				current: 1,
				target: 2,
				state: "running",
				sourceConfigId: "unit-tests",
			},
			{
				label: "Coverage",
				progress: "2%/4%",
				current: 2,
				target: 4,
				state: "running",
				sourceConfigId: "coverage-gain",
			},
		],
		category: "react",
		question: "What is the correct key to give list items in React?",
		options: [
			{ id: "a", label: "A stable unique id" },
			{ id: "b", label: "The array index, always" },
			{ id: "c", label: "Math.random()" },
		],
		canSubmit: true,
		onSelect: () => {},
		onSubmit: () => {},
	},
};

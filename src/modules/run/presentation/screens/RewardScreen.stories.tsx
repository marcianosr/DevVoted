import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Run/Screens/Reward",
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

export const Default: Story = {
	args: {
		gatesCleared: 1,
		gateReward: 120,
		coverageGainedByCategory: { js: 8, css: 3.5 },
		answered: [
			{
				id: "js1",
				question: "typeof null?",
				category: "js",
				outcome: "correct",
				picked: ['"object"'],
			},
			{
				id: "css1",
				question: "Centers a flex item?",
				category: "css",
				outcome: "correct",
				picked: ["place-items: center"],
			},
			{
				id: "js2",
				question: "pop() returns?",
				category: "js",
				outcome: "wrong",
				picked: ["the first element"],
			},
		],
		passedChecks: [
			{
				label: "Correct",
				progress: "2/2",
				current: 2,
				target: 2,
				state: "success",
				sourceConfigId: "unit-tests",
				description: "2 correct answers",
			},
		],
		configs: [CONFIGS.unitTests],
	},
};

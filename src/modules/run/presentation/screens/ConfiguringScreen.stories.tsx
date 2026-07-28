import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const meta: Meta<typeof ConfiguringScreen> = {
	component: ConfiguringScreen,
	title: "Run/Screens/Configuring",
};
export default meta;

type Story = StoryObj<typeof ConfiguringScreen>;

export const Default: Story = {
	args: {
		configs: [CONFIGS.js],
		slots: 3,
		bench: [CONFIGS.eslint, CONFIGS.copilot, CONFIGS.coverageGain],
		gateNumber: 1,
		pollsToGate: 5,
		gateReward: 80,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
		checks: [
			{
				label: "Correct",
				progress: "0/1",
				current: 0,
				target: 1,
				state: "running",
			},
			{
				label: ".js mastery",
				progress: "not seen",
				current: 0,
				target: 1,
				state: "skipped",
				sourceConfigId: "js",
			},
		],
		onSlot: () => {},
		onUnslot: () => {},
	},
};

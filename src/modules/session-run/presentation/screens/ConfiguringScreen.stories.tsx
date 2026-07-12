import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfiguringScreen } from "./ConfiguringScreen.ui";

const meta: Meta<typeof ConfiguringScreen> = {
	component: ConfiguringScreen,
	title: "Session Run/Screens/Configuring",
};
export default meta;

type Story = StoryObj<typeof ConfiguringScreen>;

export const Default: Story = {
	args: {
		configs: [CONFIGS.js],
		slots: 3,
		bench: [
			CONFIGS.eslint,
			CONFIGS.copilot,
			CONFIGS.coverageGain,
			CONFIGS.pushForce,
		],
		demands: ["1 correct answer"],
		rewardMultiplier: 1,
		onSlot: () => {},
		onUnslot: () => {},
		onStart: () => {},
	},
};

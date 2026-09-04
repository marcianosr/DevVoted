import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ConfiguringScreen } from "~/modules/run/build/presentation/ConfiguringScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const meta: Meta<typeof ConfiguringScreen> = {
	component: ConfiguringScreen,
	title: "Run/Screens/Configuring",
};
export default meta;

type Story = StoryObj<typeof ConfiguringScreen>;

const stake = createMockGateStake({
	modifiers: {
		gateReward: 80,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	perAnswer: {
		coveragePerCorrect: 1,
		coveragePerWrong: -0.3,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
		matchingConfigMultiplier: 1.25,
	},
});

export const Default: Story = {
	args: {
		configs: [CONFIGS.js],
		slots: 4,
		slotsUsed: 1,
		slotsFree: 3,
		stake,
		bench: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coverageGain],
		onInstall: () => {},
		onUninstall: () => {},
		startAction: { label: "Start run →", onClick: () => {} },
	},
};

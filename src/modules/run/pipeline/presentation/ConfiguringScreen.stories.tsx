import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { STARTER_STACKS } from "~/modules/run/config/domain/stack.model";
import { ConfiguringScreen } from "~/modules/run/pipeline/presentation/ConfiguringScreen.ui";
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
		storageKbPerCorrect: 0,
		matchingConfigMultiplier: 1.25,
	},
});

export const Default: Story = {
	args: {
		configs: [CONFIGS.js],
		spots: 4,
		spotsUsed: 1,
		spotsFree: 3,
		stake,
		bench: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coverageGain],
		onSlot: () => {},
		onUnslot: () => {},
		startAction: { label: "Start run →", onClick: () => {} },
	},
};

export const StackMode: Story = {
	args: {
		...Default.args,
		configs: [],
		stacks: STARTER_STACKS,
		onPickStack: () => {},
	},
};

export const StackModePicked: Story = {
	args: {
		...StackMode.args,
		configs: STARTER_STACKS[0].configs,
	},
};

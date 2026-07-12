import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Session Run/Screens/Reward",
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

export const Default: Story = {
	args: {
		storage: 440,
		demands: ["1 correct answer", "+4% coverage this window"],
		rewardMultiplier: 1.5,
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		newConfigIds: ["coverage-gain"],
		draftOptions: [CONFIGS.eslint, CONFIGS.copilot, CONFIGS.speed],
		onDraft: () => {},
		rebuildCost: 1,
		canRebuild: true,
		onRebuild: () => {},
		slots: 3,
		canAddSlot: true,
		onAddSlot: () => {},
		upgradeable: [CONFIGS.js],
		onUpgrade: () => {},
		onNext: () => {},
	},
};

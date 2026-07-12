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
		gateNumber: 3,
		pollsToGate: 5,
		gateReward: 180,
		checks: [
			{
				label: "Correct",
				progress: "0/2",
				current: 0,
				target: 2,
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
			{
				label: "Coverage",
				progress: "0%/4%",
				current: 0,
				target: 4,
				state: "running",
				sourceConfigId: "coverage-gain",
			},
		],
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		newConfigIds: ["coverage-gain"],
		draftOptions: [CONFIGS.eslint, CONFIGS.copilot, CONFIGS.coldStart],
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

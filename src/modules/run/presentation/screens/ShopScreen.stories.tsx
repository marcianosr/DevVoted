import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ShopScreen } from "./ShopScreen.ui";

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Run/Screens/Shop",
};
export default meta;

type Story = StoryObj<typeof ShopScreen>;

export const Default: Story = {
	args: {
		storage: 440,
		coverageByCategory: { css: 8 },
		gateNumber: 3,
		checks: [
			{
				label: "Correct",
				progress: "0/2",
				current: 0,
				target: 2,
				state: "running",
				description: "2 correct answers",
			},
			{
				label: ".js mastery",
				progress: "not seen",
				current: 0,
				target: 1,
				state: "skipped",
				sourceConfigId: "js",
				description: "get one right if js appears",
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
		gateReward: 240,
		rewardMultiplier: 2,
		coverageMultiplier: 2,
		coverageAdd: 0.5,
		coverage: 25,
		slotCoverageRequired: 20,
		canAddSlot: true,
		onAddSlot: () => {},
		onUpgrade: () => {},
		onSell: () => {},
	},
};

export const SlotLocked: Story = {
	args: {
		...Default.args,
		coverage: 12,
		slotCoverageRequired: 20,
		canAddSlot: false,
	},
};

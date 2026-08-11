import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { PrepScreen } from "./PrepScreen.ui";

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Run/Screens/Prep",
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

export const Default: Story = {
	args: {
		gateNumber: 1,
		pollsPerGate: 5,
		stripsOnFailure: 1,
		minConfigs: 1,
		storageBillKb: 0,
		modifiers: {
			gateReward: 32,
			rewardMultiplier: 1,
			coverageMultiplier: 1,
			coverageAdd: 0,
		},
		perAnswer: {
			coveragePerCorrect: 8,
			storageKbPerCorrect: 2,
			matchingConfigMultiplier: 1.25,
		},
		configs: [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd],
		editing: false,
		onDropConfig: () => {},
		onEditPipeline: () => {},
		onStartGate: () => {},
	},
};

/** The peel quota has caught up with the build: a fail here ends the run. */
export const Fatal: Story = {
	args: {
		...Default.args,
		stripsOnFailure: 3,
	},
};

/** "Edit pipeline" toggled: every chip but the last offers a remove action. */
export const Editing: Story = {
	args: {
		...Default.args,
		editing: true,
	},
};

/** On a paid storage plan: the receipt names the bill the window will collect. */
export const PaidStoragePlan: Story = {
	args: {
		...Default.args,
		storageBillKb: 16,
	},
};

/**
 * A strip sank the build under the gate's width demand (ADR-027): the receipt
 * warns in cinnabar that climbing on ends the run — the moment that decides
 * whether death at the gate's door reads as fair.
 */
export const UnderWidthDemand: Story = {
	args: {
		...Default.args,
		gateNumber: 4,
		stripsOnFailure: 3,
		minConfigs: 4,
		configs: [CONFIGS.js, CONFIGS.eslint],
	},
};

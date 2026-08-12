import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";

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
		shopAction: { label: "← Back to shop", onClick: () => {} },
		onStartGate: () => {},
		onDropConfig: () => {},
	},
};

/** Past the shop door: the drop panel loses its "sell it instead" way out. */
export const ShopClosed: Story = {
	args: {
		...Default.args,
		shopAction: undefined,
	},
};

export const Fatal: Story = {
	args: {
		...Default.args,
		stripsOnFailure: 3,
	},
};

export const PaidStoragePlan: Story = {
	args: {
		...Default.args,
		storageBillKb: 16,
	},
};

export const UnderWidthDemand: Story = {
	args: {
		...Default.args,
		gateNumber: 4,
		stripsOnFailure: 3,
		minConfigs: 4,
		configs: [CONFIGS.js, CONFIGS.eslint],
	},
};

export const AwaitingTomorrowsPolls: Story = {
	args: {
		...Default.args,
		startLock: "New polls in 7h 23m",
	},
};

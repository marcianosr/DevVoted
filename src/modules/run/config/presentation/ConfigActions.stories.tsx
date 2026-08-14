import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { ConfigActions } from "~/modules/run/config/presentation/ConfigActions.ui";

const meta: Meta<typeof ConfigActions> = {
	component: ConfigActions,
	title: "Run/ConfigActions",
};
export default meta;

type Story = StoryObj<typeof ConfigActions>;

// Click the chip to open the actions popover.
export const SellOnly: Story = {
	args: {
		config: CONFIGS.eslint,
		actions: [{ label: "Sell for 10KB", onClick: () => {} }],
	},
};

export const SellAndUpgrade: Story = {
	args: {
		config: { ...CONFIGS.js, level: 2 },
		actions: [
			{ label: "Sell for 10KB", onClick: () => {} },
			{ label: "Upgrade — 120KB", onClick: () => {} },
		],
	},
};

export const UpgradeUnaffordable: Story = {
	args: {
		config: CONFIGS.unitTests,
		actions: [{ label: "Upgrade — 60KB", onClick: () => {}, disabled: true }],
	},
};

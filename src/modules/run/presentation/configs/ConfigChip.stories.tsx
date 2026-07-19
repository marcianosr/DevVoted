import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { ConfigChip } from "./ConfigChip.ui";

const meta: Meta<typeof ConfigChip> = {
	component: ConfigChip,
	title: "Run/ConfigChip",
};
export default meta;

type Story = StoryObj<typeof ConfigChip>;

export const Focus: Story = { args: { config: CONFIGS.js } };
export const FocusLeveled: Story = {
	args: { config: { ...CONFIGS.js, level: 2 } },
};
export const Compact: Story = {
	args: { config: CONFIGS.unitTests, compact: true, noFixedBadge: true },
};
export const RareAmplify: Story = { args: { config: CONFIGS.copilot } };
export const LegendaryRisk: Story = { args: { config: CONFIGS.copilot } };
export const WithAction: Story = {
	args: { config: CONFIGS.eslint, action: "✕", onClick: () => {} },
};

import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfigChip } from "./ConfigChip.ui";

const meta: Meta<typeof ConfigChip> = {
	component: ConfigChip,
	title: "Session Run/ConfigChip",
};
export default meta;

type Story = StoryObj<typeof ConfigChip>;

export const Focus: Story = { args: { config: CONFIGS.js } };
export const FocusLeveled: Story = {
	args: { config: { ...CONFIGS.js, level: 2 } },
};
export const RareAmplify: Story = { args: { config: CONFIGS.copilot } };
export const LegendaryRisk: Story = { args: { config: CONFIGS.copilot } };
export const WithAction: Story = {
	args: { config: CONFIGS.eslint, action: "✕", onClick: () => {} },
};

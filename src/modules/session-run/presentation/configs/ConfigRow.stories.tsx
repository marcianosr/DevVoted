import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { ConfigRow } from "./ConfigRow.ui";

const meta: Meta<typeof ConfigRow> = {
	component: ConfigRow,
	title: "Session Run/ConfigRow",
};
export default meta;

type Story = StoryObj<typeof ConfigRow>;

export const Focus: Story = { args: { config: CONFIGS.js } };
export const Draftable: Story = {
	args: { config: CONFIGS.copilot, action: "draft ＋", onClick: () => {} },
};
export const Peelable: Story = {
	args: { config: CONFIGS.deployFriday, action: "peel ✕", onClick: () => {} },
};

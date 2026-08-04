import type { Meta, StoryObj } from "@storybook/react";

import { StatBadge } from "./StatBadge.ui";

const meta: Meta<typeof StatBadge> = {
	component: StatBadge,
	title: "Run/StatBadge",
};
export default meta;

type Story = StoryObj<typeof StatBadge>;

export const CssActive: Story = {
	args: { label: "Coverage", value: "6%", category: "css" },
};
export const JsActive: Story = {
	args: { label: "Storage", value: "440KB", category: "js" },
};
export const AmbientTheme: Story = { args: { label: "Gate", value: "3/5" } };

// The configure preview's old → new strip: the current value goes muted and
// the value the hovered config would produce arrives in celadon.
export const PendingChange: Story = {
	args: { label: "coverage ×", value: "×2", from: "×1" },
};

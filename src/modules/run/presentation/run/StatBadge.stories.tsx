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

import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";

const meta: Meta<typeof Dot> = {
	component: Dot,
	title: "Modern/Dot",
};
export default meta;

type Story = StoryObj<typeof Dot>;

export const Online: Story = { args: { tone: "celadon" } };
export const Offline: Story = { args: { tone: "cinnabar" } };
export const Skipped: Story = { args: { tone: "muted", hollow: true } };

export const EveryStatus: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Dot tone="celadon" />
			<Dot tone="muted" hollow />
			<Dot tone="cinnabar" />
			<Dot tone="theme" />
			<Dot tone="saffron" />
		</div>
	),
};

export const Boxed: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Dot shape="box" tone="saffron" />
			<Dot shape="box" tone="muted" />
		</div>
	),
};

import type { Meta, StoryObj } from "@storybook/react";

import { Press } from "./Press.ui";

const noop = () => {};

const meta: Meta<typeof Press> = {
	component: Press,
	title: "Terminal/Press",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Press>;

export const Remove: Story = { args: { label: "remove", onUse: noop } };

export const Deploy: Story = {
	args: { label: "deploy ↑", tone: "celadon", onUse: noop },
};

export const Use: Story = {
	args: { label: "use · 16 KB", tone: "cerulean", onUse: noop },
};

export const Change: Story = { args: { label: "change →", onUse: noop } };

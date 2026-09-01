import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel.ui";
import { Text } from "./Text.ui";

const meta: Meta<typeof Panel> = {
	component: Panel,
	title: "Terminal/Panel",
	parameters: { layout: "fullscreen" },
	decorators: [
		(Story) => (
			<div className="min-h-screen bg-zinc-900 p-6">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Panel>;

export const Plain: Story = {
	args: { children: <Text>one panel per screen, 800px wide at most</Text> },
};

export const Themed: Story = {
	args: {
		theme: "lavender",
		children: <Text tone="theme">the gate theme tints descendants</Text>,
	},
};

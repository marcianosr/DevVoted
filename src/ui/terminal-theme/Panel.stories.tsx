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
	args: { children: <Text>one panel per screen, 850px wide at most</Text> },
};

/** The two screens that carry a build sidebar get a wider frame, so the fixed
    18rem column is not taken out of the reading width. */
export const WithSidebar: Story = {
	args: {
		sidebar: true,
		children: <Text>1040px, for the poll and reveal screens</Text>,
	},
};

export const Themed: Story = {
	args: {
		theme: "lavender",
		children: <Text tone="theme">the gate theme tints descendants</Text>,
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { Text } from "./Text.ui";

const meta: Meta<typeof Text> = {
	component: Text,
	title: "Terminal/Text",
	decorators: [
		(Story) => (
			<div className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Text>;

export const Base: Story = { args: { children: "today's 5 polls are ready" } };

export const Muted: Story = {
	args: { tone: "muted", children: "daily developer trivia" },
};

export const Title: Story = {
	args: { size: "title", className: "font-bold", children: "DevVoted" },
};

export const Score: Story = {
	args: {
		size: "score",
		className: "font-bold",
		children: "Which method returns the last element of an array?",
	},
};

export const Toned: Story = {
	args: { tone: "viridian", children: "+160 KB" },
};

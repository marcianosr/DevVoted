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

export const Thin: Story = {
	args: { tone: "muted", weight: "thin", children: "wrong costs" },
};

export const Weights: Story = {
	render: () => (
		<div className="flex flex-col gap-1">
			<Text tone="muted">wrong costs 6.7 · 3 options</Text>
			<Text tone="muted" weight="thin">
				wrong costs 6.7 · 3 options
			</Text>
		</div>
	),
};

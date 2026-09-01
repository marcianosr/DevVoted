import type { Meta, StoryObj } from "@storybook/react";

import { Header } from "./Header.ui";

const meta: Meta<typeof Header> = {
	component: Header,
	title: "Terminal/Header",
	decorators: [
		(Story) => (
			<div className="w-[700px] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof Header>;

export const Home: Story = {
	args: {
		title: "DevVoted",
		subtitle: "daily developer trivia",
		swatch: "pallet",
		value: "512 KB",
		caption: "archive",
	},
};

export const Gate: Story = {
	args: {
		title: "Gate 4 · Lavender",
		subtitle: "1 audit · 402 Payment Required",
		swatch: "lavender",
		value: "102 KB",
		caption: "balance",
	},
};

export const Shop: Story = {
	args: {
		title: "Boulder shop",
		subtitle: "next up · gate 2",
		swatch: "boulder",
		value: "96 KB",
		caption: "balance",
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";
import { Legend } from "./Legend.ui";

const meta: Meta<typeof Legend> = {
	component: Legend,
	title: "Modern/Legend",
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Legend>;

export const KeyingSegments: Story = {
	args: {
		items: [
			{
				id: "configs",
				marker: <Dot shape="box" tone="theme" />,
				label: "configs 224 KB",
			},
			{
				id: "leftovers",
				marker: <Dot shape="box" tone="saffron" />,
				label: "rebuild leftovers 16 KB",
			},
			{
				id: "free",
				marker: <Dot shape="box" tone="muted" />,
				label: "free 272 KB",
			},
		],
	},
};

export const KeyingColumns: Story = {
	args: {
		items: [
			{ id: "coverage", label: "coverage needed" },
			{ id: "peels", label: "configs a miss peels" },
			{
				id: "audit",
				marker: <Dot shape="box" tone="saffron" />,
				label: "audit",
			},
			{
				id: "unlock",
				marker: <Dot shape="box" tone="muted" />,
				label: "unlock",
			},
		],
	},
};

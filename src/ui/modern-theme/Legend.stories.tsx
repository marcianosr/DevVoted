import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";
import { Legend, RARITY_LEGEND } from "./Legend.ui";

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

export const FourTiers: Story = { args: { items: RARITY_LEGEND } };

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

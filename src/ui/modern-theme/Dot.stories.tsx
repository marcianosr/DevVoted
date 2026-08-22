import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";
import { RARITY_ORDER } from "./rarity";

const meta: Meta<typeof Dot> = {
	component: Dot,
	title: "Modern/Dot",
};
export default meta;

type Story = StoryObj<typeof Dot>;

export const Common: Story = { args: { rarity: "common" } };
export const Legendary: Story = { args: { rarity: "legendary" } };

export const EveryTier: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			{RARITY_ORDER.map((rarity) => (
				<Dot key={rarity} rarity={rarity} />
			))}
		</div>
	),
};

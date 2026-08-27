import type { Meta, StoryObj } from "@storybook/react";

import { RarityStripe } from "./RarityStripe.ui";
import { RARITY_ORDER } from "./rarity";
import { Text } from "./Text.ui";

const meta: Meta<typeof RarityStripe> = {
	component: RarityStripe,
	title: "Modern/RarityStripe",
	decorators: [
		(Story) => (
			<div data-gate-theme="volcano" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof RarityStripe>;

export const Common: Story = { args: { rarity: "common" } };
export const Legendary: Story = { args: { rarity: "legendary" } };

// The ladder as a column, which is how a player meets it: the stripe grades the
// name it leads, and the Legend keys the four colours.
export const EveryTier: Story = {
	render: () => (
		<ul className="flex flex-col gap-2">
			{RARITY_ORDER.map((rarity) => (
				<li key={rarity} className="flex items-center gap-2">
					<RarityStripe rarity={rarity} />
					<Text size="meta">{rarity}</Text>
				</li>
			))}
		</ul>
	),
};

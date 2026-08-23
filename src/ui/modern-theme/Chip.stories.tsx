import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip.ui";
import { RARITY_ORDER } from "./rarity";

const meta: Meta<typeof Chip> = {
	component: Chip,
	title: "Modern/Chip",
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Common: Story = { args: { rarity: "common", children: "ESLint" } };
export const Uncommon: Story = {
	args: { rarity: "uncommon", children: "Intellisense" },
};
export const Rare: Story = { args: { rarity: "rare", children: "AGENTS.md" } };

export const Legendary: Story = {
	args: { rarity: "legendary", children: "Freemium" },
};

export const EveryTier: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			{RARITY_ORDER.map((rarity) => (
				<Chip key={rarity} rarity={rarity}>
					{rarity}
				</Chip>
			))}
		</div>
	),
};

export const Category: Story = {
	args: { tone: "cerulean", children: "typescript" },
};

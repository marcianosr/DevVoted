import type { Meta, StoryObj } from "@storybook/react";

import { Chip } from "./Chip.ui";
import { RARITY_ORDER } from "./rarity";

// Game-design reason: rarity is the one config fact a player reads before the
// name means anything, so it rides the name itself rather than a separate badge.
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

/** Legendary is the only tier without a colour of its own — it wears the Kanto
 * gradient, so no single config can claim the top tier's hue. */
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

/** A category is not a tier: it gets a tint rather than an outline, so it reads
 * as a label on the poll instead of a rank on a config. */
export const Category: Story = {
	args: { tone: "cerulean", children: "typescript" },
};

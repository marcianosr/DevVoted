import type { Meta, StoryObj } from "@storybook/react";

import { Dot } from "./Dot.ui";
import { RARITY_ORDER } from "./rarity";
import { RarityWord } from "./RarityWord.ui";

const meta: Meta<typeof RarityWord> = {
	component: RarityWord,
	title: "Modern/RarityWord",
};
export default meta;

type Story = StoryObj<typeof RarityWord>;

export const Common: Story = { args: { rarity: "common" } };
export const Legendary: Story = { args: { rarity: "legendary" } };

export const EveryTier: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{RARITY_ORDER.map((rarity) => (
				<RarityWord key={rarity} rarity={rarity} />
			))}
		</div>
	),
};

// The pairing it actually ships in, so the dot and the word can be checked
// against each other rather than only in isolation.
export const BesideItsDot: Story = {
	render: () => (
		<div className="flex flex-col gap-2">
			{RARITY_ORDER.map((rarity) => (
				<div key={rarity} className="flex items-center gap-2">
					<Dot rarity={rarity} />
					<RarityWord rarity={rarity} />
				</div>
			))}
		</div>
	),
};

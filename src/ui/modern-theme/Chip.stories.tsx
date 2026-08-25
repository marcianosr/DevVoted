import type { Meta, StoryObj } from "@storybook/react";

import { Chip, chipFigures, type ChipTone } from "./Chip.ui";
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

const TONES = [
	"theme",
	"cerulean",
	"celadon",
	"saffron",
	"vermillion",
	"cinnabar",
	"muted",
	"raised",
] as const satisfies readonly ChipTone[];

/** Every tone against a themed ground, so `theme` reads beside the fixed ones. */
export const Tones: Story = {
	render: () => (
		<div data-gate-theme="cascade" className="flex flex-wrap gap-3">
			{TONES.map((tone) => (
				<Chip key={tone} tone={tone}>
					{tone}
				</Chip>
			))}
		</div>
	),
};

/** A config's own sentence, with the figures in it chipped: the number in the
 * prose and the badge at the end of its row are the same fact, so they read as
 * the same thing. */
export const FiguresInASentence: Story = {
	render: () => (
		<div className="flex max-w-md flex-col gap-2">
			<p>{chipFigures("Vue polls pay 1.25× coverage.")}</p>
			<p>{chipFigures("All coverage earns ×1.25, fading ×0.9 each clear.")}</p>
			<p>{chipFigures("+32KB storage on gate clear.")}</p>
			<p>
				{chipFigures("1 in 4 gate clears: a random config upgrades, free.")}
			</p>
		</div>
	),
};

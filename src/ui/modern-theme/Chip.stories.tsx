import type { Meta, StoryObj } from "@storybook/react";

import { Chip, chipFigures, type ChipTone } from "./Chip.ui";
import { CONFIG_SIZES } from "~/modules/run/config/domain/config.model";

const meta: Meta<typeof Chip> = {
	component: Chip,
	title: "Modern/Chip",
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const OneSlot: Story = { args: { slots: 1, children: "ESLint" } };
export const TwoSlots: Story = {
	args: { slots: 2, children: "Intellisense" },
};
export const FourSlots: Story = {
	args: { slots: 4, children: "AGENTS.md" },
};

export const EightSlots: Story = {
	args: { slots: 8, children: "Freemium" },
};

export const EverySize: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			{CONFIG_SIZES.map((slots) => (
				<Chip key={slots} slots={slots} size="lg">
					{`a ${slots}-slot config`}
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

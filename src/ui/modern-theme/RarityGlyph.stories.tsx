import type { Meta, StoryObj } from "@storybook/react";

import { RARITY_ORDER } from "./rarity";
import { RarityGlyph } from "./RarityGlyph.ui";

const meta: Meta<typeof RarityGlyph> = {
	component: RarityGlyph,
	title: "Modern/RarityGlyph",
};
export default meta;

type Story = StoryObj<typeof RarityGlyph>;

export const Bit: Story = { args: { rarity: "bit" } };
export const Byte: Story = { args: { rarity: "byte" } };

export const EveryGrade: Story = {
	render: () => (
		<div className="flex flex-col gap-1">
			{RARITY_ORDER.map((rarity) => (
				<span key={rarity} className="flex items-center gap-2">
					<RarityGlyph rarity={rarity} />
					<span className="font-mono text-xs text-zinc-400">{rarity}</span>
				</span>
			))}
		</div>
	),
};

export const NamesStayFlush: Story = {
	render: () => (
		<ul className="flex w-64 flex-col gap-1">
			{RARITY_ORDER.map((rarity) => (
				<li key={rarity} className="flex items-center gap-2">
					<RarityGlyph rarity={rarity} />
					<span className="font-mono text-xs text-zinc-200">package.json</span>
				</li>
			))}
		</ul>
	),
};

export const DexHeaderSize: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			{RARITY_ORDER.map((rarity) => (
				<RarityGlyph key={rarity} rarity={rarity} size="header" />
			))}
		</div>
	),
};

export const DimmedRow: Story = {
	render: () => (
		<div className="flex items-center gap-3 opacity-40">
			{RARITY_ORDER.map((rarity) => (
				<RarityGlyph key={rarity} rarity={rarity} />
			))}
		</div>
	),
};

import type { Meta, StoryObj } from "@storybook/react";

import { Glyph, type GlyphName } from "./Glyph.ui";

const meta: Meta<typeof Glyph> = {
	component: Glyph,
	title: "Modern/Glyph",
};
export default meta;

type Story = StoryObj<typeof Glyph>;

const SHOP: readonly GlyphName[] = [
	"rebuild",
	"extend",
	"tag",
	"suggest",
	"uninstall",
];

const AUDITS: readonly GlyphName[] = [
	"overrun",
	"outage",
	"readonly",
	"freeze",
	"mirror",
	"timeout",
	"flake",
	"leak",
	"rolling",
	"breaking",
	"strip",
];

const Sheet = ({ names }: { names: readonly GlyphName[] }) => (
	<div className="flex flex-wrap gap-4 text-zinc-300">
		{names.map((name) => (
			<span key={name} className="flex w-20 flex-col items-center gap-1">
				<Glyph name={name} />
				<span className="text-xxs text-zinc-500">{name}</span>
			</span>
		))}
	</div>
);

export const Shop: Story = { render: () => <Sheet names={SHOP} /> };

export const Audits: Story = { render: () => <Sheet names={AUDITS} /> };

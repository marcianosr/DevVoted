import type { Meta, StoryObj } from "@storybook/react";

import { Glyph } from "./Glyph.ui";

const meta: Meta<typeof Glyph> = {
	component: Glyph,
	title: "Modern/Glyph",
};
export default meta;

type Story = StoryObj<typeof Glyph>;

export const All: Story = {
	render: () => (
		<div className="flex gap-4 text-zinc-300">
			<Glyph name="rebuild" />
			<Glyph name="extend" />
			<Glyph name="tag" />
		</div>
	),
};

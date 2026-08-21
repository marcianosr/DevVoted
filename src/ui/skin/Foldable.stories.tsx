import type { Meta, StoryObj } from "@storybook/react";

import { Foldable, type FoldableItem } from "./Foldable.ui";

const meta: Meta<typeof Foldable> = {
	component: Foldable,
	title: "Skin/Foldable",
	decorators: [
		(Story) => (
			<div className="w-[22rem]">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Foldable>;

const configs: FoldableItem[] = [
	".ts",
	"Intellisense",
	"AGENTS.md",
	"ESLint",
	"IndexedDB",
	"Unit Tests",
	"Freemium",
].map((name) => ({ id: name, content: name }));

export const Default: Story = {
	args: {
		title: "Pipeline",
		subtitle: "4 firing · 1 offline · 3 billed",
		items: configs,
	},
};

export const Closed: Story = {
	args: { ...Default.args, defaultOpen: false },
};

/** Ordered where the sequence carries meaning — the panel looks identical. */
export const Ordered: Story = {
	args: { ...Default.args, as: "ol" },
};

export const WithoutSubtitle: Story = {
	args: { title: "Pipeline", items: configs },
};

import type { Meta, StoryObj } from "@storybook/react";

import { Foldable, type FoldableItem } from "./Foldable.ui";
import { Row } from "./Row.ui";

// Game-design reason: the pipeline is the run's one persistent readout. Folding
// it behind a single summary line is what lets a player check the whole run's
// state without scrolling past every config on the way.
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

// Bare rows: what the container looks like before an item variant is chosen.
const configs: FoldableItem[] = [
	".ts",
	"Intellisense",
	"AGENTS.md",
	"ESLint",
	"IndexedDB",
	"Unit Tests",
	"Freemium",
].map((name) => ({ id: name, content: <Row>{name}</Row> }));

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

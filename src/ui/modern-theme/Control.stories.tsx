import type { Meta, StoryObj } from "@storybook/react";

import { Control } from "./Control.ui";
import { PriceTag } from "./PriceTag.ui";
import { Text } from "./Text.ui";

// Game-design reason: extend and git tag change the shape of the run rather
// than its contents, so they have to read as terms being offered, not as two
// more things on the shelf.
const meta: Meta<typeof Control> = {
	component: Control,
	title: "Modern/Control",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="w-[34rem] p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Control>;

export const Extend: Story = {
	args: {
		icon: "extend",
		frame: "dashed",
		children: "a 6th offer, this shop and every shop after · 2 per run",
		action: (
			<PriceTag
				kb={48}
				on="a sixth offer"
				label="extend"
				state="ready"
				onUse={() => {}}
			/>
		),
	},
};

/** Folded by default. The terms are worth reading once, not every visit. */
export const GitTag: Story = {
	args: {
		icon: "tag",
		title: "git tag",
		note: "for your next run · one per run",
		footnote: "Price rises 64 KB per gate. Last sold at gate 10.",
		children: (
			<>
				If this run dies, the next one checks out at{" "}
				<Text size="meta" tone="theme">
					gate 4
				</Text>{" "}
				instead of gate 1, with a 128 KB stipend and the slots those clears
				would have granted.
			</>
		),
		action: <PriceTag kb={128} on="a git tag" label="buy" onUse={() => {}} />,
	},
};

/** Open, so the terms can be checked against the mock. */
export const GitTagOpen: Story = {
	args: { ...GitTag.args, defaultOpen: true },
};

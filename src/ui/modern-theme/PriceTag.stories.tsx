import type { Meta, StoryObj } from "@storybook/react";

import { PriceTag } from "./PriceTag.ui";

// Game-design reason: the shop's two-tap purchase is the one guard against
// misbuying, so the price and the confirm have to be the same object changing
// state rather than two controls in a row.
const meta: Meta<typeof PriceTag> = {
	component: PriceTag,
	title: "Modern/PriceTag",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="p-4">
				<Story />
			</div>
		),
	],
	args: { onUse: () => {} },
};
export default meta;

type Story = StoryObj<typeof PriceTag>;

export const Priced: Story = { args: { kb: 32, on: "Stylelint" } };

export const Free: Story = { args: { kb: 0, on: "Freemium" } };

export const Owned: Story = { args: { kb: 64, on: ".length", state: "owned" } };

export const Unaffordable: Story = {
	args: { kb: 512, on: "WTFPL", state: "unaffordable" },
};

/** Inside an open row, where the tag becomes the confirm. Click the summary to
 * watch it flip. */
export const InsideARow: Story = {
	render: (args) => (
		<details open className="group/entry w-96">
			<summary className="flex cursor-pointer list-none items-center justify-between gap-3">
				<span className="text-zinc-100">Deprecated</span>
				<PriceTag {...args} kb={128} on="Deprecated" />
			</summary>
			<p className="pt-2 text-xs text-zinc-500">Rare</p>
		</details>
	),
};

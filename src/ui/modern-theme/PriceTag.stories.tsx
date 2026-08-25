import type { Meta, StoryObj } from "@storybook/react";

import { PriceTag } from "./PriceTag.ui";

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

/** Short on storage: sell something, and the tag turns green. */
export const Unaffordable: Story = {
	args: { kb: 512, on: "WTFPL", state: "unaffordable" },
};

/** Affordable but homeless: the fix is a free slot, not more storage, so the
 * tag greys out instead of joining the red ones. */
export const Unavailable: Story = {
	args: { kb: 32, on: "Stylelint", state: "unavailable" },
};

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

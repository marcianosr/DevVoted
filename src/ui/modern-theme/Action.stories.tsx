import type { Meta, StoryObj } from "@storybook/react";

import { Action } from "./Action.ui";

// Game-design reason: a config you can spend storage on has to look different
// from one that just reports a number, or the player never learns it is theirs
// to press.
const meta: Meta<typeof Action> = {
	component: Action,
	title: "Modern/Action",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof Action>;

export const Priced: Story = {
	args: { label: "Use", cost: "16 KB", onUse: () => {} },
};

/** A shelf row where the config's name is already the verb. */
export const PriceOnly: Story = {
	args: { cost: "32 KB", on: "Stylelint", onUse: () => {} },
};

/** Nothing to charge, so nothing to quote. */
export const VerbOnly: Story = {
	args: { label: "deinstall", on: ".vue", onUse: () => {} },
};

/** The action the shelf wants taken. */
export const Loud: Story = {
	args: { label: "install", emphasis: "loud", onUse: () => {} },
};

/** The requirement is already met, so the ring says so before the tooltip does. */
export const Prismatic: Story = {
	args: { label: "Upgrade", emphasis: "prismatic", onUse: () => {} },
};

/** Taking a config back out of the build — the one action coloured throughout. */
export const Danger: Story = {
	args: { label: "deinstall", on: ".vue", emphasis: "danger", onUse: () => {} },
};

/** Nothing banked to pay with: the price stays readable but unpressable. */
export const Unaffordable: Story = {
	args: { label: "Use", cost: "16 KB", onUse: () => {}, disabled: true },
};

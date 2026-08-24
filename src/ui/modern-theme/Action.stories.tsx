import type { Meta, StoryObj } from "@storybook/react";

import { Action } from "./Action.ui";

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

export const PriceOnly: Story = {
	args: { cost: "32 KB", on: "Stylelint", onUse: () => {} },
};

export const VerbOnly: Story = {
	args: { label: "Uninstall", on: ".vue", onUse: () => {} },
};

export const Loud: Story = {
	args: { label: "install", emphasis: "loud", onUse: () => {} },
};

export const Prismatic: Story = {
	args: { label: "Upgrade", emphasis: "prismatic", onUse: () => {} },
};

export const Danger: Story = {
	args: { label: "Uninstall", on: ".vue", emphasis: "danger", onUse: () => {} },
};

export const Unaffordable: Story = {
	args: { label: "Use", cost: "16 KB", onUse: () => {}, disabled: true },
};

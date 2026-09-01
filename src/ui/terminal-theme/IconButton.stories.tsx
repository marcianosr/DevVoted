import type { Meta, StoryObj } from "@storybook/react";

import { IconButton } from "./IconButton.ui";

const noop = () => {};

const meta: Meta<typeof IconButton> = {
	component: IconButton,
	title: "Terminal/IconButton",
	decorators: [
		(Story) => (
			<div className="@container bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};
export default meta;
type Story = StoryObj<typeof IconButton>;

export const Upgrade: Story = {
	args: { icon: "↑", label: "upgrade", onUse: noop },
};

export const UpgradeArmed: Story = {
	args: { icon: "↑", label: "upgrade", armed: true, onUse: noop },
};

export const UpgradeLegendary: Story = {
	args: { icon: "↑", label: "upgrade", tone: "legendary", onUse: noop },
};

export const Remove: Story = {
	args: { icon: "✕", label: "remove", tone: "cinnabar", onUse: noop },
};

export const RemoveArmed: Story = {
	args: {
		icon: "✕",
		label: "remove",
		tone: "cinnabar",
		armed: true,
		onUse: noop,
	},
};

export const Use: Story = {
	args: { icon: "⚡", label: "use", tone: "cerulean", onUse: noop },
};

export const HintOnHover: Story = {
	args: {
		icon: "↑",
		label: "Upgrade",
		hint: "Upgrade for 64 KB",
		tone: "legendary",
		onUse: noop,
	},
};

export const IconOnlyUnderTheFold: Story = {
	args: { icon: "↑", label: "upgrade", onUse: noop },
	decorators: [
		(Story) => (
			<div className="@container w-[390px] bg-zinc-900 p-4">
				<Story />
			</div>
		),
	],
};

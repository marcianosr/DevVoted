import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover.component";

const meta: Meta<typeof Popover> = {
	component: Popover,
	title: "UI/Popover",
};
export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	args: {
		ariaLabel: "Show info",
		content: <p>Banjo-Kazooie is a platformer developed by Rare.</p>,
		children: <span>ℹ️</span>,
	},
};

export const WithLongContent: Story = {
	args: {
		ariaLabel: "Show storage info",
		content: (
			<div>
				<p>Storage is used to install configs.</p>
				<p>Each config uses a different amount of storage.</p>
			</div>
		),
		children: <span>💾</span>,
	},
};

// Wraps a disabled button: the span trigger reveals why the action is unavailable
// on hover (desktop) or tap (mobile), where the disabled button itself is inert.
export const WrappingDisabledButton: Story = {
	args: {
		triggerAs: "span",
		ariaLabel: 'Why "Start the climb" is unavailable',
		content: <p className="max-w-xs text-sm">Slot a config to start</p>,
		children: (
			<button type="button" disabled className="px-4 py-2 opacity-40">
				Start the climb →
			</button>
		),
	},
};

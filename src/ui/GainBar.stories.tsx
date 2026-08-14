import type { Meta, StoryObj } from "@storybook/react";

import { GainBar } from "./GainBar.ui";

// Game-design reason: wins and unlock progress read as a length of bar, not
// just a number — the gate payout toward the 512KB cap, a locked slot's
// coverage toward its gate.
const meta: Meta<typeof GainBar> = {
	component: GainBar,
	title: "UI/Runs/GainBar",
	decorators: [
		(Story) => (
			<div className="w-56">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GainBar>;

export const StoragePayout: Story = {
	args: { from: 104, to: 208, cap: 512, label: "storage" },
};

export const SlotUnlockProgress: Story = {
	args: { from: 0, to: 6.5, cap: 11, label: "coverage toward slot 4" },
};

export const NearTheCap: Story = {
	args: { from: 420, to: 512, cap: 512, label: "storage" },
};

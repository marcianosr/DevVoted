import type { Meta, StoryObj } from "@storybook/react";

import { gateLadderRungs } from "~/modules/run/pipeline/swatch.model";
import { VICTORY_GATE } from "~/modules/run/rules.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";

const meta: Meta<typeof GateSegmentBar> = {
	component: GateSegmentBar,
	title: "Run/GateSegmentBar",
	args: { rungs: gateLadderRungs(VICTORY_GATE) },
	decorators: [
		(Story) => (
			<div className="flex w-72">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateSegmentBar>;

// A fresh run: Pallet held, Boulder already part-paid. Hover a pip for its swatch.
export const FreshRun: Story = {
	args: { gatesCleared: 0, coverage: 1.5, label: "gate 1 of 12" },
};

// Mid-climb: the gym badges you hold read solid, the rest wait dimmed.
export const MidClimb: Story = {
	args: { gatesCleared: 4, coverage: 60, label: "gate 5 of 12" },
};

// Coverage has run ahead of the ladder — several rungs are ready to unlock.
export const UnlockReady: Story = {
	args: { gatesCleared: 5, coverage: 150, label: "gate 6 of 12" },
};

// The summit: every swatch collected, the Elite Four's gradient included.
export const Summited: Story = {
	args: { gatesCleared: VICTORY_GATE, coverage: 420, label: "gate 12 of 12" },
};

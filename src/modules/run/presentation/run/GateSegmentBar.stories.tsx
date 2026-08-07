import type { Meta, StoryObj } from "@storybook/react";

import { ALL_SWATCHES } from "~/modules/run/gate/swatch.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/rules.model";
import { GateSegmentBar } from "./GateSegmentBar.ui";

const meta: Meta<typeof GateSegmentBar> = {
	component: GateSegmentBar,
	title: "Run/GateSegmentBar",
	args: { swatches: ALL_SWATCHES, pollsPerGate: 5 },
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

// A fresh run: nothing earned yet, gate 0 two polls in. Hover a pip for its badge.
export const FreshRun: Story = {
	args: { gatesCleared: 0, pollsAnswered: 2, label: "gate 0 of 12" },
};

// Mid-climb: the badges you hold read solid, the rest wait dimmed.
export const MidClimb: Story = {
	args: { gatesCleared: 4, pollsAnswered: 3, label: "gate 4 of 12" },
};

// The last two gates: the Elite plate underway (so it carries the rim), then the
// Champion's gradient waiting above it.
export const AtTheSummitPair: Story = {
	args: {
		gatesCleared: VICTORY_GATE - 1,
		pollsAnswered: 4,
		label: "gate 11 of 12",
	},
};

// Summited: all thirteen badges collected.
export const Summited: Story = {
	args: { gatesCleared: GATE_COUNT, pollsAnswered: 0, label: "gate 12 of 12" },
};

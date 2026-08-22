import type { Meta, StoryObj } from "@storybook/react";

import { SwatchTrack, type SwatchTrackItem } from "./SwatchTrack.ui";

// Game-design reason: the track is the only place a run's whole shape is visible
// at once — how far up you are, and how much ladder is left to lose.
const meta: Meta<typeof SwatchTrack> = {
	component: SwatchTrack,
	title: "Modern/SwatchTrack",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender" className="p-4">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof SwatchTrack>;

// Tracks GATE_SWATCHES in swatch.model.ts: gates count from 0, so Pallet is
// gate 0 and Champion is gate 12.
const LADDER = [
	"pallet",
	"boulder",
	"cascade",
	"thunder",
	"lavender",
	"rainbow",
	"soul",
	"marsh",
	"seafoam",
	"volcano",
	"earth",
	"elite",
	"champion",
] as const;

export const ladderAt = (current: number): SwatchTrackItem[] =>
	LADDER.map((theme, gate) => {
		if (gate < current) return { gate, state: "earned", theme };
		if (gate === current) return { gate, state: "current", theme };
		return { gate, state: "locked" };
	});

export const MidRun: Story = { args: { items: ladderAt(4) } };

export const FirstGate: Story = { args: { items: ladderAt(0) } };

export const Champion: Story = { args: { items: ladderAt(12) } };

// No current square: the run is over, so the label counts what was banked
// rather than naming a gate you are no longer standing on.
export const RunOver: Story = {
	args: {
		items: LADDER.map((theme, gate) =>
			gate < 5 ? { gate, state: "earned", theme } : { gate, state: "locked" }
		),
	},
};

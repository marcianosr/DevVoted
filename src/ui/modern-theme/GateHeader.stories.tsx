import type { Meta, StoryObj } from "@storybook/react";

import { GateHeader } from "./GateHeader.ui";
import type { SwatchTrackItem } from "./SwatchTrack.ui";

// Game-design reason: the header is the run's identity strip — which gate is
// being played, what condition it runs under, and how far up the ladder you are.
const meta: Meta<typeof GateHeader> = {
	component: GateHeader,
	title: "Modern/GateHeader",
	decorators: [
		(Story) => (
			<div data-gate-theme="lavender">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateHeader>;

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

const ladderAt = (current: number): SwatchTrackItem[] =>
	LADDER.map((theme, gate) => {
		if (gate < current) return { gate, state: "earned", theme };
		if (gate === current) return { gate, state: "current", theme };
		return { gate, state: "locked" };
	});

export const MidRun: Story = {
	args: {
		title: "Gate 4 · Lavender",
		audit: "1 audit · Dependency Outage",
		storage: { plan: "Free tier", used: 184, cap: 512 },
		track: ladderAt(4),
	},
};

export const NoAudit: Story = {
	args: {
		title: "Gate 4 · Lavender",
		track: ladderAt(4),
	},
};

export const FirstGate: Story = {
	args: {
		title: "Gate 0 · Pallet",
		track: ladderAt(0),
	},
};

export const TitleOnly: Story = { args: { title: "Gate 4 · Lavender" } };

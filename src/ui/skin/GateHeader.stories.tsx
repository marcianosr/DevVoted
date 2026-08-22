import type { Meta, StoryObj } from "@storybook/react";

import { GateHeader } from "./GateHeader.ui";
import type { SwatchTrackItem } from "./SwatchTrack.ui";

// Game-design reason: this bar is the run's standing in one glance — which gate
// you are in, what it demands, how hot the streak is, and how much of the ladder
// is behind you. Every square is also the only place a player can read what a
// swatch they have not earned yet would cost them.
const LADDER = [
	{ gate: 1, name: "Pallet Swatch", theme: "pallet", coverage: 10 },
	{ gate: 2, name: "Cascade Swatch", theme: "cascade", coverage: 25 },
	{ gate: 3, name: "Boulder Swatch", theme: "boulder", coverage: 35 },
	{ gate: 4, name: "Lavender Swatch", theme: "lavender", coverage: 50 },
	{ gate: 5, name: "Thunder Swatch", theme: "thunder", coverage: 55 },
	{ gate: 6, name: "Rainbow Swatch", theme: "rainbow", coverage: 60 },
	{ gate: 7, name: "Volcano Swatch", theme: "volcano", coverage: 75 },
	{ gate: 8, name: "Soul Swatch", theme: "soul", coverage: 80 },
	{ gate: 9, name: "Marsh Swatch", theme: "marsh", coverage: 85 },
	{ gate: 10, name: "Earth Swatch", theme: "earth", coverage: 90 },
	{ gate: 11, name: "Seafoam Swatch", theme: "seafoam", coverage: 92 },
	{ gate: 12, name: "Elite Swatch", theme: "elite", coverage: 95 },
	{ gate: 13, name: "Champion Swatch", theme: "champion", coverage: 98 },
];

const ladderUpTo = (cleared: number): readonly SwatchTrackItem[] =>
	LADDER.map((rung) => ({
		id: rung.theme,
		theme: rung.theme,
		gate: `gate ${rung.gate}`,
		name: rung.name,
		state:
			rung.gate <= cleared
				? "earned"
				: rung.gate === cleared + 1
					? "current"
					: "locked",
		earn:
			rung.gate <= cleared
				? `Earned by clearing gate ${rung.gate}`
				: `Clear gate ${rung.gate} to earn it`,
		requirement: `Needs ${rung.coverage}% coverage in its window`,
	}));

const meta: Meta<typeof GateHeader> = {
	component: GateHeader,
	title: "Skin/GateHeader",
	args: {
		title: "Gate 4 · Lavender",
		detail: "60% required · 1 audit · out of Rock Tunnel",
		streak: { multiplier: 3, lit: 3, total: 4 },
		gates: ladderUpTo(3),
		count: "4 of 13",
	},
	decorators: [
		(Story) => (
			// Screen.ui sets this in the app; the rail, badge, streak and current
			// square all read it. Extra height so a hovered square has room to open.
			<div data-gate-theme="lavender" className="min-h-96 bg-zinc-950 p-8">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateHeader>;

/** Hover any square to read what it is and what earning it costs. */
export const Lavender: Story = {};

/** The same header three gates later — every colour follows the gate. */
export const Volcano: Story = {
	args: {
		title: "Gate 7 · Volcano",
		detail: "75% required · 2 audits · out of Cinnabar Island",
		streak: { multiplier: 5, lit: 1, total: 4 },
		gates: ladderUpTo(6),
		count: "7 of 13",
	},
	decorators: [
		(Story) => (
			<div data-gate-theme="volcano" className="min-h-96 bg-zinc-950 p-8">
				<Story />
			</div>
		),
	],
};

/** Opening gate: nothing earned, no streak yet, the whole ladder still locked. */
export const FirstGate: Story = {
	args: {
		title: "Gate 1 · Pallet",
		detail: "40% required · no audits · out of Route 1",
		streak: undefined,
		gates: ladderUpTo(0),
		count: "1 of 13",
	},
	decorators: [
		(Story) => (
			<div data-gate-theme="pallet" className="min-h-96 bg-zinc-950 p-8">
				<Story />
			</div>
		),
	],
};

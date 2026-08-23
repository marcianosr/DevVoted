import type { Meta, StoryObj } from "@storybook/react";

import { GatesPanel, type DexGate, type DexGateState } from "./GatesPanel.ui";

const meta: Meta<typeof GatesPanel> = {
	component: GatesPanel,
	title: "Modern/Screens/GatesPanel",
	// Storybook reads every named export as a story; gatesClearedTo is a helper
	// other story files import, not something to render.
	excludeStories: ["gatesClearedTo"],
	parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof GatesPanel>;

/** Transcribed from the game, not invented: coverage is COVERAGE_DEMANDS, peels is
 * GATE_FAIL_STRIPS plus the Strip audits at 11 and 12, audits is GATE_AUDITS, and
 * the unlocks are wiki §2.8 plus PIN_FROM_GATE (which that table omits). */
type GateFacts = Omit<DexGate, "state">;

const LADDER: readonly GateFacts[] = [
	{
		number: 0,
		name: "Pallet",
		theme: "pallet",
		coverage: 3,
		peels: 1,
		audits: [],
		unlocks: ["shop", "rebuild", "640 KB plan"],
	},
	{
		number: 1,
		name: "Boulder",
		theme: "boulder",
		coverage: 10,
		peels: 1,
		audits: [],
		unlocks: ["slot 4"],
	},
	{
		number: 2,
		name: "Cascade",
		theme: "cascade",
		coverage: 25,
		peels: 1,
		audits: [],
		unlocks: ["lock", "slot 5", "768 KB plan"],
	},
	{
		number: 3,
		name: "Thunder",
		theme: "thunder",
		coverage: 40,
		peels: 2,
		audits: ["Cost Overrun"],
		unlocks: ["extend", "slot 6"],
	},
	{
		number: 4,
		name: "Lavender",
		theme: "lavender",
		coverage: 60,
		peels: 2,
		audits: ["Dependency Outage"],
		unlocks: ["git tag", "slot 7", "1 MB plan"],
	},
	{
		number: 5,
		name: "Rainbow",
		theme: "rainbow",
		coverage: 85,
		peels: 2,
		audits: ["Read-only"],
		unlocks: ["slot 8"],
	},
	{
		number: 6,
		name: "Soul",
		theme: "soul",
		coverage: 110,
		peels: 2,
		audits: ["Feature Freeze"],
		unlocks: ["slot 9", "1.5 MB plan"],
	},
	{
		number: 7,
		name: "Marsh",
		theme: "marsh",
		coverage: 140,
		peels: 3,
		audits: ["Mirror"],
		unlocks: ["slot 10"],
	},
	{
		number: 8,
		name: "Seafoam",
		theme: "seafoam",
		coverage: 175,
		peels: 3,
		audits: ["Timeout", "Flaky Build"],
		unlocks: ["slot 11", "2 MB plan"],
	},
	{
		number: 9,
		name: "Volcano",
		theme: "volcano",
		coverage: 210,
		peels: 3,
		audits: ["Memory Leak", "Rolling Outage"],
		unlocks: ["slot 12"],
	},
	{
		number: 10,
		name: "Earth",
		theme: "earth",
		coverage: 250,
		peels: 3,
		audits: ["Breaking Change", "Timeout"],
		unlocks: ["slot 13", "3 MB plan"],
	},
	{
		number: 11,
		name: "Elite",
		theme: "elite",
		coverage: 290,
		peels: 5,
		peelsAudited: true,
		audits: ["Strip", "Mirror", "Flaky Build"],
		unlocks: ["slot 14"],
	},
	{
		number: 12,
		name: "Champion",
		theme: "champion",
		finish: "fill",
		coverage: 340,
		peels: 6,
		peelsAudited: true,
		audits: ["Memory Leak", "Strip", "Timeout"],
		unlocks: [],
		wins: true,
	},
];

/** One cleared count drives all thirteen states, so no story can draw a ladder
 * with a gap in it. */
export const gatesClearedTo = (cleared: number): readonly DexGate[] =>
	LADDER.map((gate) => {
		const state: DexGateState = (() => {
			if (gate.number < cleared) return "cleared";
			return gate.number === cleared ? "next" : "locked";
		})();

		return { ...gate, state };
	});

export const Fresh: Story = { args: { gates: gatesClearedTo(0) } };

export const Midway: Story = { args: { gates: gatesClearedTo(1) } };

export const Summit: Story = { args: { gates: gatesClearedTo(12) } };

export const Cleared: Story = { args: { gates: gatesClearedTo(13) } };

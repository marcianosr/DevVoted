import type { Meta, StoryObj } from "@storybook/react";

import { BandOutcomes, type BandOutcome } from "./BandOutcomes.ui";
import { Screen } from "./Screen.ui";

const TITLE = "Where you finish decides everything";

const SEAFOAM: readonly BandOutcome[] = [
	{
		band: "perfect",
		range: "100%",
		outcome:
			"The bar is full. The Seafoam swatch is yours and gate 9 opens tomorrow. The gate pays a bonus on top.",
		pays: "1305 KB",
	},
	{
		band: "healthy",
		range: "75 – 99%",
		outcome:
			"Gate cleared. The Seafoam swatch is yours and gate 9 opens tomorrow.",
		pays: "653 KB – 870 KB",
	},
	{
		band: "ok",
		range: "60 – 74%",
		outcome:
			"You survive and get paid, but the gate stays shut. Seafoam runs again on five fresh polls.",
		pays: "522 KB – 644 KB",
	},
	{
		band: "shaky",
		range: "50 – 59%",
		outcome:
			"Still alive, barely. Same gate again, on a broken streak and a thin balance.",
		pays: "435 KB – 513 KB",
	},
	{
		band: "danger",
		range: "under 50%",
		outcome: "The run ends the moment the gate shuts. No retry, no peel.",
		pays: "Nothing",
	},
];

const PALLET: readonly BandOutcome[] = [
	{
		band: "perfect",
		range: "100%",
		outcome:
			"The bar is full. The Pallet swatch is yours and gate 1 opens tomorrow. The gate pays a bonus on top.",
		pays: "288 KB",
	},
	{
		band: "healthy",
		range: "5 – 99%",
		outcome:
			"Gate cleared. The Pallet swatch is yours and gate 1 opens tomorrow.",
		pays: "128 KB – 192 KB",
	},
	{
		band: "ok",
		range: "0 – 4%",
		outcome:
			"You survive and get paid, but the gate stays shut. Pallet runs again on five fresh polls.",
		pays: "0 KB – 102 KB",
	},
];

const meta: Meta<typeof BandOutcomes> = {
	component: BandOutcomes,
	title: "Kanto/BandOutcomes",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="seafoam" width="wide">
			<BandOutcomes {...args} />
		</Screen>
	),
	args: { title: TITLE, outcomes: SEAFOAM },
};
export default meta;

type Story = StoryObj<typeof BandOutcomes>;

export const AtAMidGate: Story = {};

export const NoFloorToFallThrough: Story = {
	args: { title: TITLE, outcomes: PALLET },
};

export const StackedInAColumn: Story = {
	args: { title: TITLE, outcomes: SEAFOAM, layout: "stacked" },
	render: (args) => (
		<Screen theme="seafoam" width="wide">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div />
				<BandOutcomes {...args} />
			</div>
		</Screen>
	),
};

export const OverItsOwnLadder: Story = {
	args: {
		title: TITLE,
		outcomes: SEAFOAM,
		bar: {
			held: 0,
			floor: 50,
			ok: 60,
			healthy: 75,
			note: "four correct polls reaches the line",
		},
	},
};

export const LongestOutcome: Story = {
	args: {
		title: TITLE,
		outcomes: SEAFOAM.map((outcome) =>
			outcome.band === "shaky"
				? {
						...outcome,
						outcome:
							"Still alive, barely. The same gate runs again tomorrow on five fresh polls, your streak is back to nothing, and the balance will not cover a second slip.",
					}
				: outcome
		),
	},
};

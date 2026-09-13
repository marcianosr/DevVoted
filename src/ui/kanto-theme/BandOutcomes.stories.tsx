import type { Meta, StoryObj } from "@storybook/react";

import {
	BandOutcomes,
	type BandOutcome,
	type LeadPart,
} from "./BandOutcomes.ui";
import { Screen } from "./Screen.ui";

const TITLE = "Objectives and rewards";
const NOTE =
	"Pays land in the run balance when the gate shuts. A peel is paid in KB or in configs.";

const LEAD: readonly LeadPart[] = [
	"Clear at ",
	{ band: "ok" },
	" or better and earn the rewards shown below across a window of ",
	{ figure: "5" },
	" polls.",
];

const SEAFOAM: readonly BandOutcome[] = [
	{ band: "perfect", range: "100%", pays: "+1305 KB" },
	{ band: "healthy", range: "75 – 99%", pays: "+870 KB" },
	{ band: "ok", range: "60 – 74%", pays: "+522 KB" },
	{ band: "shaky", range: "50 – 59%", pays: "−192 KB peel" },
	{ band: "danger", range: "under 50%", pays: "the run ends" },
];

const PALLET: readonly BandOutcome[] = [
	{ band: "perfect", range: "100%", pays: "+288 KB" },
	{ band: "healthy", range: "5 – 99%", pays: "+128 KB" },
	{ band: "ok", range: "0 – 4%", pays: "+32 KB" },
];

const meta: Meta<typeof BandOutcomes> = {
	component: BandOutcomes,
	title: "Kanto/BandOutcomes",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="seafoam">
			<BandOutcomes {...args} />
		</Screen>
	),
	args: {
		title: TITLE,
		outcomes: SEAFOAM,
		lead: LEAD,
		note: NOTE,
	},
};
export default meta;

type Story = StoryObj<typeof BandOutcomes>;

export const AtAMidGate: Story = {};

export const NoFloorToFallThrough: Story = {
	args: { outcomes: PALLET, lead: LEAD },
};

export const BareTable: Story = {
	args: { lead: undefined, note: undefined },
};

export const InHalfAScreen: Story = {
	render: (args) => (
		<Screen theme="seafoam">
			<div className="grid w-full gap-8 md:grid-cols-2">
				<div className="flex w-full min-w-0 flex-col gap-6">
					<BandOutcomes {...args} />
				</div>
				<div />
			</div>
		</Screen>
	),
};

export const OverItsOwnLadder: Story = {
	args: {
		bar: {
			held: 0,
			floor: 50,
			ok: 60,
			healthy: 75,
			marks: "boundaries",
			note: "four correct polls reaches the line",
		},
	},
};

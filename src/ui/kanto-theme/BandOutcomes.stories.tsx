import { gateSwatchAt } from "~/test/swatchTrack.factory";

import type { Meta, StoryObj } from "@storybook/react";

import { BandOutcomes, type BandOutcome } from "./BandOutcomes.ui";
import type { ObjectivesProps } from "./Objectives.ui";
import type { PollScoresProps } from "./PollScores.ui";
import { Screen } from "./Screen.ui";

const SEAFOAM_GATE = 8;

const TITLE = "At stake";
const NOTE =
	"Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs.";
const FREE_MISS_NOTE =
	"Paid when the gate shuts. Miss it and you owe nothing: the same gate runs again on 5 fresh polls.";

const OBJECTIVES: ObjectivesProps = {
	objectives: [
		{
			statement: ["Finish at ", { band: "ok" }, " or better"],
			earns: [
				"earns ",
				{ figure: "advance to Volcano" },
				{ figure: "+522 KB", band: "ok" },
				" or more",
			],
		},
		{
			statement: ["Answer all 5 right"],
			earns: [
				"earns ",
				{ swatch: gateSwatchAt(SEAFOAM_GATE), label: "Seafoam swatch" },
			],
		},
	],
};

const SCORES: PollScoresProps = {
	rows: [
		{ swatch: gateSwatchAt(SEAFOAM_GATE), correct: 3, polls: 5, current: true },
	],
};

const SEAFOAM: readonly BandOutcome[] = [
	{ band: "perfect", range: "100%", pays: "+1305 KB" },
	{ band: "healthy", range: "75 – 99%", pays: "+870 KB" },
	{ band: "ok", range: "60 – 74%", pays: "+522 KB" },
	{ band: "shaky", range: "50 – 59%", pays: "−192 KB peel" },
	{ band: "danger", range: "under 50%", pays: "the run ends" },
];

const PALLET: readonly BandOutcome[] = [
	{ band: "perfect", range: "100%", pays: "+32 KB" },
	{ band: "healthy", range: "60 – 99%", pays: "+19 KB" },
	{ band: "ok", range: "40 – 59%", pays: "+13 KB" },
	{ band: "shaky", range: "0 – 39%", pays: "no peel" },
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
		objectives: OBJECTIVES,
		scores: SCORES,
		note: NOTE,
		standing: "ok",
	},
};
export default meta;

type Story = StoryObj<typeof BandOutcomes>;

export const StandingInOk: Story = {};

export const StandingUnderTheFloor: Story = {
	args: { standing: "danger" },
};

export const NoFloorToFallThrough: Story = {
	args: {
		outcomes: PALLET,
		note: FREE_MISS_NOTE,
		standing: "ok",
	},
};

export const BareTable: Story = {
	args: {
		objectives: undefined,
		scores: undefined,
		note: undefined,
		standing: undefined,
	},
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

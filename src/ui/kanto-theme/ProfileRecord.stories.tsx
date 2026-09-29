import type { Meta, StoryObj } from "@storybook/react";

import { trackFor } from "~/test/swatchTrack.factory";

import { ProfileRecord } from "./ProfileRecord.ui";

const meta: Meta<typeof ProfileRecord> = {
	component: ProfileRecord,
	title: "Kanto/Profile/ProfileRecord",
	parameters: { controls: { disable: true } },
};

export default meta;

type Story = StoryObj<typeof ProfileRecord>;

const NOTE =
	"Where they have been, and the gates they took without a wrong answer.";

export const AgainstYou: Story = {
	args: {
		figures: [
			{ label: "deepest gate", figure: "9 of 13", yours: "you 6 of 13" },
			{ label: "swatches", figure: "5 of 13", yours: "you 3 of 13" },
			{ label: "runs finished", figure: "24" },
		],
		swatches: trackFor([0, 1, 2, 3, 5]),
		seats: [
			{ category: "CSS", figure: "21 in a row" },
			{ category: "General Frontend", figure: "16 in a row" },
		],
		meta: "reached gate 9",
		note: NOTE,
	},
};

export const NoViewerToCompare: Story = {
	args: {
		figures: [
			{ label: "deepest gate", figure: "9 of 13" },
			{ label: "swatches", figure: "5 of 13" },
			{ label: "runs finished", figure: "24" },
		],
		swatches: trackFor([0, 1, 2, 3, 5]),
		seats: [{ category: "CSS", figure: "21 in a row" }],
		meta: "reached gate 9",
		note: NOTE,
	},
};

export const NothingYet: Story = {
	args: {
		figures: [
			{ label: "deepest gate", figure: "0 of 13", yours: "you 6 of 13" },
			{ label: "swatches", figure: "0 of 13", yours: "you 3 of 13" },
			{ label: "runs finished", figure: "0" },
		],
		swatches: trackFor([]),
		seats: [],
		meta: "reached gate 0",
		note: NOTE,
	},
};

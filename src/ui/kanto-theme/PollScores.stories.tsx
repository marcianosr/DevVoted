import type { Meta, StoryObj } from "@storybook/react";

import { pollPayoutRows, pollScoreRows } from "~/test/swatchTrack.factory";

import { PollScores } from "./PollScores.ui";
import { Screen } from "./Screen.ui";

const RUN = [3, 2, 3, 2, 3, 2, 3, 2, 0];

const meta: Meta<typeof PollScores> = {
	component: PollScores,
	title: "Kanto/PollScores",
	parameters: { controls: { disable: true } },
	render: (args) => (
		<Screen theme="viridian" width="narrow">
			<PollScores {...args} />
		</Screen>
	),
	args: { rows: pollScoreRows(RUN) },
};
export default meta;

type Story = StoryObj<typeof PollScores>;

export const MidRun: Story = {};

export const OpeningGate: Story = { args: { rows: pollScoreRows([0]) } };

export const PartWayThroughTheGate: Story = {
	args: { rows: pollScoreRows([5, 4, 2]) },
};

export const EveryGatePerfect: Story = {
	args: { rows: pollScoreRows([5, 5, 5, 5, 5]) },
};

export const WhatEachPollPaid: Story = {
	args: {
		rows: pollPayoutRows([
			[1, 2, 0, 0, 1],
			[1, 0.5, 0, 1.5, 0],
			[undefined, undefined, undefined, undefined, undefined],
		]),
	},
};

export const PaidPartWayThroughTheGate: Story = {
	args: {
		rows: pollPayoutRows([
			[1, 2, 0, 0, 1],
			[2, 1.5, undefined, undefined, undefined],
		]),
	},
};

export const PaidWithABuildBehindIt: Story = {
	args: {
		rows: pollPayoutRows([
			[1.3, 2.6, 0, 0, 1.3],
			[2.6, 0.65, 0, undefined, undefined],
		]),
	},
};

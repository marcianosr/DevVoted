import type { Meta, StoryObj } from "@storybook/react";

import { pollScoreRows } from "~/test/swatchTrack.factory";

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

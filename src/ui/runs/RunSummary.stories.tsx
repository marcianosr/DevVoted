import type { Meta, StoryObj } from "@storybook/react";

import { RunSummary } from "./RunSummary.ui";

const meta: Meta<typeof RunSummary> = {
	component: RunSummary,
	title: "Runs/RunSummary",
	decorators: [
		(Story) => (
			<div className="max-w-4xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof RunSummary>;

export const Default: Story = {
	args: {
		data: {
			pollsAnswered: 5,
			pollsCorrect: 3,
			totalCoverage: 0.5,
			bestStreak: 1,
			gatesCleared: 0,
			pipelinesFought: 3,
			shopRebuilds: 0,
			archivedCredit: 0,
		},
	},
};

export const DeepRun: Story = {
	args: {
		data: {
			pollsAnswered: 42,
			pollsCorrect: 35,
			totalCoverage: 128.4,
			bestStreak: 9,
			gatesCleared: 8,
			pipelinesFought: 5,
			shopRebuilds: 6,
			archivedCredit: 320_000,
		},
	},
};

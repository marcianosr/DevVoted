import type { Meta, StoryObj } from "@storybook/react";

import { CurrentPipeline } from "./CurrentPipeline.ui";
import type { PipelineCheckRow } from "./CurrentPipeline.ui";

const meta: Meta<typeof CurrentPipeline> = {
	component: CurrentPipeline,
	title: "Runs/CurrentPipeline",
	decorators: [
		(Story) => (
			<div data-category-theme="html" className="max-w-2xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof CurrentPipeline>;

const shortWindow: PipelineCheckRow = {
	label: "Short window pipeline",
	difficultyClassName: "text-blue-400 border-blue-400",
	difficulty: "low",
	requirement: "5 polls",
	reward: 60_000,
	status: "in-progress",
	progress: {
		previous: 1,
		current: 4,
		target: 5,
		suffix: "answered",
		seen: true,
	},
};

const coverageGain: PipelineCheckRow = {
	label: "Coverage gain pipeline",
	difficultyClassName: "text-blue-400 border-blue-400",
	difficulty: "low",
	requirement: "Gain 3% coverage",
	reward: 60_000,
	status: "in-progress",
	progress: { previous: 0, current: 0.7, target: 3, suffix: "%", seen: true },
};

export const InProgress: Story = {
	args: {
		gate: 1,
		pollsLeft: 4,
		totalReward: 120_000,
		rows: [shortWindow, coverageGain],
	},
};

export const Graded: Story = {
	args: {
		showGroupHeaders: true,
		clearedReward: 120_000,
		rows: [
			{ ...shortWindow, status: "passed", progress: undefined },
			{
				...coverageGain,
				status: "failed",
				progress: undefined,
				difficulty: "high",
				difficultyClassName: "text-orange-400 border-orange-400",
			},
		],
	},
};

export const CheckCanNoLongerPass: Story = {
	args: {
		gate: 1,
		pollsLeft: 2,
		totalReward: 300_000,
		rows: [
			shortWindow,
			{
				label: "Cold start pipeline",
				difficultyClassName: "text-orange-400 border-orange-400",
				difficulty: "high",
				requirement: "First poll must be correct",
				reward: 240_000,
				status: "failed",
				warning: "This pipeline can no longer pass this gate",
			},
		],
	},
};

export const NoProgressYet: Story = {
	args: {
		gate: 1,
		pollsLeft: 5,
		totalReward: 60_000,
		rows: [{ ...shortWindow, progress: undefined }],
	},
};

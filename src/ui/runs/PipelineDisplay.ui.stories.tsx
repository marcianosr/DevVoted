import type { Meta, StoryObj } from "@storybook/react";
import { PipelineDisplay } from "./PipelineDisplay.ui";

const meta: Meta<typeof PipelineDisplay> = {
	component: PipelineDisplay,
	title: "Runs/Organisms/Pipeline Display",
	decorators: [
		(Story) => (
			<div className="max-w-lg">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PipelineDisplay>;

const inProgressSlots = [
	{
		id: "coverage-1",
		status: "in-progress" as const,
		label: "Coverage Gain",
		difficulty: "medium" as const,
		requirement: "Gain 2% in 5 polls",
		reward: "+64 KB",
	},
	{
		id: "correct-1",
		status: "in-progress" as const,
		label: "Correct Answers",
		difficulty: "low" as const,
		requirement: "Answer 3 of 5 correctly",
		reward: "+32 KB",
	},
];

export const InProgress: Story = {
	args: {
		slots: inProgressSlots,
		pollsRemaining: 3,
	},
};

export const EvaluatedPassed: Story = {
	args: {
		slots: [
			{ ...inProgressSlots[0], status: "passed" },
			{ ...inProgressSlots[1], status: "passed" },
		],
		evaluation: { passed: true, totalReward: "+96 KB" },
	},
};

export const EvaluatedFailed: Story = {
	args: {
		slots: [
			{ ...inProgressSlots[0], status: "passed" },
			{
				id: "short-1",
				status: "failed" as const,
				label: "Short Window",
				difficulty: "high" as const,
				requirement: "All 3 polls correct",
				reward: "+128 KB",
			},
		],
		evaluation: { passed: false, totalReward: "+0 KB" },
	},
};

export const AllDifficulties: Story = {
	args: {
		slots: [
			{
				id: "s1",
				status: "passed" as const,
				label: "Coverage Gain",
				difficulty: "low" as const,
				requirement: "Gain 1% in 5 polls",
				reward: "+32 KB",
			},
			{
				id: "s2",
				status: "in-progress" as const,
				label: "Correct Answers",
				difficulty: "medium" as const,
				requirement: "3 of 5 correct",
				reward: "+64 KB",
			},
			{
				id: "s3",
				status: "failed" as const,
				label: "Short Window",
				difficulty: "high" as const,
				requirement: "All 3 correct",
				reward: "+128 KB",
			},
			{
				id: "s4",
				status: "skipped" as const,
				label: "Category Mastery",
				difficulty: "critical" as const,
				requirement: "All JS polls correct",
				reward: "+256 KB",
			},
		],
		evaluation: { passed: false, totalReward: "+0 KB" },
	},
};

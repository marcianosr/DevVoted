import type { Meta, StoryObj } from "@storybook/react";

import { PipelineFailureScreen } from "./PipelineFailureScreen.ui";

const meta: Meta<typeof PipelineFailureScreen> = {
	component: PipelineFailureScreen,
	title: "Runs/PipelineFailureScreen",
	args: {
		pipelineSlot: (
			<div className="border border-zinc-700 p-4">CI Pipelines layout</div>
		),
		runSummary: {
			pollsAnswered: 18,
			pollsCorrect: 13,
			totalCoverage: 42,
			bestStreak: 5,
			shopRebuilds: 3,
		},
		categoryCoverage: [
			{
				categoryCode: "js",
				categoryName: "JavaScript",
				coverage: 44,
				bestStreak: 5,
				pollsCorrect: 6,
				pollsAnswered: 8,
			},
			{
				categoryCode: "css",
				categoryName: "CSS",
				coverage: 30,
				bestStreak: 3,
				pollsCorrect: 4,
				pollsAnswered: 6,
			},
			{
				categoryCode: "java",
				categoryName: "Java",
				coverage: 12,
				bestStreak: 1,
				pollsCorrect: 3,
				pollsAnswered: 4,
			},
		],
	},
};
export default meta;

type Story = StoryObj<typeof PipelineFailureScreen>;

export const Default: Story = {};

import type { Meta, StoryObj } from "@storybook/react";

import { PipelineScoreSummary } from "./PipelineScoreSummary.ui";

const meta: Meta<typeof PipelineScoreSummary> = {
	component: PipelineScoreSummary,
	title: "Runs/PipelineScoreSummary",
	decorators: [
		(Story) => (
			<div data-category-theme="js" className="max-w-2xl p-4 bg-black">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof PipelineScoreSummary>;

export const Default: Story = {
	args: {
		equation: {
			categoryName: "JavaScript",
			isCorrect: true,
			baseCoverage: 1.2,
			bonuses: [{ label: "Streak 3×", value: 0.3 }],
			earnedCoverage: 1.5,
			previousCoverage: 42.1,
			newTotalCoverage: 43.6,
			currentStreak: 3,
			bestStreak: 5,
			pollsAnswered: 18,
		},
	},
};

export const WrongAnswer: Story = {
	args: {
		equation: {
			categoryName: "JavaScript",
			isCorrect: false,
			baseCoverage: -0.5,
			bonuses: [],
			earnedCoverage: -0.5,
			previousCoverage: 43.6,
			newTotalCoverage: 43.1,
			currentStreak: 0,
			bestStreak: 5,
			pollsAnswered: 19,
		},
	},
};

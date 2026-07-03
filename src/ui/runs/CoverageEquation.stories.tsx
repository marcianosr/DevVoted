import type { Meta, StoryObj } from "@storybook/react";

import { CoverageEquation } from "./CoverageEquation.ui";

const meta: Meta<typeof CoverageEquation> = {
	component: CoverageEquation,
	title: "Runs/CoverageEquation",
};
export default meta;

type Story = StoryObj<typeof CoverageEquation>;

export const Correct: Story = {
	args: {
		categoryName: "JavaScript",
		isCorrect: true,
		baseCoverage: 1.2,
		bonuses: [
			{
				label: "Code Coverage",
				value: 0.4,
				rarity: "common",
				description: "+0.5% coverage for every poll answered.",
			},
			{ label: "Streak 3×", value: 0.3 },
		],
		earnedCoverage: 1.9,
		previousCoverage: 42.1,
		newTotalCoverage: 44,
		currentStreak: 3,
		bestStreak: 5,
		pollsAnswered: 18,
	},
};

export const Missed: Story = {
	args: {
		...Correct.args,
		isCorrect: false,
		baseCoverage: -5.5,
		bonuses: [],
		earnedCoverage: -5.5,
		previousCoverage: 6.1,
		newTotalCoverage: 0.6,
		currentStreak: 0,
	},
};

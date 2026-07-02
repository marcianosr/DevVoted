import type { Meta, StoryObj } from "@storybook/react";

import { PollScoreSummary } from "./PollScoreSummary.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollScoreSummary> = {
	component: PollScoreSummary,
	title: "Polls/PollScoreSummary",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollScoreSummary>;

export const CorrectWithBonuses: Story = {
	args: {
		categoryName: "JavaScript",
		isCorrect: true,
		baseCoverage: 1.2,
		bonuses: [
			{
				label: "Code Coverage",
				value: 0.4,
				rarity: "common" as const,
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
		categoryName: "JavaScript",
		isCorrect: false,
		baseCoverage: -5.5,
		bonuses: [],
		earnedCoverage: -5.5,
		previousCoverage: -0.6,
		newTotalCoverage: -6.1,
		currentStreak: 0,
		bestStreak: 2,
		pollsAnswered: 7,
	},
};

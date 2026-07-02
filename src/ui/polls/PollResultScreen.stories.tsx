import type { Meta, StoryObj } from "@storybook/react";

import { PollResultScreen } from "./PollResultScreen.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollResultScreen> = {
	component: PollResultScreen,
	title: "Polls/PollResultScreen",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollResultScreen>;

const options: AnswerReviewOption[] = [
	{ id: "1", text: "`Array.prototype.at(-1)`", correct: true, isYours: true },
	{
		id: "2",
		text: "`Array.prototype.slice(-1)[0]`",
		correct: false,
		isYours: false,
	},
	{ id: "3", text: "`Array.prototype.pop()`", correct: false, isYours: false },
];

const scoreSummary = {
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
};

export const Correct: Story = {
	args: {
		question: "Which method returns the last element of an array?",
		categoryName: "JavaScript",
		options,
		scoreSummary,
		explanation: "`at(-1)` reads from the end without copying the array.",
	},
};

export const Missed: Story = {
	args: {
		...Correct.args,
		scoreSummary: {
			...scoreSummary,
			isCorrect: false,
			baseCoverage: -5.5,
			bonuses: [],
			earnedCoverage: -5.5,
			previousCoverage: -0.6,
			newTotalCoverage: -6.1,
			currentStreak: 0,
		},
		options: [
			{ ...options[0], isYours: false },
			{ ...options[1], isYours: true },
			options[2],
		],
	},
};

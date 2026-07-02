import type { Meta, StoryObj } from "@storybook/react";

import { PollAnswerReview } from "./PollAnswerReview.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollAnswerReview> = {
	component: PollAnswerReview,
	title: "Polls/PollAnswerReview",
	decorators: [withCategoryTheme("js")],
};
export default meta;

type Story = StoryObj<typeof PollAnswerReview>;

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

export const CorrectPick: Story = {
	args: { options },
};

export const WrongPick: Story = {
	args: {
		options: [
			{ ...options[0], isYours: false },
			{ ...options[1], isYours: true },
			options[2],
		],
	},
};

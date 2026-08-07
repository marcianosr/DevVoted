import type { Meta, StoryObj } from "@storybook/react";

import { PollResultScreen } from "./PollResultScreen.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";
import { withGateTheme } from "./story-utils";

const meta: Meta<typeof PollResultScreen> = {
	component: PollResultScreen,
	title: "Polls/PollResultScreen",
	decorators: [withGateTheme("marsh")],
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

export const Correct: Story = {
	args: {
		question: "Which method returns the last element of an array?",
		options,
		explanation: "`at(-1)` reads from the end without copying the array.",
		continueAction: { label: "See pipelines →", onClick: () => {} },
	},
};

export const Missed: Story = {
	args: {
		...Correct.args,
		options: [
			{ ...options[0], isYours: false },
			{ ...options[1], isYours: true },
			options[2],
		],
	},
};

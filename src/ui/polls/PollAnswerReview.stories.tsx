import type { Meta, StoryObj } from "@storybook/react";

import { PollAnswerReview } from "./PollAnswerReview.ui";
import type { AnswerReviewOption } from "./PollAnswerReview.ui";
import { withGateTheme } from "./story-utils";

const meta: Meta<typeof PollAnswerReview> = {
	component: PollAnswerReview,
	title: "Polls/PollAnswerReview",
	decorators: [withGateTheme("marsh")],
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

// The optional `voters` slot — used on the community page to show who picked
// each option. Stand-in circles here; the app renders hoverable avatars.
const voterDots = (count: number) => (
	<div className="flex -space-x-2">
		{Array.from({ length: count }, (_, i) => (
			<span
				key={i}
				className="w-6 h-6 rounded-full bg-zinc-600 border border-black"
			/>
		))}
	</div>
);

export const WithVoters: Story = {
	args: {
		options: [
			{ ...options[0], voters: voterDots(4) },
			{ ...options[1], isYours: true, voters: voterDots(2) },
			{ ...options[2], voters: voterDots(1) },
		],
	},
};

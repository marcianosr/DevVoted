import type { Meta, StoryObj } from "@storybook/react";

import { PollQuestionHeading } from "./PollQuestionHeading.ui";
import { withGateTheme } from "./story-utils";

const meta: Meta<typeof PollQuestionHeading> = {
	component: PollQuestionHeading,
	title: "Polls/PollQuestionHeading",
	decorators: [withGateTheme("marsh")],
};
export default meta;

type Story = StoryObj<typeof PollQuestionHeading>;

export const PlainQuestion: Story = {
	args: {
		question: "Which method returns the last element of an array?",
	},
};

export const WithInlineCode: Story = {
	args: {
		question: "What does `Array.prototype.at(-1)` return on `[1, 2, 3]`?",
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { PollSubmitBar } from "./PollSubmitBar.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollSubmitBar> = {
	component: PollSubmitBar,
	title: "Polls/PollSubmitBar",
	decorators: [withCategoryTheme("js")],
	args: {
		canSubmit: false,
		isSubmitting: false,
		submitted: false,
		hint: "Pick an option to continue.",
		onSubmit: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof PollSubmitBar>;

export const NothingSelected: Story = {};

export const Ready: Story = {
	args: { canSubmit: true },
};

export const Submitting: Story = {
	args: { canSubmit: true, isSubmitting: true },
};

export const Submitted: Story = {
	args: { canSubmit: true, submitted: true },
};

export const WithError: Story = {
	args: { canSubmit: true, error: "Please select at least one answer" },
};

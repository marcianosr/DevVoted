import type { Meta, StoryObj } from "@storybook/react";

import { PollActionButton } from "./PollActionButton.ui";
import { withCategoryTheme } from "./story-utils";

const meta: Meta<typeof PollActionButton> = {
	component: PollActionButton,
	title: "Polls/PollActionButton",
	decorators: [withCategoryTheme("js")],
	args: { onClick: () => {} },
};
export default meta;

type Story = StoryObj<typeof PollActionButton>;

export const Enabled: Story = {
	args: { children: "Submit answer →" },
};

export const SeePipelines: Story = {
	args: { children: "See pipelines →" },
};

export const Disabled: Story = {
	args: { children: "Submit answer →", disabled: true },
};

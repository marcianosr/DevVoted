import type { Meta, StoryObj } from "@storybook/react";

import { Byline } from "./Byline.ui";

// Game-design reason: a daily poll written by a name reads as authored rather
// than generated, which is what makes a bad question feel like someone's opinion
// instead of a bug.
const meta: Meta<typeof Byline> = {
	component: Byline,
	title: "Modern/Byline",
	args: { author: "matthijsgroen", role: "Frontend developer" },
};
export default meta;

type Story = StoryObj<typeof Byline>;

export const Credited: Story = {};

export const HandleOnly: Story = {
	args: { author: "tijmen", role: undefined },
};

import type { Meta, StoryObj } from "@storybook/react";

import { Byline } from "./Byline.ui";

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

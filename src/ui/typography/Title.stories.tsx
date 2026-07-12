import type { Meta, StoryObj } from "@storybook/react";

import { Title } from "./Title.component";

const meta: Meta<typeof Title> = {
	component: Title,
	title: "Design System/Typography/Title",
};
export default meta;

type Story = StoryObj<typeof Title>;

export const Default: Story = {
	args: { children: "Gate 3 — the climb steepens" },
};

export const CategoryAccent: Story = {
	args: { children: "JavaScript", category: "js" },
};

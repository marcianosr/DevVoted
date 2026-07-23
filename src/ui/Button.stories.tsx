import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button.component";

const meta: Meta<typeof Button> = {
	component: Button,
	title: "UI/Button",
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "Start New Run" } };

export const PrimarySmall: Story = {
	args: { children: "Continue", size: "small" },
};

export const Secondary: Story = {
	args: { children: "Cancel", variant: "secondary" },
};

export const SecondarySmall: Story = {
	args: { children: "Review answers →", variant: "secondary", size: "small" },
};

export const Danger: Story = {
	args: { children: "Delete", variant: "danger" },
};

export const Theme: Story = {
	args: { children: "Rebuild configs (1KB)", variant: "theme" },
};

export const Selected: Story = {
	args: { children: "CSS", variant: "theme", isSelected: true },
};

export const Loading: Story = {
	args: { children: "Saving…", isLoading: true },
};

export const Disabled: Story = {
	args: { children: "Unavailable", disabled: true },
};

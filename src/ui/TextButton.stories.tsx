import type { Meta, StoryObj } from "@storybook/react";
import { TextButton } from "./TextButton.component";

const meta: Meta<typeof TextButton> = {
	component: TextButton,
	title: "UI/TextButton",
};
export default meta;

type Story = StoryObj<typeof TextButton>;

export const Success: Story = {
	args: { children: "View details", variant: "success" },
};

export const Danger: Story = {
	args: { children: "Remove", variant: "danger" },
};

export const Disabled: Story = {
	args: { children: "Locked", disabled: true },
};

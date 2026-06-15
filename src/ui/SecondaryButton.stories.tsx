import type { Meta, StoryObj } from "@storybook/react";
import { SecondaryButton } from "./SecondaryButton.component";

const meta: Meta<typeof SecondaryButton> = {
	component: SecondaryButton,
	title: "UI/SecondaryButton",
};
export default meta;

type Story = StoryObj<typeof SecondaryButton>;

export const Default: Story = {
	args: { children: "Cancel" },
};

export const Danger: Story = {
	args: { children: "Delete", variant: "danger" },
};

export const Loading: Story = {
	args: { children: "Saving…", isLoading: true },
};

export const Disabled: Story = {
	args: { children: "Unavailable", disabled: true },
};

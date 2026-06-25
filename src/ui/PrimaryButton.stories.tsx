import type { Meta, StoryObj } from "@storybook/react";
import { PrimaryButton } from "./PrimaryButton.component";

const meta: Meta<typeof PrimaryButton> = {
	component: PrimaryButton,
	title: "Atoms/Buttons/Primary",
};
export default meta;

type Story = StoryObj<typeof PrimaryButton>;

export const Default: Story = {
	args: { children: "Start Run" },
};

export const Small: Story = {
	args: { children: "Confirm", size: "small" },
};

export const Loading: Story = {
	args: { children: "Saving…", isLoading: true },
};

export const Disabled: Story = {
	args: { children: "Unavailable", disabled: true },
};

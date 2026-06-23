import type { Meta, StoryObj } from "@storybook/react";
import { ErrorComponent } from "./ErrorComponent.component";

const meta: Meta<typeof ErrorComponent> = {
	component: ErrorComponent,
	title: "UI/ErrorComponent",
};
export default meta;

type Story = StoryObj<typeof ErrorComponent>;

export const Default: Story = {
	args: { text: "Something went wrong. Please try again." },
};

export const NotFound: Story = {
	args: { text: "Poll not found." },
};

import type { Meta, StoryObj } from "@storybook/react";
import { DevPollNavigatorUI } from "./DevPollNavigatorUI.component";

const meta: Meta<typeof DevPollNavigatorUI> = {
	component: DevPollNavigatorUI,
	title: "UI/DevPollNavigatorUI",
};
export default meta;

type Story = StoryObj<typeof DevPollNavigatorUI>;

export const Default: Story = {
	args: {
		currentDate: "2025-05-13",
		hasCustomDate: false,
		onRandomPoll: () => {},
		onResetToToday: () => {},
	},
};

export const WithCustomDate: Story = {
	args: {
		currentDate: "2024-12-25",
		hasCustomDate: true,
		onRandomPoll: () => {},
		onResetToToday: () => {},
	},
};

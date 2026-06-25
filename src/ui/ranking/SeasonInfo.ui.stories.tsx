import type { Meta, StoryObj } from "@storybook/react";
import { SeasonInfo } from "./SeasonInfo.ui";

const meta: Meta<typeof SeasonInfo> = {
	component: SeasonInfo,
	title: "Ranking/Atoms/Season Info",
};
export default meta;

type Story = StoryObj<typeof SeasonInfo>;

export const ManyDaysLeft: Story = {
	args: {
		name: "Season 1: Core Loop",
		daysRemaining: 14,
	},
};

export const OneDayLeft: Story = {
	args: {
		name: "Season 1: Core Loop",
		daysRemaining: 1,
	},
};

export const EndsToday: Story = {
	args: {
		name: "Season 1: Core Loop",
		daysRemaining: 0,
	},
};

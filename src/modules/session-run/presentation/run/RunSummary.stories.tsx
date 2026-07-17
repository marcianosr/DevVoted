import type { Meta, StoryObj } from "@storybook/react";

import { RunSummary } from "./RunSummary.ui";

const meta: Meta<typeof RunSummary> = {
	component: RunSummary,
	title: "Session Run/RunSummary",
};
export default meta;

type Story = StoryObj<typeof RunSummary>;

export const Summited: Story = {
	args: {
		won: true,
		gatesCleared: 5,
		coverage: 24,
		storage: 640,
	},
};
export const RunOver: Story = {
	args: {
		won: false,
		gatesCleared: 2,
		coverage: 9,
		storage: 120,
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { RunHud } from "./RunHud.ui";

const meta: Meta<typeof RunHud> = {
	component: RunHud,
	title: "Session Run/RunHud",
};
export default meta;

type Story = StoryObj<typeof RunHud>;

export const WithCoverage: Story = {
	args: {
		storage: 120,
		gateNumber: 2,
		victoryGate: 5,
		pollsToGate: 5,
		coverage: 18.5,
		coverageByCategory: { css: 3, js: 8, ts: 5, react: 2.5 },
	},
};

export const EarlyRun: Story = {
	args: {
		storage: 80,
		gateNumber: 1,
		victoryGate: 5,
		pollsToGate: 5,
		coverage: 0,
		coverageByCategory: {},
	},
};

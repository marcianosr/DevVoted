import type { Meta, StoryObj } from "@storybook/react";

import { RunHud } from "./RunHud.ui";

const meta: Meta<typeof RunHud> = {
	component: RunHud,
	title: "Run/RunHud",
};
export default meta;

type Story = StoryObj<typeof RunHud>;

export const WithCoverage: Story = {
	args: {
		storage: 120,
		gatesCleared: 1,
		victoryGate: 12,
		pollsAnswered: 2,
		pollsPerGate: 5,
		coverage: 18.5,
		coverageByCategory: { css: 3, js: 8, ts: 5, react: 2.5 },
	},
};

export const EarlyRun: Story = {
	args: {
		storage: 80,
		gatesCleared: 1,
		victoryGate: 12,
		pollsAnswered: 0,
		pollsPerGate: 5,
		coverage: 0,
		coverageByCategory: {},
	},
};

export const StorageNearCap: Story = {
	args: {
		storage: 980,
		gatesCleared: 1,
		victoryGate: 12,
		pollsAnswered: 2,
		pollsPerGate: 5,
		coverage: 64,
		coverageByCategory: { css: 12, js: 22, ts: 18, react: 12 },
	},
};

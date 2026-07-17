import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
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
		gateNumber: 2,
		victoryGate: 5,
		pollsAnswered: 2,
		pollsPerGate: 5,
		streak: 2,
		category: "js",
		coverage: 18.5,
		coverageByCategory: { css: 3, js: 8, ts: 5, react: 2.5 },
		configs: [CONFIGS.unitTests, CONFIGS.js, CONFIGS.eslint],
		slots: 3,
	},
};

export const EarlyRun: Story = {
	args: {
		storage: 80,
		gateNumber: 1,
		victoryGate: 5,
		pollsAnswered: 0,
		pollsPerGate: 5,
		streak: 0,
		category: "css",
		coverage: 0,
		coverageByCategory: {},
		configs: [CONFIGS.unitTests],
		slots: 3,
	},
};

export const StorageNearCap: Story = {
	args: {
		storage: 980,
		gateNumber: 5,
		victoryGate: 5,
		pollsAnswered: 2,
		pollsPerGate: 5,
		streak: 1,
		category: "ts",
		coverage: 64,
		coverageByCategory: { css: 12, js: 22, ts: 18, react: 12 },
		configs: [
			CONFIGS.unitTests,
			CONFIGS.ts,
			CONFIGS.copilot,
			CONFIGS.coldStart,
		],
		slots: 5,
	},
};

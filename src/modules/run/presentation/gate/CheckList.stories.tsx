import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { CheckList, PerkList } from "./CheckList.ui";

const meta: Meta<typeof CheckList> = {
	component: CheckList,
	title: "Run/CheckList",
};
export default meta;

type Story = StoryObj<typeof CheckList>;

export const Running: Story = {
	args: {
		configs: [CONFIGS.coverageGain],
		checks: [
			{
				label: "Correct",
				progress: "2/3",
				current: 2,
				target: 3,
				state: "running",
			},
			{
				label: "Coverage",
				progress: "1.5%/4%",
				current: 1.5,
				target: 4,
				state: "running",
				sourceConfigId: "coverage-gain",
			},
		],
	},
};

export const AllPassed: Story = {
	args: {
		configs: [CONFIGS.coldStart],
		checks: [
			{
				label: "Correct",
				progress: "3/3",
				current: 3,
				target: 3,
				state: "success",
			},
			{
				label: "Cold start",
				progress: "2/2",
				current: 2,
				target: 2,
				state: "success",
				sourceConfigId: "cold-start",
			},
		],
	},
};

export const MixedStates: Story = {
	args: {
		configs: [CONFIGS.js, CONFIGS.coldStart],
		checks: [
			{
				label: "Correct",
				progress: "3/3",
				current: 3,
				target: 3,
				state: "success",
			},
			{
				label: ".js mastery",
				progress: "not seen",
				current: 0,
				target: 1,
				state: "skipped",
				sourceConfigId: "js",
			},
			{
				label: "Cold start",
				progress: "0/2",
				current: 0,
				target: 2,
				state: "failed",
				sourceConfigId: "cold-start",
			},
		],
	},
};

export const Perks: Story = {
	render: () => (
		<PerkList perks={[CONFIGS.copilot, CONFIGS.indexedDb, CONFIGS.eslint]} />
	),
};

import type { Meta, StoryObj } from "@storybook/react";

import { GateRequirementList } from "./GateRequirementList.ui";

const meta: Meta<typeof GateRequirementList> = {
	component: GateRequirementList,
	title: "Session Run/GateRequirementList",
};
export default meta;

type Story = StoryObj<typeof GateRequirementList>;

export const AllStates: Story = {
	args: {
		checks: [
			{ label: "Correct", progress: "3/3", state: "success" },
			{ label: "Coverage", progress: "2%/4%", state: "running" },
			{ label: ".js mastery", progress: "not seen", state: "skipped" },
			{ label: "Speed", progress: "0/2 fast", state: "failed" },
		],
	},
};

export const AllMet: Story = {
	args: {
		checks: [
			{ label: "Correct", progress: "3/3", state: "success" },
			{ label: "Coverage", progress: "5%/4%", state: "success" },
		],
	},
};

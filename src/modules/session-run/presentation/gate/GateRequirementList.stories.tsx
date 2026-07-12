import type { Meta, StoryObj } from "@storybook/react";

import { GateRequirementList } from "./GateRequirementList.ui";

const meta: Meta<typeof GateRequirementList> = {
	component: GateRequirementList,
	title: "Session Run/GateRequirementList",
};
export default meta;

type Story = StoryObj<typeof GateRequirementList>;

export const InProgress: Story = {
	args: {
		gateNumber: 1,
		pollsToGate: 4,
		gateReward: 180,
		checks: [
			{
				label: "Correct",
				progress: "4/5",
				current: 4,
				target: 5,
				state: "running",
			},
			{
				label: "Coverage",
				progress: "0.7%/3%",
				current: 0.7,
				target: 3,
				state: "running",
			},
		],
	},
};

export const MixedStates: Story = {
	args: {
		gateNumber: 3,
		pollsToGate: 0,
		gateReward: 240,
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
			},
			{
				label: "Speed",
				progress: "0/2 fast",
				current: 0,
				target: 2,
				state: "failed",
			},
		],
	},
};

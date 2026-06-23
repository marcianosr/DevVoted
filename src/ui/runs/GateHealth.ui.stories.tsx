import type { Meta, StoryObj } from "@storybook/react";
import { GateHealth } from "./GateHealth.ui";

const meta: Meta<typeof GateHealth> = {
	component: GateHealth,
	title: "Runs/Organisms/Gate Health",
	decorators: [
		(Story) => (
			<div className="max-w-sm p-4 border border-theme">
				<Story />
			</div>
		),
	],
};
export default meta;

type Story = StoryObj<typeof GateHealth>;

export const AllInProgress: Story = {
	args: {
		gateNumber: 3,
		pollsLeft: 2,
		slots: [
			{
				id: "coverage-1",
				status: "in-progress",
				label: "Coverage Gain",
				difficulty: "medium",
				requirement: "Gain 2% in 5 polls",
				currentStat: "Current: +1.4%",
			},
			{
				id: "correct-1",
				status: "in-progress",
				label: "Correct Answers",
				difficulty: "low",
				requirement: "3 of 5 correct",
				currentStat: "Current: 2 correct",
			},
		],
	},
};

export const Mixed: Story = {
	args: {
		gateNumber: 5,
		pollsLeft: 0,
		slots: [
			{
				id: "coverage-1",
				status: "passed",
				label: "Coverage Gain",
				difficulty: "medium",
				requirement: "Gain 2% in 5 polls",
			},
			{
				id: "correct-1",
				status: "failed",
				label: "Short Window",
				difficulty: "high",
				requirement: "All 3 polls correct",
			},
			{
				id: "mastery-1",
				status: "skipped",
				label: "Category Mastery",
				difficulty: "critical",
				requirement: "All JS polls correct",
			},
		],
	},
};

export const SinglePollLeft: Story = {
	args: {
		gateNumber: 1,
		pollsLeft: 1,
		slots: [
			{
				id: "coverage-1",
				status: "in-progress",
				label: "Coverage Gain",
				difficulty: "low",
				requirement: "Gain 1% in 5 polls",
				currentStat: "Current: +0.8%",
			},
		],
	},
};

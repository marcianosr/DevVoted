import type { Meta, StoryObj } from "@storybook/react";

import { PipelineFailureScreen } from "./PipelineFailureScreen.ui";

const meta: Meta<typeof PipelineFailureScreen> = {
	component: PipelineFailureScreen,
	title: "Runs/PipelineFailureScreen",
	args: { onStartNewRun: () => {}, onViewSummary: () => {} },
};
export default meta;

type Story = StoryObj<typeof PipelineFailureScreen>;

export const SingleFailure: Story = {
	args: {
		failedSlots: [
			{
				label: "Correct Answers · high",
				requirement: "at least 4 correct answers this window",
			},
		],
	},
};

export const MultipleFailures: Story = {
	args: {
		failedSlots: [
			{
				label: "Coverage Gain · medium",
				requirement: "gain 8% coverage this window",
			},
			{
				label: "Category Mastery · critical",
				requirement: "all Banjo-Kazooie polls correct",
			},
		],
	},
};

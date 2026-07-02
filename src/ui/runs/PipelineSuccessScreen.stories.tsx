import type { Meta, StoryObj } from "@storybook/react";

import { STORAGE_UNITS } from "~/lib/storage";
import { PipelineSuccessScreen } from "./PipelineSuccessScreen.ui";

const meta: Meta<typeof PipelineSuccessScreen> = {
	component: PipelineSuccessScreen,
	title: "Runs/PipelineSuccessScreen",
	args: {
		children: (
			<button className="self-start px-6 py-3 bg-theme">Continue →</button>
		),
	},
};
export default meta;

type Story = StoryObj<typeof PipelineSuccessScreen>;

export const Rewarded: Story = {
	args: {
		gateNumber: 2,
		rewards: [
			{ label: "Coverage Gain · medium", bytes: STORAGE_UNITS.KB * 128 },
			{ label: "Correct Answers · low", bytes: STORAGE_UNITS.KB * 64 },
		],
		totalReward: STORAGE_UNITS.KB * 192,
		storageUsed: STORAGE_UNITS.MB / 2,
		storageLimit: STORAGE_UNITS.MB,
	},
};

export const NoPayout: Story = {
	args: {
		...Rewarded.args,
		rewards: [],
		totalReward: 0,
	},
};

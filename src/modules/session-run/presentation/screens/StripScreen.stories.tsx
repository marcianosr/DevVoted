import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/session-run/configs/configRoster.model";
import { StripScreen } from "./StripScreen.ui";

const meta: Meta<typeof StripScreen> = {
	component: StripScreen,
	title: "Session Run/Screens/Strip",
};
export default meta;

type Story = StoryObj<typeof StripScreen>;

export const Default: Story = {
	args: {
		stripsRemaining: 2,
		configs: [CONFIGS.js, CONFIGS.copilot, CONFIGS.coverageGain],
		checks: [
			{
				label: "Correct",
				progress: "1/2",
				current: 1,
				target: 2,
				state: "failed",
			},
			{
				label: "Coverage",
				progress: "2%/4%",
				current: 2,
				target: 4,
				state: "failed",
				sourceConfigId: "coverage-gain",
			},
		],
		answered: [
			{
				id: "css1",
				question: "Which centers a flex item on both axes?",
				category: "css",
				correct: false,
				picked: ["align: middle"],
			},
			{
				id: "js1",
				question: "typeof null?",
				category: "js",
				correct: true,
				picked: ['"object"'],
			},
		],
		onStrip: () => {},
	},
};

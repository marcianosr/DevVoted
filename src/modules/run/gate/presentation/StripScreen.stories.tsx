import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";

const meta: Meta<typeof StripScreen> = {
	component: StripScreen,
	title: "Run/Screens/Strip",
};
export default meta;

type Story = StoryObj<typeof StripScreen>;

export const Default: Story = {
	args: {
		stripsRemaining: 2,
		configs: [CONFIGS.js, CONFIGS.agentsMd, CONFIGS.coverageGain],
		checks: [
			{
				label: "Correct",
				progress: { kind: "answers", current: 1, target: 2 },
				current: 1,
				target: 2,
				state: "failed",
			},
			{
				label: "Coverage",
				progress: { kind: "coverage", current: 2, target: 4 },
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
				outcome: "wrong",
				picked: ["align: middle"],
			},
			{
				id: "js1",
				question: "typeof null?",
				category: "js",
				outcome: "correct",
				picked: ['"object"'],
			},
		],
		onStrip: () => {},
	},
};

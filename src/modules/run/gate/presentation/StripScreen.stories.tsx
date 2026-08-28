import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { StripScreen } from "~/modules/run/gate/presentation/StripScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const meta: Meta<typeof StripScreen> = {
	component: StripScreen,
	title: "Run/Screens/Strip",
};
export default meta;

type Story = StoryObj<typeof StripScreen>;

export const Default: Story = {
	args: {
		peelSpotsRemaining: 1,
		configs: [CONFIGS.js, CONFIGS.agentsMd, CONFIGS.coverageGain],
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
		retryStake: createMockGateStake({
			gateNumber: 1,
			coverageDemand: 10,
			coverageHeld: 9,
		}),
		onStrip: () => {},
	},
};

/**
 * Elite's audit peels two, so a three-config build walks out of this screen one
 * config away from a fatal retry — the decision the deep gates are built around.
 */
export const EliteDeepPeel: Story = {
	args: {
		...Default.args,
		peelSpotsRemaining: 2,
		retryStake: createMockGateStake({
			gateNumber: 11,
			coverageDemand: 250,
			coverageHeld: 180,
			stripsOnFailure: 2,
			missIsFatal: true,
		}),
	},
};

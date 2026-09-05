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
		peelSlotsRemaining: 1,
		configs: [CONFIGS.js, CONFIGS.agentsMd, CONFIGS.codeCoverage],
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
		peelSlotsRemaining: 2,
		retryStake: createMockGateStake({
			gateNumber: 11,
			coverageDemand: 250,
			coverageHeld: 180,
			peelSlotsOnFailure: 2,
			missIsFatal: true,
		}),
	},
};

/**
 * The Pallet gate takes nothing (ADR-057). The screen has to say so: a failure
 * report with an empty removal list and no explanation reads as a bug.
 */
export const PalletFreeMiss: Story = {
	args: {
		...Default.args,
		gateNumber: 0,
		peelSlotsRemaining: 0,
		peelWaived: true,
		retryStake: createMockGateStake({
			gateNumber: 0,
			coverageDemand: 3,
			coverageHeld: 1.8,
			peelSlotsOnFailure: 0,
			missIsFree: true,
		}),
	},
};

/**
 * With Garbage Collection installed the screen has to price a drop, not just
 * size it: every removable row quotes what shedding it pays, and the collector's
 * own row totals what the peel has recovered so far.
 */
export const Collecting: Story = {
	args: {
		...Default.args,
		peelSlotsRemaining: 2,
		peelRefundKb: 128,
		configs: [
			CONFIGS.garbageCollection,
			CONFIGS.agentsMd,
			CONFIGS.js,
			CONFIGS.codeCoverage,
		],
	},
};

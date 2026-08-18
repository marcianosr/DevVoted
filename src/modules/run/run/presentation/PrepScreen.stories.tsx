import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { PrepScreen } from "~/modules/run/run/presentation/PrepScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

const meta: Meta<typeof PrepScreen> = {
	component: PrepScreen,
	title: "Run/Screens/Prep",
};
export default meta;

type Story = StoryObj<typeof PrepScreen>;

const stake = createMockGateStake({
	gateNumber: 1,
	modifiers: {
		gateReward: 32,
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
	},
	perAnswer: {
		coveragePerCorrect: 8,
		storageKbPerCorrect: 2,
		matchingConfigMultiplier: 1.25,
	},
});

export const Default: Story = {
	args: {
		stake,
		configs: [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd],
		shopAction: { label: "← Back to shop", onClick: () => {} },
		onStartGate: () => {},
		onDropConfig: () => {},
	},
};

/** Past the shop door: the drop panel loses its "sell it instead" way out. */
export const ShopClosed: Story = {
	args: {
		...Default.args,
		shopAction: undefined,
	},
};

export const PaidStoragePlan: Story = {
	args: {
		...Default.args,
		stake: { ...stake, billKb: 16 },
	},
};

export const AwaitingTomorrowsPolls: Story = {
	args: {
		...Default.args,
		startLock: "New polls in 7h 23m",
	},
};

/** The audit reveal — the moment gate personality lands on the receipt. */
export const MarshAudit: Story = {
	args: {
		...Default.args,
		stake: createMockGateStake({
			gateNumber: 7,
			coverageDemand: 140,
			coverageHeld: 0,
			audits: [
				{
					id: "mirrored",
					name: "Mirror",
					description:
						"Every poll asks for the INCORRECT options instead — pick all of them.",
					suppressed: false,
				},
			],
			modifiers: stake.modifiers,
			perAnswer: stake.perAnswer,
		}),
	},
};

/** Stacked audits, one reported passing by Volkswagen CI — visible fraud. */
export const ChampionSuppressed: Story = {
	args: {
		...Default.args,
		stake: createMockGateStake({
			gateNumber: 12,
			coverageDemand: 340,
			coverageHeld: 12,
			audits: [
				{
					id: "burn",
					name: "The Burn",
					description: "Storage burns on every poll: −16KB, −48KB on a miss.",
					suppressed: true,
				},
				{
					id: "strip-2",
					name: "Strip",
					description:
						"Failing this gate peels 3 configs instead of 1 — a build it can empty ends the run here.",
					suppressed: false,
				},
			],
			stripsOnFailure: 3,
			modifiers: stake.modifiers,
			perAnswer: stake.perAnswer,
		}),
	},
};

/**
 * The one warning a player gets that this gate can end the run: the peel has
 * nothing left to take after their last config (ADR-037).
 */
export const LastConfigStanding: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js],
		stake: { ...stake, missIsFatal: true },
	},
};

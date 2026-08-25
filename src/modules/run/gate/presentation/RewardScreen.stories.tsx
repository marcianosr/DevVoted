import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { RewardScreen } from "~/modules/run/gate/presentation/RewardScreen.ui";
import type { GatePayout } from "~/modules/run/run/application/gatePayout.viewmodel";
import {
	createMockGatePayout,
	createMockGateStake,
} from "~/test/runView.factory";

const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Run/Screens/Reward",
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

const answered = [
	{
		id: "js1",
		question: "In JS, which statements evaluate to true?",
		category: "js" as const,
		outcome: "correct" as const,
		picked: ['"0"'],
	},
	{
		id: "js2",
		question: "A random output will print 1, 2 or 3 — which?",
		category: "js" as const,
		outcome: "wrong" as const,
		picked: ["always 1"],
	},
];

/** The cleared gate every story starts from; each names only what it varies. */
const payout = (overrides: Partial<GatePayout> = {}) =>
	createMockGatePayout({
		clearedGateNumber: 1,
		gateRewardPaidKb: 88,
		...overrides,
	});

export const Default: Story = {
	args: {
		payout: payout(),
		answered,
		configs: [CONFIGS.css, CONFIGS.unitTests],
		storage: 168,
		capKb: 512,
		nextStake: createMockGateStake({
			gateNumber: 2,
			coverageDemand: 25,
			coverageHeld: 14,
			modifiers: {
				rewardMultiplier: 1,
				coverageMultiplier: 1,
				coverageAdd: 0,
				gateReward: 48,
			},
		}),
		onReviewAnswers: () => {},
		onContinue: () => {},
	},
};

export const DependabotMerged: Story = {
	args: {
		...Default.args,
		configs: [{ ...CONFIGS.css, level: 2 }, CONFIGS.dependabot],
		payout: payout({ autoUpgradedConfig: { ...CONFIGS.css, level: 2 } }),
	},
};

export const DeprecatedDeleted: Story = {
	args: {
		...Default.args,
		payout: payout({
			deletedConfigs: [{ ...CONFIGS.deprecated, coverageMultiplier: 1 }],
		}),
	},
};

export const FreemiumLapsed: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.css, CONFIGS.unitTests],
		payout: payout({ lapsedConfigs: [CONFIGS.freemium] }),
	},
};

export const SubscriptionsBilled: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.css, CONFIGS.freemium],
		payout: payout({ gateBillPaidKb: 8, subscriptionBillKb: 64 }),
	},
};

export const WithFaucetAndBill: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.css, CONFIGS.unitTests, CONFIGS.indexedDb],
		payout: payout({ faucetThisGateKb: 24, gateBillPaidKb: 8 }),
	},
};

/** Every storage source at once — the ledger's widest shape. */
export const EveryPayout: Story = {
	args: {
		...Default.args,
		configs: [
			CONFIGS.css,
			CONFIGS.unitTests,
			CONFIGS.indexedDb,
			CONFIGS.mooresLaw,
			CONFIGS.length,
		],
		payout: payout({
			gateRewardPaidKb: 152,
			faucetThisGateKb: 24,
			interestThisGateKb: 12,
			extraPickThisGateKb: 32,
		}),
	},
};

export const Downgraded: Story = {
	args: {
		...Default.args,
		payout: payout({ planDowngraded: true }),
	},
};

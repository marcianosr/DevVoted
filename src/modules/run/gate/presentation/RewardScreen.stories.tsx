import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { RewardScreen } from "~/modules/run/gate/presentation/RewardScreen.ui";

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

export const Default: Story = {
	args: {
		clearedGate: 1,
		gateReward: 88,
		answered,
		configs: [CONFIGS.css, CONFIGS.unitTests],
		storage: 168,
		capKb: 512,
		onReviewAnswers: () => {},
		onContinue: () => {},
	},
};

export const WithFaucetAndBill: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.css, CONFIGS.unitTests, CONFIGS.indexedDb],
		faucetThisGateKb: 24,
		billKb: 8,
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
		gateReward: 152,
		faucetThisGateKb: 24,
		interestThisGateKb: 12,
		extraPickThisGateKb: 32,
	},
};

export const Downgraded: Story = {
	args: {
		...Default.args,
		planDowngraded: true,
	},
};

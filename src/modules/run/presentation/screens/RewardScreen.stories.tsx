import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { RewardScreen } from "./RewardScreen.ui";

const meta: Meta<typeof RewardScreen> = {
	component: RewardScreen,
	title: "Run/Screens/Reward",
};
export default meta;

type Story = StoryObj<typeof RewardScreen>;

export const Default: Story = {
	args: {
		clearedGate: 1,
		gateReward: 88,
		// The run's standing after the payout — without these the meters have
		// nothing to fill toward and both rewards read as bare numbers.
		storage: 168,
		coverage: 6.5,
		slots: 3,
		slotCoverageRequired: 8,
		coverageGainedByCategory: { js: 3.1, css: 0.5, react: 2.2 },
		answered: [
			{
				id: "css1",
				question:
					"Before CSS existed we used inline styles — advantages and limitations?",
				category: "css",
				outcome: "partial",
				picked: ["separates content from presentation"],
				coverageBreakdown: {
					base: 0.4,
					streakBonus: 0,
					configBonuses: [
						{ configId: "css", value: 0.3 },
						{ configId: "agents-md", value: 0.4 },
					],
				},
			},
			{
				id: "js1",
				question: "In JS, which statements evaluate to true?",
				category: "js",
				outcome: "correct",
				picked: ['"0"'],
				coverageBreakdown: {
					base: 1.8,
					streakBonus: 0.3,
					configBonuses: [{ configId: "agents-md", value: 3.5 }],
				},
			},
			{
				id: "js2",
				question: "A random output will print 1, 2 or 3 — which?",
				category: "js",
				outcome: "wrong",
				picked: ["always 1"],
			},
		],
		passedChecks: [
			{
				label: "Correct",
				progress: "2/1",
				current: 2,
				target: 1,
				state: "success",
				sourceConfigId: "unit-tests",
				description: "1 correct answer",
			},
		],
		configs: [
			CONFIGS.css,
			CONFIGS.agentsMd,
			CONFIGS.indexedDb,
			CONFIGS.unitTests,
		],
	},
};

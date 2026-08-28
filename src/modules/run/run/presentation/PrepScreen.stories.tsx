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

export const ShopClosed: Story = {
	args: {
		...Default.args,
		shopAction: undefined,
	},
};

export const PaidStoragePlan: Story = {
	args: {
		...Default.args,
		stake: {
			...stake,
			subscriptions: {
				lines: [
					{
						id: "storage-plan",
						label: "Storage plan, tier 3",
						kb: 16,
						billedOnMiss: true,
					},
				],
				totalKb: 16,
				onMissKb: 16,
				shortfallKb: 0,
			},
		},
	},
};

export const PlanAndConfigSubscriptions: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js, CONFIGS.freemium],
		stake: {
			...stake,
			subscriptions: {
				lines: [
					{
						id: "storage-plan",
						label: "Storage plan, tier 3",
						kb: 16,
						billedOnMiss: true,
					},
					{ id: "freemium", label: "Freemium", kb: 32, billedOnMiss: false },
				],
				totalKb: 48,
				onMissKb: 16,
				shortfallKb: 0,
			},
		},
	},
};

export const SubscriptionsUnaffordable: Story = {
	args: {
		...PlanAndConfigSubscriptions.args,
		stake: {
			...stake,
			subscriptions: {
				lines: [
					{
						id: "storage-plan",
						label: "Storage plan, tier 3",
						kb: 16,
						billedOnMiss: true,
					},
					{ id: "freemium", label: "Freemium", kb: 256, billedOnMiss: false },
				],
				totalKb: 272,
				onMissKb: 16,
				shortfallKb: 180,
			},
		},
	},
};

export const AwaitingTomorrowsPolls: Story = {
	args: {
		...Default.args,
		startLock: "New polls in 7h 23m",
	},
};

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

export const LastConfigStanding: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js],
		stake: { ...stake, missIsFatal: true },
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/configs/configRoster.model";
import { STORAGE_PLANS } from "~/modules/run/rules.model";
import { ShopScreen } from "./ShopScreen.ui";

const plansOn = (currentTier: number, storage = 0) =>
	STORAGE_PLANS.map((plan) => ({
		...plan,
		current: plan.tier === currentTier,
		burnKb: Math.max(0, storage - plan.capKb),
	}));

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Run/Screens/Shop",
	args: {
		storagePlans: plansOn(1),
		onChangePlan: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof ShopScreen>;

export const Default: Story = {
	args: {
		storage: 440,
		coverageByCategory: { css: 8 },
		gateNumber: 3,
		checks: [
			{
				label: "Correct",
				progress: "0/2",
				current: 0,
				target: 2,
				state: "running",
				description: "2 correct answers",
			},
			{
				label: ".js mastery",
				progress: "not seen",
				current: 0,
				target: 1,
				state: "skipped",
				sourceConfigId: "js",
				description: "get one right if js appears",
			},
		],
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		newConfigIds: ["coverage-gain"],
		draftOptions: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coldStart],
		onDraft: () => {},
		rebuildCost: 4,
		canRebuild: true,
		onRebuild: () => {},
		slots: 3,
		pollsPerGate: 5,
		stripsOnFailure: 1,
		minConfigs: 1,
		modifiers: {
			gateReward: 240,
			rewardMultiplier: 2,
			coverageMultiplier: 2,
			coverageAdd: 0.5,
		},
		perAnswer: {
			coveragePerCorrect: 8,
			storageKbPerCorrect: 0,
			matchingConfigMultiplier: 1.25,
		},
		coverage: 25,
		slotCoverageRequired: 20,
		justUnlockedSlots: [],
		onUpgrade: () => {},
		onSell: () => {},
	},
};

export const SlotLocked: Story = {
	args: {
		...Default.args,
		coverage: 12,
		slotCoverageRequired: 20,
	},
};

// Width claims itself automatically the instant coverage affords it (ADR-025) —
// this is the shop's one-time acknowledgment for the gate that crossed the rung.
export const SlotJustUnlocked: Story = {
	args: {
		...Default.args,
		slots: 4,
		justUnlockedSlots: [4],
	},
};

// The last slot on the ladder — it opens the summit and wears the legendary ring.
export const EliteFourNext: Story = {
	args: {
		...Default.args,
		slots: 13,
		coverage: 400,
		slotCoverageRequired: 415,
	},
};

// Every slot unlocked — the swatch row retires.
export const AtSlotCap: Story = {
	args: {
		...Default.args,
		slots: 14,
		coverage: 430,
		slotCoverageRequired: Infinity,
	},
};

// On tier 3 with overflow riding: switching to the free-tier rung would burn
// the 188KB sitting above its cap, and the tooltip names it before the click.
export const PaidStoragePlan: Story = {
	args: {
		...Default.args,
		storage: 700,
		storagePlans: plansOn(3, 700),
	},
};

// A strip sank the build under the coming gate's width demand (ADR-027): the
// build summary warns that climbing on ends the run, and every uninstall locks —
// the moment that decides whether death at the gate's door reads as fair.
export const UnderWidthDemand: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js],
		newConfigIds: [],
		stripsOnFailure: 3,
		minConfigs: 4,
	},
};

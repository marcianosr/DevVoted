import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	isStoragePlanUnlocked,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import { ShopScreen } from "~/modules/run/shop/presentation/ShopScreen.ui";
import { createMockGateStake } from "~/test/runView.factory";

/** Gate 3, the depth every story below sits at — so tier 3 is already on offer. */
const GATES_CLEARED = 2;

const stake = createMockGateStake({
	gateNumber: 3,
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
});

/** The ladder as a run at this depth sees it: unlocked rungs plus the next, locked. */
const plansOn = (currentTier: number, storage = 0) =>
	storagePlanLadder(GATES_CLEARED).map((plan) => ({
		...plan,
		current: plan.tier === currentTier,
		burnKb: Math.max(0, storage - plan.capKb),
		locked: !isStoragePlanUnlocked(plan, GATES_CLEARED),
	}));

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Run/Screens/Shop",
	args: {
		storagePlans: plansOn(1),
		onChangePlan: () => {},
		lockAvailable: true,
		lockCost: 16,
		canLock: true,
		lockedOfferIds: [],
		onLock: () => {},
		extendAvailable: true,
		extendCost: 48,
		canExtend: true,
		onExtend: () => {},
	},
};
export default meta;

type Story = StoryObj<typeof ShopScreen>;

export const Default: Story = {
	args: {
		storage: 440,
		coverageByCategory: { css: 8 },
		stake,
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
		coverage: 25,
		slotCoverageRequired: 20,
		justUnlockedSlots: [],
		onUpgrade: () => {},
		onSell: () => {},
	},
};

/**
 * A held offer (DVTD-5lt6): the padlock corner marks what 16KB is reserving, and
 * the run's one lock being spent takes the padlock off the other offers.
 */
export const OfferLocked: Story = {
	args: {
		...Default.args,
		lockedOfferIds: ["cold-start"],
		lockAvailable: false,
	},
};

/**
 * The badge's third state (ADR-029): a bought offer stays on the table reading
 * "owned" rather than vanishing from under the finger that tapped it.
 */
export const OfferOwned: Story = {
	args: {
		...Default.args,
		draftOptions: [CONFIGS.js, CONFIGS.eslint, CONFIGS.agentsMd],
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
		stake: { ...stake, stripsOnFailure: 3, minConfigs: 4 },
	},
};

import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	isStoragePlanUnlocked,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import { ShopScreen } from "~/modules/run/shop/presentation/ShopScreen.ui";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import {
	createMockGateStake,
	createMockShopControls,
	createMockShopOffer,
} from "~/test/runView.factory";

/** Gate 3, the depth every story below sits at — so tier 3 is already on offer. */
const GATES_CLEARED = 2;

const stake = createMockGateStake({
	gateNumber: 3,
	modifiers: {
		gateReward: 240,
		rewardMultiplier: 2,
		coverageMultiplier: 2,
		coverageAdd: 0.5,
	},
	perAnswer: {
		coveragePerCorrect: 8,
		coveragePerWrong: -0.8,
		storageKbPerCorrect: 0,
		matchingConfigMultiplier: 1.25,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
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

/** An open shop at this depth; each story names only the control it varies. */
const controls = (overrides: Partial<ShopControls> = {}) =>
	createMockShopControls({
		rebuildCost: 4,
		canRebuild: true,
		lockAvailable: true,
		lockCost: 16,
		canLock: true,
		extendAvailable: true,
		extendCost: 48,
		canExtend: true,
		...overrides,
	});

const meta: Meta<typeof ShopScreen> = {
	component: ShopScreen,
	title: "Run/Screens/Shop",
	args: {
		storagePlans: plansOn(1),
		onChangePlan: () => {},
		controls: controls(),
		onLock: () => {},
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
		configs: [CONFIGS.js, CONFIGS.coverageGain],
		newConfigIds: ["coverage-gain"],
		offers: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coldStart].map(
			(config) => createMockShopOffer(config)
		),
		onDraft: () => {},
		onRebuild: () => {},
		slots: 3,
		nextSlotUnlock: { slot: 4, gate: 1 },
		justUnlockedSlots: [],
		onUpgrade: () => {},
		onSell: () => {},
	},
};

// WTFPL's whole point is a shop transformed: the rolled five becomes the full
// catalog, and Rebuild/Lock/Extend leave the controls row — the moment has to
// read as "everything is for sale now", not as a longer list.
export const WTFPLOpenCatalog: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js, CONFIGS.wtfpl],
		storage: 88,
		offers: Object.values(CONFIGS)
			.filter((config) => config.id !== "js" && config.id !== "wtfpl")
			.map((config) => createMockShopOffer(config)),
		controls: controls({
			rebuildAvailable: false,
			lockAvailable: false,
			extendAvailable: false,
		}),
	},
};

/**
 * A held offer (DVTD-5lt6): the padlock corner marks what 16KB is reserving, and
 * the run's one lock being spent takes the padlock off the other offers.
 */
export const OfferLocked: Story = {
	args: {
		...Default.args,
		offers: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coldStart].map(
			(config) =>
				createMockShopOffer(config, { locked: config.id === "cold-start" })
		),
		controls: controls({ lockAvailable: false }),
	},
};

/**
 * The badge's third state (ADR-029): a bought offer stays on the table reading
 * "owned" rather than vanishing from under the finger that tapped it.
 */
export const OfferOwned: Story = {
	args: {
		...Default.args,
		offers: [
			createMockShopOffer(CONFIGS.js, { owned: true, installable: false }),
			createMockShopOffer(CONFIGS.eslint),
			createMockShopOffer(CONFIGS.agentsMd),
		],
	},
};

// Gates grant slots on the clear (ADR-034) — this is the shop's one-time
// acknowledgment for the gate that granted one.
export const SlotJustUnlocked: Story = {
	args: {
		...Default.args,
		slots: 4,
		nextSlotUnlock: { slot: 5, gate: 3 },
		justUnlockedSlots: [4],
	},
};

// The last slot on the ladder, held by the deepest slot-granting gate.
export const EliteFourNext: Story = {
	args: {
		...Default.args,
		slots: 13,
		nextSlotUnlock: { slot: 11, gate: 11, coverage: 380 },
	},
};

// Every slot unlocked — the preview row retires.
export const AtSlotCap: Story = {
	args: {
		...Default.args,
		slots: 14,
		nextSlotUnlock: null,
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

// The last config is the hard bottom (ADR-035): its uninstall locks so the
// pipeline can never go bare.
export const LastConfig: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js],
		newConfigIds: [],
		atMinimumWidth: true,
	},
};

// Read-only (ADR-038): the offers stay legible so the next gate can be planned,
// but every control refuses and one banner says why.
export const ReadOnlyGate: Story = {
	args: {
		...Default.args,
		controls: controls({ shopLocked: true }),
	},
};

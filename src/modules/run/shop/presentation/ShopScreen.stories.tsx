import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	BASE_SLOTS,
	MAX_SLOTS,
	revealsPlanTier,
	SLOT_PRICES_KB,
	STORAGE_PLANS,
} from "~/modules/run/run/domain/rules.model";
import { ShopScreen } from "~/modules/run/shop/presentation/ShopScreen.ui";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import {
	createMockGateStake,
	createMockShopControls,
	createMockShopOffer,
} from "~/test/runView.factory";

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

const slotDealsOn = (slots = BASE_SLOTS) => {
	const bought = slots - BASE_SLOTS;
	return {
		slots,
		maxSlots: MAX_SLOTS,
		buy: { costKb: SLOT_PRICES_KB[bought], makes: slots + 1 },
		cash:
			bought > 0
				? { costKb: SLOT_PRICES_KB[bought - 1], makes: slots - 1 }
				: { refusal: "Nothing to cash — the first four slots are free." },
	};
};

const storagePlanOn = (tier = 0, storage = 0) => ({
	capKb: STORAGE_PLANS[tier].capKb,
	perGateKb: STORAGE_PLANS[tier].perGateKb,
	peakKb: STORAGE_PLANS[tier].capKb,
	options: STORAGE_PLANS.map((plan) => ({
		tier: plan.tier,
		capKb: plan.capKb,
		perGateKb: plan.perGateKb,
		held: plan.tier === tier,
		affordable: true,
		burnsKb: Math.max(0, storage - plan.capKb),
		revealed: revealsPlanTier(plan.tier, STORAGE_PLANS[tier].capKb),
	})),
});

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
		slotDeals: slotDealsOn(),
		storagePlan: storagePlanOn(),
		onBuySlot: () => {},
		onCashSlot: () => {},
		onSetStoragePlan: () => {},
		controls: controls(),
		onLock: () => {},
		onUnlock: () => {},
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
		configs: [CONFIGS.js, CONFIGS.codeCoverage],
		newConfigIds: ["coverage-gain"],
		offers: [CONFIGS.eslint, CONFIGS.agentsMd, CONFIGS.coldStart].map(
			(config) => createMockShopOffer(config)
		),
		onDraft: () => {},
		onRebuild: () => {},
		slots: 4,
		slotsUsed: 3,
		slotsFree: 1,
		onUpgrade: () => {},
		onSell: () => {},
	},
};

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

export const PastTheFreeFour: Story = {
	args: {
		...Default.args,
		slots: 12,
		slotsUsed: 3,
		slotsFree: 9,
	},
};

export const SlotsBought: Story = {
	args: {
		...Default.args,
		storage: 700,
		slotDeals: slotDealsOn(BASE_SLOTS + 2),
		storagePlan: storagePlanOn(1, 700),
	},
};

export const LastConfig: Story = {
	args: {
		...Default.args,
		configs: [CONFIGS.js],
		newConfigIds: [],
		atMinimumWidth: true,
	},
};

export const ReadOnlyGate: Story = {
	args: {
		...Default.args,
		controls: controls({ shopLocked: true }),
	},
};

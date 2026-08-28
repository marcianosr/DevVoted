import type { Meta, StoryObj } from "@storybook/react";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	EXTRA_SPOT_TIERS,
	extraRentKb,
	extraSpotsUnlocked,
	scheduledSpots,
} from "~/modules/run/run/domain/rules.model";
import { ShopScreen } from "~/modules/run/shop/presentation/ShopScreen.ui";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import {
	createMockGateStake,
	createMockShopControls,
	createMockShopOffer,
} from "~/test/runView.factory";

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

const extraSpotsOn = ({ held = 0 } = {}) => {
	const free = scheduledSpots(GATES_CLEARED);
	const unlocked = extraSpotsUnlocked(GATES_CLEARED);
	return {
		renting: held,
		perGateKb: extraRentKb(held),
		options: [
			{
				spots: 0,
				makes: free,
				rentKb: 0,
				held: held === 0,
				rentTooDear: false,
			},
			...EXTRA_SPOT_TIERS.map((tier) => {
				const locked = tier.spots > unlocked;
				return {
					spots: tier.spots,
					makes: free + tier.spots,
					rentKb: extraRentKb(tier.spots),
					held: tier.spots === held,
					...(locked ? { fromGate: tier.fromGate } : { rentTooDear: false }),
				};
			}),
		],
	};
};

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
		extraSpots: extraSpotsOn(),
		onRentExtraSpots: () => {},
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
		spots: 4,
		spotsUsed: 3,
		spotsFree: 1,
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
		spots: 12,
		spotsUsed: 3,
		spotsFree: 9,
	},
};

export const RentingSpots: Story = {
	args: {
		...Default.args,
		storage: 700,
		extraSpots: extraSpotsOn({ held: 2 }),
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

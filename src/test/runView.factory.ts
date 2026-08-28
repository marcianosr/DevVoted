import { CATEGORY_CODES } from "~/shared/lib/categories";
import {
	EXTRA_SPOT_TIERS,
	extraRentKb,
	FAUCET_CAP_KB,
	pinCostFor,
} from "~/modules/run/run/domain/rules.model";
import {
	type Config,
	draftCost,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import { BASE_SPOTS } from "~/modules/run/pipeline/domain/pipeline.model";
import type {
	RunView,
	ShopOffer,
} from "~/modules/run/run/application/runView.viewmodel";
import type { PollView } from "~/modules/run/run/application/pollView.viewmodel";
import type { GatePayout } from "~/modules/run/run/application/gatePayout.viewmodel";
import type { ShopControls } from "~/modules/run/run/application/shopControls.viewmodel";
import type { PaidActions } from "~/modules/run/run/application/paidActions.viewmodel";
import type { GateStake } from "~/modules/run/run/application/gateStake.viewmodel";

import { createMockDataFactory } from "./createMockDataFactory";
import { KANTO_QUIZ } from "./kanto";

const [saffronPoll] = KANTO_QUIZ;

export const createMockPollView = createMockDataFactory<PollView>({
	id: "poll-1",
	category: CATEGORY_CODES[0],
	question: saffronPoll.question,
	answerType: "single",
	options: saffronPoll.options.map((label, index) => ({
		id: `option-${index + 1}`,
		label,
	})),
});

export const createMockShopOffer = (
	config: Config,
	overrides: Partial<Omit<ShopOffer, "config">> = {}
): ShopOffer => ({
	config,
	priceKb: draftCost(config),
	spots: spotsOf(config),
	owned: false,
	locked: false,
	installable: true,
	refusal: null,
	preview: {
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
		gateReward: 32,
	},
	previewPerAnswer: {
		coveragePerCorrect: 2,
		coveragePerWrong: -0.3,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
	},
	...overrides,
});

export const createMockShopControls = createMockDataFactory<ShopControls>({
	rebuildCost: 0,
	canRebuild: false,
	rebuildAvailable: true,
	lockAvailable: false,
	lockCost: 16,
	canLock: false,
	lockedOfferIds: [],
	extendAvailable: false,
	extendCost: 48,
	canExtend: false,
	shopLocked: false,
	pinAvailable: false,
	pinCost: pinCostFor(0),
	canPin: false,
	pinnedAtGate: null,
});

export const createMockGatePayout = createMockDataFactory<GatePayout>({
	autoUpgradedConfig: null,
	deletedConfigs: [],
	lapsedConfigs: [],
	subscriptionBillKb: 0,
	spotRentKb: 0,
	rentDefaulted: false,
	gateRewardPaidKb: 0,
	faucetThisGateKb: 0,
	interestThisGateKb: 0,
	extraPickThisGateKb: 0,
	clearedGateNumber: 0,
	clearedGateDemand: 3,
});

export const createMockPaidActions = createMockDataFactory<PaidActions>({
	canLint: false,
	lintReady: false,
	lintCost: 0,
	linter: null,
	canPeek: false,
	peekReady: false,
	peekCost: 32,
	peeker: null,
});

export const createMockGateStake = createMockDataFactory<GateStake>({
	gateNumber: 0,
	pollsPerGate: 5,
	coverageDemand: 3,
	coverageHeld: 0,
	audits: [],
	peelSpotsOnFailure: 1,
	peelShareOnFailure: 0.2,
	missIsFatal: false,
	subscriptions: { lines: [], totalKb: 0, onMissKb: 0, shortfallKb: 0 },
	modifiers: {
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
		gateReward: 32,
	},
	perAnswer: {
		coveragePerCorrect: 2,
		coveragePerWrong: -0.3,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
	},
});

const createRunView = createMockDataFactory<RunView>({
	status: "answering",
	spots: BASE_SPOTS,
	spotsUsed: 0,
	spotsFree: BASE_SPOTS,
	overflowSpots: 0,
	configs: [],
	installed: [],
	available: [],
	offers: [],
	newConfigIds: [],
	peelSpotsRemaining: 0,
	poll: createMockPollView(),
	awaitingTomorrow: false,
	pollsExhausted: false,
	disabledOptionIds: [],
	paidActions: createMockPaidActions(),
	offlineConfigs: [],
	mirroredPolls: false,
	pollTimeLimitMs: null,
	currentPollPeeked: false,
	correctAnswersThisGate: null,
	upcomingCategories: null,
	nextGateCategories: null,
	shopControls: createMockShopControls(),
	gatePayout: createMockGatePayout(),
	audits: [],
	answeredThisGate: [],
	allAnswered: [],
	perAnswer: {
		coveragePerCorrect: 2,
		coveragePerWrong: -0.3,
		storageKbPerCorrect: 0,
		streakStepMultiplier: 1.1,
		streakCapMultiplier: 2,
	},
	gateStake: createMockGateStake(),
	canStart: false,
	isOver: false,
	faucetRemainingKb: FAUCET_CAP_KB,
	gatesCleared: 0,
	gateTheme: "pallet",
	redoingGate: null,
	victoryGate: 12,
	atMinimumWidth: false,
	pollsAnswered: 0,
	pollsPerGate: 5,
	coverage: 0,
	coverageByCategory: {},
	storage: 64,
	extraSpots: {
		renting: 0,
		perGateKb: 0,
		options: [
			{ spots: 0, makes: 4, rentKb: 0, held: true, rentTooDear: false },
			...EXTRA_SPOT_TIERS.map((tier) => ({
				spots: tier.spots,
				makes: 4 + tier.spots,
				rentKb: extraRentKb(tier.spots),
				held: false,
				...(tier.fromGate > 0
					? { fromGate: tier.fromGate }
					: { rentTooDear: false }),
			})),
		],
	},
});

export const createMockRunView = (
	overrides: Partial<RunView> = {}
): RunView => {
	const view = createRunView(overrides);
	if (overrides.gateStake) return view;
	return {
		...view,
		gateStake: { ...view.gateStake, gateNumber: view.gatesCleared },
	};
};

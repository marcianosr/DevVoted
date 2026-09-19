import { CATEGORY_CODES } from "~/shared/lib/categories";
import {
	BASE_SLOTS,
	BUILD_SPACE_RUNGS,
	FAUCET_CAP_KB,
	pinCostFor,
} from "~/modules/run/run/domain/rules.model";
import {
	type Config,
	draftCost,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
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
	slots: slotsOf(config),
	owned: false,
	upgrades: false,
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
	estimateThisGateUnits: null,
	autoUpgradedConfig: null,
	autoUpgradedByConfig: null,
	deletedConfigs: [],
	lapsedConfigs: [],
	subscriptionBillKb: 0,
	upkeepBilledKb: 0,
	spaceDroppedTo: null,
	gateRewardPaidKb: 0,
	storageBeforeClearKb: null,
	faucetThisGateKb: 0,
	interestThisGateKb: 0,
	extraPickThisGateKb: 0,
	clearedGateNumber: 0,
	clearedGateLadder: { floor: 0, ok: 0, healthy: 5 },
	clearedCoverageHeld: 0,
});

export const createMockPaidActions = createMockDataFactory<PaidActions>({
	canLint: false,
	lintReady: false,
	lintRefusal: undefined,
	lintCost: 0,
	linter: null,
	canPeek: false,
	peekReady: false,
	peekRefusal: undefined,
	peekCost: 32,
	peeker: null,
	canWager: false,
	wagerArmed: false,
	wagerStake: 0,
	wagerer: null,
});

export const createMockGateStake = createMockDataFactory<GateStake>({
	gateNumber: 0,
	pollsPerGate: 5,
	coverageLadder: { floor: 0, ok: 0, healthy: 5 },
	coverageHeld: 0,
	coverageAtOpen: 0,
	unitsHeld: 0,
	audits: [],
	peelSlotsOnFailure: 1,
	peelConfigsOnFailure: { fewest: 1, most: 1 },
	peelShareOnFailure: 0.2,
	missIsFatal: false,
	missIsFree: false,
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
	slots: BASE_SLOTS,
	slotsUsed: 0,
	slotsFree: BASE_SLOTS,
	overflowSlots: 0,
	configs: [],
	installed: [],
	available: [],
	recommendedConfigIds: [],
	offers: [],
	newConfigIds: [],
	archiveAfterKb: null,
	unlockedConfigIds: [],
	unlockedThisRun: [],
	peelSlotsRemaining: 0,
	peelRefundKb: 0,
	poll: createMockPollView(),
	awaitingTomorrow: false,
	pollsExhausted: false,
	disabledOptionIds: [],
	hiddenOptionIds: [],
	buyBack: { costKb: 4, ready: false, sealedCount: 0 },
	paidActions: createMockPaidActions(),
	offlineConfigs: [],
	configStatuses: {},
	mirroredPolls: false,
	categoryHidden: false,
	pollTimeLimitMs: null,
	currentPollPeeked: false,
	correctAnswersThisGate: null,
	correctCountSource: null,
	rebaseSlots: [],
	estimate: null,
	estimatedCorrect: null,
	correctThisGate: 0,
	upcomingCategories: null,
	nextGateCategories: null,
	answerTypesThisGate: null,
	optionCountsThisGate: null,
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
	autoUpgradeRemaining: null,
	gatesCleared: 0,
	gateComplete: false,
	gateTheme: "pallet",
	redoingGate: null,
	clearedGate: null,
	swatchGates: [],
	victoryGate: 12,
	atMinimumWidth: false,
	pollsAnswered: 0,
	pollsPerGate: 5,
	coverage: 0,
	coverageByCategory: {},
	storage: 64,
	upkeepPaidKb: 0,
	buildSpace: {
		space: BASE_SLOTS,
		weight: 0,
		perGateKb: 0,
		offered: false,
		rungs: BUILD_SPACE_RUNGS.map((rung, index) => ({
			rung: index,
			weight: rung.weight,
			perGateKb: rung.kb,
			held: rung.weight === BASE_SLOTS,
			pickable: false,
		})),
	},
	vendorLock: { offered: false },
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

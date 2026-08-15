import { CATEGORY_CODES } from "~/shared/lib/categories";
import {
	isStoragePlanUnlocked,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import {
	type Config,
	draftCost,
} from "~/modules/run/config/domain/config.model";
import type {
	GateStake,
	PollView,
	RunView,
	ShopOffer,
} from "~/modules/run/run/application/runView.viewmodel";

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

/**
 * A priced draft offer. Pass `config` for the one under test; the verdicts
 * default to "installable, affordable, not owned" so a spec only states the
 * one it is about.
 */
export const createMockShopOffer = (
	config: Config,
	overrides: Partial<Omit<ShopOffer, "config">> = {}
): ShopOffer => ({
	config,
	priceKb: draftCost(config),
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
	previewPerAnswer: { coveragePerCorrect: 2, storageKbPerCorrect: 0 },
	...overrides,
});

export const createMockGateStake = createMockDataFactory<GateStake>({
	gateNumber: 0,
	pollsPerGate: 5,
	stripsOnFailure: 1,
	minConfigs: 2,
	coverageDemand: 3,
	coverageHeld: 0,
	billKb: 0,
	modifiers: {
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
		gateReward: 32,
	},
	perAnswer: { coveragePerCorrect: 2, storageKbPerCorrect: 0 },
});

const createRunView = createMockDataFactory<RunView>({
	status: "answering",
	slots: 3,
	configs: [],
	available: [],
	draftOptions: [],
	offers: [],
	newConfigIds: [],
	stripsRemaining: 0,
	poll: createMockPollView(),
	awaitingTomorrow: false,
	pollsExhausted: false,
	disabledOptionIds: [],
	canLint: false,
	lintReady: false,
	lintCost: 0,
	linter: null,
	canPeek: false,
	peekReady: false,
	peekCost: 32,
	peeker: null,
	currentPollPeeked: false,
	pickBudgetLeft: null,
	rebuildCost: 0,
	canRebuild: false,
	lockAvailable: false,
	lockCost: 16,
	canLock: false,
	lockedOfferIds: [],
	extendAvailable: false,
	extendCost: 48,
	canExtend: false,
	nextSlotGate: 1,
	justUnlockedSlots: [],
	checks: [],
	answeredThisGate: [],
	allAnswered: [],
	modifiers: {
		rewardMultiplier: 1,
		coverageMultiplier: 1,
		coverageAdd: 0,
		gateReward: 32,
	},
	perAnswer: { coveragePerCorrect: 2, storageKbPerCorrect: 0 },
	gateStake: createMockGateStake(),
	canStart: false,
	isOver: false,
	gateRewardPaidKb: 0,
	faucetThisGateKb: 0,
	interestThisGateKb: 0,
	extraPickThisGateKb: 0,
	gatesCleared: 0,
	gateTheme: "pallet",
	clearedGateNumber: 0,
	redoingGate: null,
	victoryGate: 12,
	stripsOnFailure: 1,
	minConfigs: 2,
	underMinConfigs: false,
	atMinimumWidth: false,
	widthRepairable: true,
	pollsAnswered: 0,
	pollsPerGate: 5,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	storage: 64,
	storageCap: 512,
	storageBillKb: 0,
	gateBillPaidKb: 0,
	planDowngraded: false,
	storagePlans: storagePlanLadder(0).map((plan, index) => ({
		...plan,
		current: index === 0,
		burnKb: 0,
		locked: !isStoragePlanUnlocked(plan, 0),
	})),
	log: [],
});

/**
 * `gatesCleared` and `gateStake.gateNumber` are the same fact, so a test that
 * moves the run to a deeper gate gets a stake that agrees with it — otherwise
 * the screens read gate 0 while the view claims gate 4. A test that passes its
 * own `gateStake` keeps it verbatim.
 */
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

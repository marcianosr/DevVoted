import { CATEGORY_CODES } from "~/domains/shared/categories";
import {
	isStoragePlanUnlocked,
	storagePlanLadder,
} from "~/modules/run/run/domain/rules.model";
import type {
	PollView,
	RunView,
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

export const createMockRunView = createMockDataFactory<RunView>({
	status: "answering",
	slots: 3,
	configs: [],
	available: [],
	draftOptions: [],
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
	rebuildCost: 0,
	canRebuild: false,
	lockAvailable: false,
	lockCost: 16,
	canLock: false,
	lockedOfferIds: [],
	extendAvailable: false,
	extendCost: 48,
	canExtend: false,
	offerCount: 5,
	slotCoverageRequired: 0,
	justUnlockedSlots: [],
	checks: [],
	answeredThisGate: [],
	allAnswered: [],
	passedChecks: [],
	demands: [],
	rewardMultiplier: 1,
	coverageMultiplier: 1,
	coverageAdd: 0,
	gateReward: 32,
	gateRewardPaidKb: 0,
	faucetThisGateKb: 0,
	gatesCleared: 0,
	gateTheme: "pallet",
	clearedGateNumber: 0,
	victoryGate: 12,
	stripsOnFailure: 1,
	minConfigs: 2,
	underMinConfigs: false,
	widthRepairable: true,
	pollsToGate: 5,
	pollsAnswered: 0,
	pollsPerGate: 5,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	coverageGainedThisGate: {},
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

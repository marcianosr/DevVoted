import { CATEGORY_CODES } from "~/domains/shared/categories";
import type { PollView, RunView } from "~/modules/run/view/runView.viewmodel";

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

/** A mid-climb answering view; override `status`/`poll` for other screens. */
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
	disabledOptionIds: [],
	canLint: false,
	lintReady: false,
	lintCost: 0,
	linter: null,
	rebuildCost: 0,
	canRebuild: false,
	slotCoverageRequired: 0,
	canAddSlot: false,
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
	pollsToGate: 5,
	pollsAnswered: 0,
	pollsPerGate: 5,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	coverageGainedThisGate: {},
	storage: 64,
	log: [],
});

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
	gateReward: 80,
	gatesCleared: 0,
	victoryGate: 5,
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

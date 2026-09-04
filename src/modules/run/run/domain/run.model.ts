import {
	type AnsweredPoll,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

import {
	isBare,
	isOverCapacity,
	Build,
} from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import {
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { offerCount, rollDraft } from "~/modules/run/shop/domain/draft.model";
import {
	type Audit,
	liveAuditsFor,
	mirrorsPolls,
	offlineConfigsFor,
	type OfflinePair,
	offlinePairsFor,
} from "~/modules/run/gate/domain/audit.model";
import {
	BASE_SLOTS,
	cappedStorage,
	PIN_START_KB_PER_GATE,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";

export const addStorage = (
	current: number,
	income: number,
	planTier: number
): number => cappedStorage(current + income, planTier);

export type RunStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type RunState = {
	readonly status: RunStatus;
	readonly build: Build;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly lockedOfferIds?: readonly string[];
	readonly extensionsBought?: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered?: readonly AnsweredPoll[];
	readonly peelSlotsRemaining: number;
	readonly polls: readonly RunPoll[];
	readonly currentIndex: number;
	readonly window: GateWindow;
	readonly manualDisabled: readonly string[];
	readonly peekedPollIds?: readonly string[];
	readonly gatesCleared: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	readonly gateRewardKb?: number;
	readonly storageBeforeClearKb?: number;
	readonly interestThisGateKb?: number;
	readonly extraPickThisGateKb?: number;
	readonly slotsBought?: number;
	readonly storagePlan?: number;
	readonly planBilledKb?: number;
	readonly planDowngraded?: boolean;
	readonly clearedGate?: number;
	readonly redoGate?: number;
	readonly autoUpgradedConfigId?: string;
	readonly deletedConfigs?: readonly Config[];
	readonly lapsedConfigs?: readonly Config[];
	readonly subscriptionBillKb?: number;
	readonly pinPlantedAtGate?: number;
	readonly startedAtGate?: number;
	readonly log: readonly string[];
};

const correctOptionCount = (poll: RunPoll): number =>
	poll.options.filter((option) => option.correct).length;

export const pickBudgetFor = (
	polls: readonly RunPoll[],
	fromIndex: number,
	mirrored = false
): number =>
	polls
		.slice(fromIndex, fromIndex + SLICE_WINDOW)
		.reduce(
			(total, poll) =>
				total +
				(mirrored
					? poll.options.length - correctOptionCount(poll)
					: correctOptionCount(poll)),
			0
		);

export type AnswerTypeSplit = {
	readonly single: number;
	readonly multiple: number;
};

export const answerTypesOf = (polls: readonly RunPoll[]): AnswerTypeSplit =>
	polls.reduce(
		(split, poll) => ({
			single: split.single + (poll.answerType === "single" ? 1 : 0),
			multiple: split.multiple + (poll.answerType === "multiple" ? 1 : 0),
		}),
		{ single: 0, multiple: 0 }
	);

export const windowStartIndex = (
	state: Pick<RunState, "currentIndex" | "window">
): number => state.currentIndex - state.window.answered;

export const freshWindow = (
	polls: readonly RunPoll[],
	fromIndex: number,
	configs: readonly Config[],
	gate: number
): GateWindow => ({
	...EMPTY_WINDOW,
	budget: pickBudgetFor(
		polls,
		fromIndex,
		mirrorsPolls(liveAuditsFor(configs, gate))
	),
});

export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[],
	startAtGate = 0
): RunState => ({
	status: "configuring",
	build: {
		id: "build",
		slots: BASE_SLOTS,
		configs: [],
	},
	available: handed,
	draftOptions: [],
	rebuildsUsed: 0,
	lockedOfferIds: [],
	extensionsBought: 0,
	draftedThisGate: [],
	answeredThisGate: [],
	allAnswered: [],
	peelSlotsRemaining: 0,
	polls,
	currentIndex: 0,
	window: freshWindow(polls, 0, [], startAtGate),
	manualDisabled: [],
	peekedPollIds: [],
	gatesCleared: startAtGate,
	startedAtGate: startAtGate,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	storage: PIN_START_KB_PER_GATE * startAtGate,
	faucetEarnedKb: 0,
	faucetThisGateKb: 0,
	gateRewardKb: 0,
	log: [],
});

export const withLog = (
	state: RunState,
	...lines: string[]
): readonly string[] => [...state.log, ...lines];

export const isAwaitingTomorrow = (state: RunState): boolean =>
	state.status === "answering" && state.currentIndex >= state.polls.length;
export const withBuild = (build: Build, configs: readonly Config[]): Build => ({
	...build,
	configs,
});

export const shopDraft = (state: RunState, seed: number): readonly Config[] =>
	rollDraft(
		seed,
		state.build.configs,
		state.lockedOfferIds ?? [],
		offerCount(state.extensionsBought ?? 0)
	);

export const auditsOf = (state: RunState): readonly Audit[] =>
	liveAuditsFor(state.build.configs, state.gatesCleared);

export const offlineConfigsOf = (state: RunState): readonly Config[] =>
	offlineConfigsFor(
		state.build.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

export const offlinePairsOf = (state: RunState): readonly OfflinePair[] =>
	offlinePairsFor(
		state.build.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

export const liveConfigsOf = (state: RunState): readonly Config[] => {
	const offline = offlineConfigsOf(state);
	if (offline.length === 0) return state.build.configs;
	return state.build.configs.filter(
		(config) => !offline.some((down) => down.id === config.id)
	);
};

export const canStart = (build: Build): boolean =>
	!isBare(build) && !isOverCapacity(build);

export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

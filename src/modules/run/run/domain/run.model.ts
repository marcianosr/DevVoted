import {
	type AnsweredPoll,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

import {
	Pipeline,
	BASE_SLOTS,
	slotsFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
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
	PIN_START_KB_PER_GATE,
	SLICE_WINDOW,
	STORAGE_PLANS,
} from "~/modules/run/run/domain/rules.model";

export const addStorage = (current: number, income: number): number =>
	current + income;

export type RunStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type RunState = {
	readonly status: RunStatus;
	readonly pipeline: Pipeline;
	readonly available: readonly Config[];
	readonly draftOptions: readonly Config[];
	readonly rebuildsUsed: number;
	readonly lockedOfferIds?: readonly string[];
	readonly extensionsBought?: number;
	readonly draftedThisGate: readonly string[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered?: readonly AnsweredPoll[];
	readonly stripsRemaining: number;
	readonly polls: readonly RunPoll[];
	readonly currentIndex: number;
	readonly window: GateWindow;
	readonly manualDisabled: readonly string[];
	/** Run-wide rather than per window: the split screen survives a reload, and the server gates on this list. */
	readonly peekedPollIds?: readonly string[];
	readonly gatesCleared: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	readonly gateRewardKb?: number;
	/** Split out of `gateRewardKb` so the gate report can attribute it. */
	readonly interestThisGateKb?: number;
	/** Same, for the `.length` slice: the loadout alone cannot reprice it. */
	readonly extraPickThisGateKb?: number;
	readonly storagePlan?: number;
	readonly gateBillKb?: number;
	readonly planDowngraded?: boolean;
	readonly clearedGate?: number;
	/** Set while a missed gate is replayed (ADR-037); `clearedGate` still holds the previous clear. */
	readonly redoGate?: number;
	/** Dependabot's bump at the last clear. Cleared when the climb resumes. */
	readonly autoUpgradedConfigId?: string;
	/** Deprecated's exits. Whole configs, not ids: they are gone from the pipeline. */
	readonly deletedConfigs?: readonly Config[];
	/** Freemium's exits. Separate from `deletedConfigs` because the reward screen says which. */
	readonly lapsedConfigs?: readonly Config[];
	readonly subscriptionBillKb?: number;
	/** ADR-036. Doubles as the once-per-run flag. */
	readonly pinPlantedAtGate?: number;
	/** 0 unless a tag rescued the run: only gates actually climbed earn death credit. */
	readonly startedAtGate?: number;
	readonly justUnlockedSlots?: readonly number[];
	readonly log: readonly string[];
};

const correctOptionCount = (poll: RunPoll): number =>
	poll.options.filter((option) => option.correct).length;

/** Recomputed at hydration, never stored: a day rollover (ADR-011) swaps the window's unplayed polls. */
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

/** `answered` and `currentIndex` advance and reset together, so their difference is the window's first poll. */
export const windowStartIndex = (
	state: Pick<RunState, "currentIndex" | "window">
): number => state.currentIndex - state.window.answered;

/** Opened with a gate number: the budget depends on whether that gate mirrors, and a clear opens the next. */
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

/** `startAtGate` is the git tag's rescue (ADR-036): width and a stipend carry over, nothing else. */
export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[],
	startAtGate = 0
): RunState => ({
	status: "configuring",
	pipeline: {
		id: "pipeline",
		slots: slotsFor({ gatesCleared: startAtGate, coverage: 0 }),
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
	stripsRemaining: 0,
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
	storagePlan: STORAGE_PLANS[0].tier,
	gateBillKb: 0,
	planDowngraded: false,
	justUnlockedSlots: [],
	log: [],
});

export const withLog = (
	state: RunState,
	...lines: string[]
): readonly string[] => [...state.log, ...lines];

export const isAwaitingTomorrow = (state: RunState): boolean =>
	state.status === "answering" && state.currentIndex >= state.polls.length;
export const withPipeline = (
	pipeline: Pipeline,
	configs: readonly Config[]
): Pipeline => ({
	...pipeline,
	configs,
});

export const shopDraft = (state: RunState, seed: number): readonly Config[] =>
	rollDraft(
		seed,
		state.pipeline.configs,
		state.lockedOfferIds ?? [],
		offerCount(state.extensionsBought ?? 0)
	);

export const auditsOf = (state: RunState): readonly Audit[] =>
	liveAuditsFor(state.pipeline.configs, state.gatesCleared);

/** Configs an audit has switched off for the poll on deck (ADR-038). */
export const offlineConfigsOf = (state: RunState): readonly Config[] =>
	offlineConfigsFor(
		state.pipeline.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

/** The same switch-off, paired with the audit that threw it — the rail names it. */
export const offlinePairsOf = (state: RunState): readonly OfflinePair[] =>
	offlinePairsFor(
		state.pipeline.configs,
		auditsOf(state),
		windowStartIndex(state),
		state.window.answered
	);

/** The build as it actually plays this poll, so a switched-off config cannot sell an action it cannot perform. */
export const liveConfigsOf = (state: RunState): readonly Config[] => {
	const offline = offlineConfigsOf(state);
	if (offline.length === 0) return state.pipeline.configs;
	return state.pipeline.configs.filter(
		(config) => !offline.some((down) => down.id === config.id)
	);
};

/** A tag-rescued run opens wider than the bench can fill, so the demand clamps to the base three (ADR-036). */
export const canStart = (pipeline: Pipeline): boolean =>
	pipeline.configs.length >= Math.min(pipeline.slots, BASE_SLOTS);

/** Won and dead are both terminal, and spelling out the pair invites missing one. */
export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

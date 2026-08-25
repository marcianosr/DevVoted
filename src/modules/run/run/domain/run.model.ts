import {
	type AnsweredPoll,
	type AnswerOutcome,
	answerOutcome,
	coverageShare,
	mirrorPoll,
	nextStreak,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

import {
	Pipeline,
	BASE_SLOTS,
	canLint,
	peekerFor,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	extraPickPayoutFor,
	gateClearPayout,
	storageInterestFor,
	isBare,
	coverageLossFor,
	slotsFor,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	Config,
	faucetKbPerCorrect,
	isUpgradable,
	levelUp,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import { autoUpgradeOnClear } from "~/modules/run/config/domain/autoUpgrade.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";
import { billSubscriptionsOnClear } from "~/modules/run/config/domain/subscription.model";
import {
	type AnswerContext,
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { starterStackFor } from "~/modules/run/config/domain/stack.model";
import {
	draftCostIn,
	draftSeed,
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	MAX_LOCKED_OFFERS,
	offerCount,
	rebuildCost,
	rollDraft,
	sellRefundIn,
	shopOffersFullRoster,
} from "~/modules/run/shop/domain/draft.model";
import {
	failStripQuotaFor,
	gateDemandFor,
	gatePassed,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditBurnKb,
	auditFeeMultiplier,
	auditScoreShare,
	auditsCloseShop,
	auditsFreezeManualEffects,
	auditTimeLimitMs,
	liveAuditsFor,
	mirrorsPolls,
	offlineConfigsFor,
	type OfflinePair,
	offlinePairsFor,
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	isStakeFatal,
	PIN_FROM_GATE,
	PIN_START_KB_PER_GATE,
	pinCostFor,
	PIN_UNTIL_GATE,
	gateBaseMultiplier,
	isStoragePlanUnlocked,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_PLANS,
	storagePlanFor,
	streakMultiplier,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

const PEEK_COSTS = [32, 64, 128, 256, 512];

export const peekCost = (usesThisGate: number): number =>
	PEEK_COSTS[usesThisGate] ?? PEEK_COSTS[PEEK_COSTS.length - 1];

const addStorage = (current: number, income: number): number =>
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

export type RunAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "pick-stack"; readonly stackId: string }
	| { readonly type: "start" }
	| {
			readonly type: "answer";
			readonly optionIds: readonly string[];
			readonly elapsedMs?: number;
	  }
	| { readonly type: "lint-poll" }
	| { readonly type: "peek-poll" }
	| { readonly type: "strip"; readonly configId: string }
	| { readonly type: "resume-climb" }
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "lock-offer"; readonly configId: string }
	| { readonly type: "extend-offers" }
	| { readonly type: "plant-pin" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string }
	| { readonly type: "change-plan"; readonly tier: number };

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
const freshWindow = (
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

const withLog = (state: RunState, ...lines: string[]): readonly string[] => [
	...state.log,
	...lines,
];

const clearLine = (gateNumber: number, reward: number): string => {
	const swatch = swatchForGate(gateNumber);
	const earned = swatch ? `, ${swatch.name} earned` : "";
	return `Gate ${gateNumber} cleared! +${reward}KB${earned}.`;
};

export const isAwaitingTomorrow = (state: RunState): boolean =>
	state.status === "answering" && state.currentIndex >= state.polls.length;
const withPipeline = (
	pipeline: Pipeline,
	configs: readonly Config[]
): Pipeline => ({
	...pipeline,
	configs,
});

const slotConfig = (state: RunState, configId: string): RunState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	if (!config || state.pipeline.configs.length >= state.pipeline.slots)
		return state;
	return {
		...state,
		available: state.available.filter((candidate) => candidate.id !== configId),
		pipeline: withPipeline(state.pipeline, [...state.pipeline.configs, config]),
	};
};

const pickStack = (state: RunState, stackId: string): RunState => {
	const stack = starterStackFor(stackId);
	if (!stack || stack.configs.length > state.pipeline.slots) return state;
	const pool = [...state.pipeline.configs, ...state.available];
	const members = stack.configs.flatMap((member) => {
		const handed = pool.find((config) => config.id === member.id);
		return handed ? [handed] : [];
	});
	if (members.length < stack.configs.length) return state;
	const memberIds = new Set(members.map((config) => config.id));
	return {
		...state,
		pipeline: withPipeline(state.pipeline, members),
		available: pool.filter((config) => !memberIds.has(config.id)),
	};
};

const unslotConfig = (state: RunState, configId: string): RunState => {
	const config = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!config) return state;
	return {
		...state,
		available: [...state.available, config],
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
	};
};

const chargeStorageBill = (state: RunState): RunState => {
	const plan = storagePlanFor(state.storagePlan);
	if (plan.billKb === 0)
		return { ...state, gateBillKb: 0, planDowngraded: false };
	if (state.storage < plan.billKb)
		return {
			...state,
			storagePlan: STORAGE_PLANS[0].tier,
			gateBillKb: 0,
			planDowngraded: true,
			log: withLog(state, "Storage bill unpaid — downgraded to the free tier."),
		};
	return {
		...state,
		storage: state.storage - plan.billKb,
		gateBillKb: plan.billKb,
		planDowngraded: false,
		log: withLog(state, `Storage bill paid (-${plan.billKb}KB).`),
	};
};

const shopDraft = (state: RunState, seed: number): readonly Config[] =>
	rollDraft(
		seed,
		state.pipeline.configs,
		state.lockedOfferIds ?? [],
		offerCount(state.extensionsBought ?? 0)
	);

/** Claims width earned so far (ADR-025/041). Takes the max because coverage falls on a miss but a slot never closes. */
const widened = (
	state: RunState,
	gatesCleared: number = state.gatesCleared
): RunState => {
	const slots = Math.max(
		state.pipeline.slots,
		slotsFor({ gatesCleared, coverage: state.coverage })
	);
	if (slots === state.pipeline.slots) return state;
	const granted = Array.from(
		{ length: slots - state.pipeline.slots },
		(_, step) => state.pipeline.slots + 1 + step
	);
	return {
		...state,
		pipeline: { ...state.pipeline, slots },
		justUnlockedSlots: [...(state.justUnlockedSlots ?? []), ...granted],
	};
};

const closeWindow = (closing: RunState, nextIndex: number): RunState => {
	// Every attempt pays, the failed ones included (ADR-035).
	const state = chargeStorageBill(closing);
	const gateNumber = state.gatesCleared;

	if (!gatePassed(state.pipeline, state.window, state.gatesCleared)) {
		// A miss peels (ADR-037); the run ends only when the peel has nothing left to take.
		const quota = failStripQuotaFor(state.pipeline.configs, gateNumber);
		const installed = state.pipeline.configs.length;
		const demand = gateDemandFor(state.pipeline.configs, state.gatesCleared);
		const missed = `Gate ${gateNumber} failed: ${state.window.coverageGained}% of ${demand}% this gate.`;
		if (isStakeFatal(quota, installed))
			return {
				...state,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(
					state,
					`${missed} It peels ${quota} — the build holds ${installed}. Run over.`
				),
			};
		return {
			...state,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			stripsRemaining: quota,
			log: withLog(
				state,
				`${missed} Peel ${quota} config${quota > 1 ? "s" : ""} and run it again.`
			),
		};
	}

	const interest = storageInterestFor(state.pipeline.configs, state.storage);
	// What `.length` counted: the only part of the payout the loadout alone cannot price.
	const extraPicks = (state.window.budget ?? 0) - state.window.answered;
	const extraPickKb = extraPickPayoutFor(state.pipeline.configs, extraPicks);
	const reward =
		gateClearPayout(
			state.pipeline.configs,
			state.window.correct,
			state.gatesCleared
		) +
		interest +
		extraPickKb;
	const cleared: RunState = {
		...widened(state, state.gatesCleared + 1),
		window: freshWindow(
			state.polls,
			nextIndex,
			state.pipeline.configs,
			state.gatesCleared + 1
		),
		manualDisabled: [],
		gatesCleared: state.gatesCleared + 1,
		clearedGate: gateNumber,
		redoGate: undefined,
		storage: addStorage(state.storage, reward),
		gateRewardKb: reward,
		interestThisGateKb: interest,
		extraPickThisGateKb: extraPickKb,
		currentIndex: nextIndex,
	};

	if (gateNumber >= VICTORY_GATE)
		return {
			...cleared,
			status: "won",
			log: withLog(state, `${clearLine(gateNumber, reward)} You summited!`),
		};

	// Seeded off the run's own trail, so a replayed clear replays its merge.
	const merged = autoUpgradeOnClear(
		cleared.pipeline.configs,
		`dependabot-${gateNumber}-${(state.allAnswered ?? []).length}-${state.storage}`
	);
	// After the merge, so one clear settles the pipeline once.
	const settled = decayOnClear(merged.configs);
	// After the reward: billing the pre-reward balance would lapse a plan this clear just covered.
	const billed = billSubscriptionsOnClear(
		settled.configs,
		cleared.storage,
		gateNumber
	);

	return {
		...cleared,
		pipeline:
			billed.configs === cleared.pipeline.configs
				? cleared.pipeline
				: withPipeline(cleared.pipeline, billed.configs),
		storage: cleared.storage - billed.paidKb,
		subscriptionBillKb: billed.paidKb,
		autoUpgradedConfigId: merged.bumped?.id,
		deletedConfigs: settled.deleted.length > 0 ? settled.deleted : undefined,
		lapsedConfigs: billed.lapsed.length > 0 ? billed.lapsed : undefined,
		draftOptions: shopDraft(state, draftSeed(gateNumber, 0)),
		rebuildsUsed: 0,
		draftedThisGate: [],
		status: "rewarding",
		log: withLog(
			state,
			`${clearLine(gateNumber, reward)} Spend it in the shop.`,
			...(merged.bumped
				? [
						`Dependabot bumped ${merged.bumped.label} to L${merged.bumped.level ?? 1} — merged without review.`,
					]
				: []),
			...settled.deleted.map(
				(config) => `${config.label} faded to ×1 — deleted from the pipeline.`
			),
			...(billed.paidKb > 0
				? [`Subscriptions billed (-${billed.paidKb}KB).`]
				: []),
			...billed.lapsed.map(
				(config) => `${config.label} went unpaid — the plan lapsed.`
			)
		),
	};
};

const answer = (
	state: RunState,
	optionIds: readonly string[],
	elapsedMs?: number
): RunState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];
	if (!poll) return state;

	// Audits read the installed pipeline, scoring the live one: an outage inside the window cannot un-suppress what the receipt already passed.
	const audits = auditsOf(state);
	const configs = liveConfigsOf(state);
	// Grade the question actually asked, so outcome, share, streak and review all agree.
	const graded = mirrorsPolls(audits) ? mirrorPoll(poll) : poll;
	const answeredOutcome = answerOutcome(graded, optionIds);
	// Short-circuits the mirror: a timeout must never be the way to score.
	const limitMs = auditTimeLimitMs(audits, state.window.answered);
	const timedOut =
		limitMs !== undefined && elapsedMs !== undefined && elapsedMs > limitMs;
	const outcome: AnswerOutcome = timedOut ? "wrong" : answeredOutcome;
	const correct = outcome === "correct";
	// Scoring follows the audited share; streaks and the faucet stay keyed to true correctness.
	const auditedShare = timedOut
		? 0
		: auditScoreShare(audits, coverageShare(graded, optionIds));
	const gateMultiplier = gateBaseMultiplier(state.gatesCleared);
	const difficultyMultiplier = pollDifficultyMultiplier(
		graded.options.length,
		graded.answerType === "multiple"
	);
	const scoredShare = auditedShare * gateMultiplier * difficultyMultiplier;
	const streak = nextStreak(state.streak, outcome);
	const answerContext: AnswerContext = {
		category: poll.category,
		answeredBefore: state.window.answered,
	};
	const earned = coverageForAnswer(
		configs,
		answerContext,
		scoredShare,
		streakMultiplier(streak)
	);
	const coverageLoss =
		auditedShare > 0 ? 0 : coverageLossFor(configs, state.gatesCleared);
	const coverageBreakdown = coverageBreakdownForAnswer(
		configs,
		answerContext,
		scoredShare,
		streakMultiplier(streak),
		coverageLoss
	);
	const categoryBefore = state.coverageByCategory[poll.category] ?? 0;
	const categoryAfter = roundToOneDecimal(
		Math.max(0, categoryBefore + earned - coverageLoss)
	);
	const rawFaucet = correct ? faucetKbPerCorrect(configs) : 0;
	const faucetEarnedBefore = state.faucetEarnedKb ?? 0;
	const faucet = Math.min(rawFaucet, faucetRemainingKb(faucetEarnedBefore));
	// Floors at 0: insolvency stays non-lethal (ADR-023).
	const burnKb = Math.min(
		auditBurnKb(audits, outcome === "wrong"),
		Math.max(0, state.storage + faucet)
	);
	const tally = state.window.byCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};
	const nextIndex = state.currentIndex + 1;

	const window: GateWindow = {
		correct: state.window.correct + (correct ? 1 : 0),
		answered: state.window.answered + 1,
		// Floored, so a bad opening can be climbed out of but never banks a negative (ADR-035).
		coverageGained: roundToOneDecimal(
			Math.max(0, state.window.coverageGained + earned - coverageLoss)
		),
		byCategory: {
			...state.window.byCategory,
			[poll.category]: {
				seen: tally.seen + 1,
				correct: tally.correct + (correct ? 1 : 0),
			},
		},
		budget: state.window.budget,
		peeked: state.window.peeked ?? 0,
	};

	const answeredPoll: AnsweredPoll = {
		id: poll.id,
		question: poll.question,
		category: poll.category,
		outcome,
		picked: graded.options
			.filter((option) => optionIds.includes(option.id))
			.map((option) => option.label),
		// The mirrored expectation, so the review agrees with the score.
		correct: graded.options
			.filter((option) => option.correct)
			.map((option) => option.label),
		codeBlock: poll.codeBlock,
		explanation: poll.explanation,
		options: poll.options.map((option) => option.label),
		answerType: graded.answerType,
		coverageEarned: earned,
		coverageBreakdown,
		elapsedMs,
		timedOut: timedOut ? true : undefined,
	};

	const coverage = roundToOneDecimal(
		Math.max(0, state.coverage + categoryAfter - categoryBefore)
	);

	const answered: RunState = widened({
		...state,
		window,
		manualDisabled: [],
		streak,
		storage: addStorage(state.storage, faucet) - burnKb,
		faucetEarnedKb: faucetEarnedBefore + faucet,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + faucet,
		coverage,
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: categoryAfter,
		},
		answeredThisGate: [...state.answeredThisGate, answeredPoll],
		allAnswered: [...(state.allAnswered ?? []), answeredPoll],
		log:
			burnKb > 0 ? withLog(state, `Storage leaked -${burnKb}KB.`) : state.log,
	});

	if (window.answered >= SLICE_WINDOW) return closeWindow(answered, nextIndex);
	return {
		...answered,
		currentIndex: nextIndex,
		status: "answering",
	};
};

const wrongStillOn = (state: RunState) => {
	const poll = state.polls[state.currentIndex];
	const alreadyOff = new Set<string>(state.manualDisabled);
	return poll.options.filter(
		(option) => !option.correct && !alreadyOff.has(option.id)
	);
};

const auditsOf = (state: RunState): readonly Audit[] =>
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

/** The fee ladder times Cost Overrun (ADR-038). Exported so buttons print what the reducer takes. */
export const lintFeeFor = (state: RunState): number =>
	lintCost(state.manualDisabled.length) * auditFeeMultiplier(auditsOf(state));

export const peekFeeFor = (state: RunState): number =>
	peekCost(state.window.peeked ?? 0) * auditFeeMultiplier(auditsOf(state));

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(liveConfigsOf(state), poll.category)) return false;
	// Feature Freeze removes the action rather than pricing it.
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	return wrongStillOn(state).length > 1;
};

export const canRunLinter = (state: RunState): boolean =>
	lintApplies(state) && state.storage >= lintFeeFor(state);

const spendLint = (state: RunState): RunState => {
	if (!canRunLinter(state)) return state;
	const cost = lintFeeFor(state);
	return {
		...state,
		storage: state.storage - cost,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${cost}KB).`),
	};
};

/** Once per poll: the whole split arrives at once, so a second look would charge for nothing. */
export const peekApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !peekerFor(liveConfigsOf(state))) return false;
	if (auditsFreezeManualEffects(auditsOf(state))) return false;
	return !(state.peekedPollIds ?? []).includes(poll.id);
};

export const canBuyPeek = (state: RunState): boolean =>
	peekApplies(state) && state.storage >= peekFeeFor(state);

const spendPeek = (state: RunState): RunState => {
	if (!canBuyPeek(state)) return state;
	const poll = state.polls[state.currentIndex];
	const cost = peekFeeFor(state);
	return {
		...state,
		storage: state.storage - cost,
		peekedPollIds: [...(state.peekedPollIds ?? []), poll.id],
		window: { ...state.window, peeked: (state.window.peeked ?? 0) + 1 },
		log: withLog(state, `Peeked at the community split (-${cost}KB).`),
	};
};

const strip = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || state.stripsRemaining <= 0) return state;
	const pipeline = stripConfig(state.pipeline, configId);
	const remaining = state.stripsRemaining - 1;
	return {
		...state,
		pipeline,
		stripsRemaining: remaining,
		log: withLog(
			state,
			remaining > 0
				? `Peeled a config. ${remaining} more to drop.`
				: `Peel paid — rebuild in the shop.`
		),
	};
};

/** ADR-037. Routes through the shop deliberately: KB is the comeback resource. */
const resumeClimb = (state: RunState): RunState => {
	if (state.stripsRemaining > 0) return state;
	if (isBare(state.pipeline))
		return {
			...state,
			status: "dead",
			log: withLog(state, "Nothing left in the pipeline — run over."),
		};
	return {
		...state,
		window: freshWindow(
			state.polls,
			state.currentIndex,
			state.pipeline.configs,
			state.gatesCleared
		),
		manualDisabled: [],
		gateRewardKb: 0,
		interestThisGateKb: 0,
		extraPickThisGateKb: 0,
		// Seeded off answers-so-far: fresh per redo, stable across a reload.
		draftOptions: shopDraft(
			state,
			draftSeed(state.gatesCleared, (state.allAnswered ?? []).length)
		),
		rebuildsUsed: 0,
		draftedThisGate: [],
		redoGate: state.gatesCleared,
		status: "rewarding",
		log: withLog(
			state,
			`Gate ${state.gatesCleared} again — rebuild in the shop first.`
		),
	};
};

const stayReward = (
	state: RunState,
	pipeline: Pipeline,
	draftOptions: readonly Config[],
	line: string
): RunState => ({
	...state,
	pipeline,
	draftOptions,
	log: withLog(state, line),
});

const draft = (state: RunState, configId: string): RunState => {
	const chosen = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	if (!chosen) return state;
	const alreadyOwned = state.pipeline.configs.some(
		(candidate) => candidate.id === configId
	);
	const cost = draftCostIn(state.pipeline.configs, chosen);
	if (
		alreadyOwned ||
		state.pipeline.configs.length >= state.pipeline.slots ||
		state.storage < cost
	)
		return state;
	const drafted = withPipeline(state.pipeline, [
		...state.pipeline.configs,
		chosen,
	]);
	return {
		...stayReward(
			state,
			drafted,
			// WTFPL takes effect at the counter, reopening this visit's table.
			chosen.offersFullRoster
				? shopDraft(
						{ ...state, pipeline: drafted },
						draftSeed(state.gatesCleared, state.rebuildsUsed)
					)
				: state.draftOptions,
			`Drafted ${chosen.label} (-${cost}KB).`
		),
		storage: state.storage - cost,
		draftedThisGate: [...state.draftedThisGate, chosen.id],
		lockedOfferIds: (state.lockedOfferIds ?? []).filter(
			(id) => id !== chosen.id
		),
	};
};

const upgrade = (state: RunState, configId: string): RunState => {
	const owned = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!owned || !isUpgradable(owned)) return state;
	const level = owned.level ?? 1;
	const levelled = withPipeline(
		state.pipeline,
		state.pipeline.configs.map((config) =>
			config.id === configId ? levelUp(config) : config
		)
	);
	// Gated twice: coverage is permission, KB is the price. Neither stands in for the other.
	if (owned.focusCategory) {
		const have = state.coverageByCategory[owned.focusCategory] ?? 0;
		if (have < upgradeCoverageRequired(level)) return state;
	}
	const cost = upgradeStorageCost(level);
	if (state.storage < cost) return state;
	return stayReward(
		{ ...state, storage: state.storage - cost },
		levelled,
		state.draftOptions,
		`Upgraded ${owned.label} to L${level + 1} for ${cost}KB.`
	);
};

const changePlan = (state: RunState, tier: number): RunState => {
	const current = storagePlanFor(state.storagePlan);
	const next = STORAGE_PLANS.find((plan) => plan.tier === tier);
	if (!next || next.tier === current.tier) return state;
	if (!isStoragePlanUnlocked(next, state.gatesCleared)) return state;
	const clamped = Math.min(state.storage, next.capKb);
	const burned = state.storage - clamped;
	const upgradeLine = `Storage plan upgraded: ${next.capKb}KB cap for ${next.billKb}KB per gate.`;
	const downgradeLine = `Storage plan downgraded to a ${next.capKb}KB cap${
		burned > 0 ? ` — ${burned}KB over it burned` : ""
	}.`;
	return {
		...state,
		storagePlan: next.tier,
		storage: clamped,
		log: withLog(state, next.tier > current.tier ? upgradeLine : downgradeLine),
	};
};

/** ADR-036. Past gate 10 a rescue resumes a starter build into stacked audits, so it is not sold. */
const pinSoldAt = (gatesCleared: number): boolean =>
	gatesCleared >= PIN_FROM_GATE && gatesCleared <= PIN_UNTIL_GATE;

/** ADR-036. One per run; the tag persists on the account and outlives this run's death. */
const plantPin = (state: RunState): RunState => {
	if (state.pinPlantedAtGate !== undefined) return state;
	if (!pinSoldAt(state.gatesCleared)) return state;
	const cost = pinCostFor(state.gatesCleared);
	if (state.storage < cost) return state;
	return {
		...state,
		storage: state.storage - cost,
		pinPlantedAtGate: state.gatesCleared,
		log: withLog(
			state,
			`git tag planted at gate ${state.gatesCleared} (-${cost}KB) — your next run checks out here.`
		),
	};
};

/** Exported so the shop button asks the rule; the reducer refuses either way. */
export const canPlantPin = (state: RunState): boolean =>
	state.pinPlantedAtGate === undefined &&
	pinSoldAt(state.gatesCleared) &&
	state.storage >= pinCostFor(state.gatesCleared);

/** Whether this depth of climb sells the tag at all (same split as ADR-029). */
export const pinAvailable = (state: RunState): boolean =>
	state.pinPlantedAtGate === undefined && pinSoldAt(state.gatesCleared);

const finishReward = (state: RunState): RunState => {
	return {
		...state,
		draftOptions: [],
		rebuildsUsed: 0,
		draftedThisGate: [],
		answeredThisGate: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		gateBillKb: 0,
		planDowngraded: false,
		redoGate: undefined,
		justUnlockedSlots: [],
		autoUpgradedConfigId: undefined,
		deletedConfigs: undefined,
		lapsedConfigs: undefined,
		subscriptionBillKb: 0,
		storage: Math.min(state.storage, storagePlanFor(state.storagePlan).capKb),
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

/** ADR-029. `{name}Available` is whether this depth sells it, `can{Name}` whether the run can pay: the shop hides one and disables the other. */
export const canRebuild = (state: RunState): boolean =>
	state.storage >= rebuildCost(state.rebuildsUsed);

/** WTFPL retires all three: rerolling a table that already shows everything sells nothing. */
export const rebuildAvailable = (state: RunState): boolean =>
	!shopOffersFullRoster(state.pipeline.configs);

export const lockAvailable = (state: RunState): boolean =>
	state.gatesCleared >= LOCK_FROM_GATE &&
	(state.lockedOfferIds ?? []).length < MAX_LOCKED_OFFERS &&
	!shopOffersFullRoster(state.pipeline.configs);

export const canLock = (state: RunState): boolean =>
	state.storage >= LOCK_COST_KB;

export const extendAvailable = (state: RunState): boolean =>
	state.gatesCleared >= EXTEND_FROM_GATE &&
	(state.extensionsBought ?? 0) < MAX_EXTENSIONS &&
	!shopOffersFullRoster(state.pipeline.configs);

export const canExtend = (state: RunState): boolean =>
	state.storage >= extendCost(state.extensionsBought ?? 0);

const rebuildDraft = (state: RunState): RunState => {
	if (!rebuildAvailable(state) || !canRebuild(state)) return state;
	const cost = rebuildCost(state.rebuildsUsed);
	const nextRebuilds = state.rebuildsUsed + 1;
	return {
		...state,
		storage: state.storage - cost,
		rebuildsUsed: nextRebuilds,
		draftOptions: shopDraft(state, draftSeed(state.gatesCleared, nextRebuilds)),
		log: withLog(state, `Rebuilt the draft (-${cost}KB).`),
	};
};

const lockOffer = (state: RunState, configId: string): RunState => {
	if (!lockAvailable(state) || !canLock(state)) return state;
	const offer = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	const locked = state.lockedOfferIds ?? [];
	// Per-offer, so it stays here: the view answers it from lockedOfferIds.
	if (!offer || locked.includes(configId)) return state;
	return {
		...state,
		storage: state.storage - LOCK_COST_KB,
		lockedOfferIds: [...locked, configId],
		log: withLog(
			state,
			`Locked ${offer.label} (-${LOCK_COST_KB}KB) — it holds until you install it.`
		),
	};
};

const extendOffers = (state: RunState): RunState => {
	if (!extendAvailable(state) || !canExtend(state)) return state;
	const bought = state.extensionsBought ?? 0;
	const cost = extendCost(bought);
	const extensions = bought + 1;
	const [drawn] = rollDraft(
		draftSeed(state.gatesCleared, state.rebuildsUsed, extensions),
		[...state.pipeline.configs, ...state.draftOptions],
		[],
		1
	);
	return {
		...state,
		storage: state.storage - cost,
		extensionsBought: extensions,
		draftOptions: drawn ? [...state.draftOptions, drawn] : state.draftOptions,
		log: withLog(
			state,
			`Extended the shop to ${offerCount(extensions)} offers (-${cost}KB).`
		),
	};
};

const pipelineAtMinimumWidth = (state: RunState): boolean =>
	atMinimumWidth(state.pipeline.configs.length);

const sell = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || pipelineAtMinimumWidth(state)) return state;
	const refund = sellRefundIn(state.pipeline.configs, target);
	return {
		...state,
		pipeline: stripConfig(state.pipeline, configId),
		storage: addStorage(state.storage, refund),
		log: withLog(state, `Sold ${target.label} (+${refund}KB).`),
	};
};

const drop = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || pipelineAtMinimumWidth(state)) return state;
	return {
		...state,
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
		log: withLog(state, "Dropped a config to make room."),
	};
};

/** A tag-rescued run opens wider than the bench can fill, so the demand clamps to the base three (ADR-036). */
export const canStart = (pipeline: Pipeline): boolean =>
	pipeline.configs.length >= Math.min(pipeline.slots, BASE_SLOTS);

/** Won and dead are both terminal, and spelling out the pair invites missing one. */
export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

const start = (state: RunState): RunState => {
	if (!canStart(state.pipeline)) return state;
	return { ...state, status: "answering" };
};

/** Read-only (ADR-038) refuses these. `drop` is absent deliberately: it belongs to the gate door, and `atMinimumWidth` governs it. */
const SHOP_WRITES: readonly RunAction["type"][] = [
	"draft",
	"upgrade",
	"rebuild-draft",
	"lock-offer",
	"extend-offers",
	"plant-pin",
	"change-plan",
	"sell",
];

/** Whether the coming gate's audits have shut the shop (ADR-038). */
export const isShopLocked = (state: RunState): boolean =>
	auditsCloseShop(auditsOf(state));

export const runReducer = (state: RunState, action: RunAction): RunState => {
	if (SHOP_WRITES.includes(action.type) && isShopLocked(state)) return state;
	if (action.type === "slot" && state.status === "configuring")
		return slotConfig(state, action.configId);
	if (action.type === "unslot" && state.status === "configuring")
		return unslotConfig(state, action.configId);
	if (action.type === "pick-stack" && state.status === "configuring")
		return pickStack(state, action.stackId);
	if (action.type === "start" && state.status === "configuring")
		return start(state);
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionIds, action.elapsedMs);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "peek-poll" && state.status === "answering")
		return spendPeek(state);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.configId);
	if (action.type === "resume-climb" && state.status === "awaiting-strip")
		return resumeClimb(state);
	if (action.type === "draft" && state.status === "rewarding")
		return draft(state, action.configId);
	if (action.type === "upgrade" && state.status === "rewarding")
		return upgrade(state, action.configId);
	if (action.type === "rebuild-draft" && state.status === "rewarding")
		return rebuildDraft(state);
	if (action.type === "lock-offer" && state.status === "rewarding")
		return lockOffer(state, action.configId);
	if (action.type === "extend-offers" && state.status === "rewarding")
		return extendOffers(state);
	if (action.type === "plant-pin" && state.status === "rewarding")
		return plantPin(state);
	if (action.type === "finish-reward" && state.status === "rewarding")
		return finishReward(state);
	if (action.type === "change-plan" && state.status === "rewarding")
		return changePlan(state, action.tier);
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	if (
		action.type === "drop" &&
		(state.status === "rewarding" ||
			(state.status === "answering" && state.window.answered === 0))
	)
		return drop(state, action.configId);
	return state;
};

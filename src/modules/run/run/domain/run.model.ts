import type { CategoryCode } from "~/shared/lib/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canAddSlot,
	canLint,
	type CoverageBreakdown,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	gateClearPayout,
	isBare,
	rewardMultiplierFor,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	CHEAPEST_DRAFT_COST_KB,
	Config,
	draftCost,
	faucetKbPerCorrect,
	isUpgradable,
	sellRefund,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
	type AnswerContext,
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { starterStackFor } from "~/modules/run/config/domain/stack.model";
import {
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
} from "~/modules/run/shop/domain/draft.model";
import {
	checkStatuses,
	gatePassed,
} from "~/modules/run/gate/domain/gate.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	dropCount,
	FAUCET_CAP_KB,
	gateBaseMultiplier,
	isStakeFatal,
	isStoragePlanUnlocked,
	minConfigsForGate,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	STORAGE_PLANS,
	storagePlanFor,
	streakMultiplier,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

const addStorage = (current: number, income: number): number =>
	current + income;

export type RunOption = {
	readonly id: string;
	readonly label: string;
	readonly correct: boolean;
};
export type AnswerType = "single" | "multiple";

export type RunPoll = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly RunOption[];
	readonly explanation?: string;
};

/**
 * The grading rule reads ids only for equality, so it is generic over their
 * type: the engine grades string ids, the community board numeric DB ids.
 */
type GradedPoll<Id> = {
	readonly answerType: AnswerType;
	readonly options: readonly { readonly id: Id; readonly correct: boolean }[];
};

const isCorrect = <Id>(
	poll: GradedPoll<Id>,
	picked: ReadonlySet<Id>
): boolean => {
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (poll.answerType === "single")
		return picked.size === 1 && correctIds.some((id) => picked.has(id));
	return (
		correctIds.length === picked.size &&
		correctIds.every((id) => picked.has(id))
	);
};

export type AnswerOutcome = "correct" | "partial" | "wrong";

const coverageShare = (poll: RunPoll, optionIds: readonly string[]): number => {
	const picked = new Set(optionIds);
	if (isCorrect(poll, picked)) return 1;
	if (poll.answerType === "single") return 0;
	const correctIds = poll.options
		.filter((option) => option.correct)
		.map((option) => option.id);
	if (correctIds.length === 0) return 0;
	const correctPicked = correctIds.filter((id) => picked.has(id)).length;
	const wrongPicked = picked.size - correctPicked;
	return Math.max(
		0,
		Math.min(1, (correctPicked - wrongPicked) / correctIds.length)
	);
};

/**
 * The one grading rule. A partial exists only on multi-answer polls, where the
 * player caught at least one correct option but not the whole set.
 */
export const answerOutcome = <Id>(
	poll: GradedPoll<Id>,
	optionIds: Iterable<Id>
): AnswerOutcome => {
	const picked = new Set(optionIds);
	if (isCorrect(poll, picked)) return "correct";
	if (poll.answerType === "single") return "wrong";
	const pickedACorrectOption = poll.options.some(
		(option) => option.correct && picked.has(option.id)
	);
	return pickedACorrectOption ? "partial" : "wrong";
};

/** A correct extends the streak, a wrong breaks it, a partial holds it. */
export const nextStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "correct") return current + 1;
	if (outcome === "wrong") return 0;
	return current;
};

const nextMissStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "wrong") return current + 1;
	if (outcome === "correct") return 0;
	return current;
};

export type RunStatus =
	"configuring" | "answering" | "awaiting-strip" | "rewarding" | "won" | "dead";

export type AnsweredPoll = {
	readonly id: string;
	readonly question: string;
	readonly category: CategoryCode;
	readonly outcome: AnswerOutcome;
	readonly picked: readonly string[];
	readonly correct?: readonly string[];
	readonly codeBlock?: string;
	readonly explanation?: string;
	readonly options?: readonly string[];
	readonly answerType?: AnswerType;
	readonly coverageEarned?: number;
	readonly coverageBreakdown?: CoverageBreakdown;
	readonly elapsedMs?: number;
};

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
	readonly gatesCleared: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	readonly gateRewardKb?: number;
	readonly storagePlan?: number;
	readonly gateBillKb?: number;
	readonly planDowngraded?: boolean;
	readonly clearedGate?: number;
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
	| { readonly type: "strip"; readonly configId: string }
	| { readonly type: "resume-climb" }
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "lock-offer"; readonly configId: string }
	| { readonly type: "extend-offers" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string }
	| { readonly type: "change-plan"; readonly tier: number };

export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[]
): RunState => ({
	status: "configuring",
	pipeline: { id: "pipeline", slots: BASE_SLOTS, configs: [] },
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
	window: EMPTY_WINDOW,
	manualDisabled: [],
	gatesCleared: 0,
	streak: 0,
	coverage: 0,
	coverageByCategory: {},
	storage: 0,
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

const failedChecks = (state: RunState): readonly string[] =>
	checkStatuses(state.pipeline, state.window, state.gatesCleared)
		.filter((check) => check.state === "failed")
		.map((check) => check.label);

const failureCause = (state: RunState): string => {
	const failed = failedChecks(state);
	return failed.length > 0 ? `: ${failed.join(", ")}` : "";
};

const fatalPeelLine = (
	state: RunState,
	gateNumber: number,
	installed: number
): string => {
	if (installed === 0)
		return `Gate ${gateNumber} broke a bare build — run over.`;
	const plural = installed > 1 ? "s" : "";
	return `Gate ${gateNumber} failed${failureCause(state)}. The peel takes all ${installed} config${plural} — run over.`;
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

const closeWindow = (closing: RunState, nextIndex: number): RunState => {
	const state = chargeStorageBill(closing);
	const gateNumber = state.gatesCleared;

	if (!gatePassed(state.pipeline, state.window, state.gatesCleared)) {
		const quota = dropCount(state.gatesCleared);
		const installed = state.pipeline.configs.length;
		if (isStakeFatal(quota, installed))
			return {
				...state,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(state, fatalPeelLine(state, gateNumber, installed)),
			};
		return {
			...state,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			stripsRemaining: quota,
			log: withLog(
				state,
				`Gate ${gateNumber} failed${failureCause(state)}. Peel ${quota} config${quota > 1 ? "s" : ""}.`
			),
		};
	}

	const reward = gateClearPayout(
		state.pipeline.configs,
		state.window.correct,
		state.gatesCleared
	);
	const cleared: RunState = {
		...state,
		window: EMPTY_WINDOW,
		manualDisabled: [],
		gatesCleared: state.gatesCleared + 1,
		clearedGate: gateNumber,
		storage: addStorage(state.storage, reward),
		gateRewardKb: reward,
		currentIndex: nextIndex,
	};

	if (gateNumber >= VICTORY_GATE)
		return {
			...cleared,
			status: "won",
			log: withLog(state, `${clearLine(gateNumber, reward)} You summited!`),
		};

	return {
		...cleared,
		draftOptions: shopDraft(state, draftSeed(gateNumber, 0)),
		rebuildsUsed: 0,
		draftedThisGate: [],
		status: "rewarding",
		log: withLog(
			state,
			`${clearLine(gateNumber, reward)} Spend it in the shop.`
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

	const configs = state.pipeline.configs;
	const outcome = answerOutcome(poll, optionIds);
	const correct = outcome === "correct";
	const openingClean = state.window.leadingCorrect === state.window.answered;
	const share = coverageShare(poll, optionIds);
	const gateMultiplier = gateBaseMultiplier(state.gatesCleared);
	const difficultyMultiplier = pollDifficultyMultiplier(
		poll.options.length,
		poll.answerType === "multiple"
	);
	const scoredShare = share * gateMultiplier * difficultyMultiplier;
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
		share > 0
			? 0
			: roundToOneDecimal(
					WRONG_COVERAGE_LOSS *
						rewardMultiplierFor(state.pipeline.configs) *
						gateMultiplier
				);
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
	const faucet = Math.min(
		rawFaucet,
		Math.max(0, FAUCET_CAP_KB - faucetEarnedBefore)
	);
	const missStreak = nextMissStreak(state.window.missStreak ?? 0, outcome);
	const tally = state.window.byCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};
	const nextIndex = state.currentIndex + 1;

	const window: GateWindow = {
		correct: state.window.correct + (correct ? 1 : 0),
		answered: state.window.answered + 1,
		coverageGained: roundToOneDecimal(state.window.coverageGained + earned),
		leadingCorrect:
			openingClean && correct
				? state.window.leadingCorrect + 1
				: state.window.leadingCorrect,
		byCategory: {
			...state.window.byCategory,
			[poll.category]: {
				seen: tally.seen + 1,
				correct: tally.correct + (correct ? 1 : 0),
				gained: roundToOneDecimal((tally.gained ?? 0) + earned),
			},
		},
		missStreak,
		maxMissStreak: Math.max(state.window.maxMissStreak ?? 0, missStreak),
	};

	const answeredPoll: AnsweredPoll = {
		id: poll.id,
		question: poll.question,
		category: poll.category,
		outcome,
		picked: poll.options
			.filter((option) => optionIds.includes(option.id))
			.map((option) => option.label),
		correct: poll.options
			.filter((option) => option.correct)
			.map((option) => option.label),
		codeBlock: poll.codeBlock,
		explanation: poll.explanation,
		options: poll.options.map((option) => option.label),
		answerType: poll.answerType,
		coverageEarned: earned,
		coverageBreakdown,
		elapsedMs,
	};

	const coverage = roundToOneDecimal(
		Math.max(0, state.coverage + categoryAfter - categoryBefore)
	);
	const widened = autoWidenSlots(state.pipeline, coverage);

	const answered: RunState = {
		...state,
		window,
		manualDisabled: [],
		streak,
		storage: addStorage(state.storage, faucet),
		faucetEarnedKb: faucetEarnedBefore + faucet,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + faucet,
		coverage,
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: categoryAfter,
		},
		pipeline: widened.pipeline,
		justUnlockedSlots: widened.justUnlocked.length
			? [...(state.justUnlockedSlots ?? []), ...widened.justUnlocked]
			: state.justUnlockedSlots,
		answeredThisGate: [...state.answeredThisGate, answeredPoll],
		allAnswered: [...(state.allAnswered ?? []), answeredPoll],
	};

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

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(state.pipeline.configs, poll.category)) return false;
	return wrongStillOn(state).length > 1;
};

export const canRunLinter = (state: RunState): boolean =>
	lintApplies(state) && state.storage >= lintCost(state.manualDisabled.length);

const spendLint = (state: RunState): RunState => {
	if (!canRunLinter(state)) return state;
	const cost = lintCost(state.manualDisabled.length);
	return {
		...state,
		storage: state.storage - cost,
		manualDisabled: [...state.manualDisabled, wrongStillOn(state)[0].id],
		log: withLog(state, `Ran the linter (-${cost}KB).`),
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
				: `Build repaired — climb on when ready.`
		),
	};
};

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
		window: EMPTY_WINDOW,
		manualDisabled: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		gateBillKb: 0,
		planDowngraded: false,
		answeredThisGate: [],
		status: "answering",
		log: withLog(
			state,
			`Climbing on with ${state.pipeline.configs.length} configs.`
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

const levelUp = (config: Config): Config => ({
	...config,
	level: (config.level ?? 1) + 1,
});

const autoWidenSlots = (
	pipeline: Pipeline,
	coverage: number
): { pipeline: Pipeline; justUnlocked: readonly number[] } => {
	let slots = pipeline.slots;
	const justUnlocked: number[] = [];
	while (canAddSlot(slots, coverage)) {
		slots += 1;
		justUnlocked.push(slots);
	}
	return {
		pipeline: justUnlocked.length ? { ...pipeline, slots } : pipeline,
		justUnlocked,
	};
};

const draft = (state: RunState, configId: string): RunState => {
	const chosen = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	if (!chosen) return state;
	const alreadyOwned = state.pipeline.configs.some(
		(candidate) => candidate.id === configId
	);
	const cost = draftCost(chosen);
	if (
		alreadyOwned ||
		state.pipeline.configs.length >= state.pipeline.slots ||
		state.storage < cost
	)
		return state;
	return {
		...stayReward(
			state,
			withPipeline(state.pipeline, [...state.pipeline.configs, chosen]),
			state.draftOptions,
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
	if (owned.focusCategory) {
		const have = state.coverageByCategory[owned.focusCategory] ?? 0;
		if (have < upgradeCoverageRequired(level)) return state;
		return stayReward(
			state,
			levelled,
			state.draftOptions,
			`Upgraded ${owned.label} to L${level + 1}.`
		);
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

export const canRepairWidthDemand = (state: RunState): boolean => {
	if (state.pipeline.configs.length >= state.pipeline.slots) return false;
	const ownedIds = new Set(state.pipeline.configs.map((config) => config.id));
	const affordableOffer = state.draftOptions.some(
		(offer) => !ownedIds.has(offer.id) && draftCost(offer) <= state.storage
	);
	return (
		affordableOffer ||
		state.storage >= rebuildCost(state.rebuildsUsed) + CHEAPEST_DRAFT_COST_KB
	);
};

const finishReward = (state: RunState): RunState => {
	const demanded = minConfigsForGate(state.gatesCleared);
	const installed = state.pipeline.configs.length;
	if (installed < demanded) {
		if (canRepairWidthDemand(state)) return state;
		return {
			...state,
			status: "dead",
			log: withLog(
				state,
				`Gate ${state.gatesCleared} demands ${demanded} configs — the build holds ${installed} and the shop can't get it there. Run over.`
			),
		};
	}
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
		justUnlockedSlots: [],
		storage: Math.min(state.storage, storagePlanFor(state.storagePlan).capKb),
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

const rebuildDraft = (state: RunState): RunState => {
	const cost = rebuildCost(state.rebuildsUsed);
	if (state.storage < cost) return state;
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
	if (state.gatesCleared < LOCK_FROM_GATE) return state;
	const offer = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	const locked = state.lockedOfferIds ?? [];
	if (!offer || locked.includes(configId)) return state;
	if (locked.length >= MAX_LOCKED_OFFERS) return state;
	if (state.storage < LOCK_COST_KB) return state;
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
	if (state.gatesCleared < EXTEND_FROM_GATE) return state;
	const bought = state.extensionsBought ?? 0;
	if (bought >= MAX_EXTENSIONS) return state;
	const cost = extendCost(bought);
	if (state.storage < cost) return state;
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

const atMinimumWidth = (state: RunState): boolean =>
	state.pipeline.configs.length <=
	Math.max(1, minConfigsForGate(state.gatesCleared));

const sell = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || atMinimumWidth(state)) return state;
	const refund = sellRefund(target);
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
	if (!target || atMinimumWidth(state)) return state;
	return {
		...state,
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
		log: withLog(state, "Dropped a config to make room."),
	};
};

/** The climb only begins on a full pipeline. Exported so the Start button asks
 * the rule rather than restating it; the reducer refuses either way. */
export const canStart = (pipeline: Pipeline): boolean =>
	pipeline.configs.length >= pipeline.slots;

/** Won and dead are both terminal; nearly every caller wants "is it finished"
 * rather than which of the two, and spelling out the pair invites missing one. */
export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

const start = (state: RunState): RunState => {
	if (!canStart(state.pipeline)) return state;
	return { ...state, status: "answering" };
};

export const runReducer = (state: RunState, action: RunAction): RunState => {
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

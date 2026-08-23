import type { CategoryCode } from "~/shared/lib/categories";

import {
	Pipeline,
	BASE_SLOTS,
	canLint,
	peekerFor,
	type CoverageBreakdown,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	extraPickPayoutFor,
	gateClearPayout,
	storageInterestFor,
	isBare,
	rewardMultiplierFor,
	slotsForGatesCleared,
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
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	atMinimumWidth,
	FAUCET_CAP_KB,
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
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";

const LINT_COSTS = [8, 16, 32, 64, 128, 256];

export const lintCost = (usesThisPoll: number): number =>
	LINT_COSTS[usesThisPoll] ?? LINT_COSTS[LINT_COSTS.length - 1];

// One rung above the lint ladder, and it resets per GATE rather than per poll:
// a peek buys information about the whole poll where a lint buys one crossed-out
// option, so the second peek of a window has to hurt.
const PEEK_COSTS = [32, 64, 128, 256, 512];

export const peekCost = (usesThisGate: number): number =>
	PEEK_COSTS[usesThisGate] ?? PEEK_COSTS[PEEK_COSTS.length - 1];

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

/**
 * The Mirror's poll (ADR-038): every option's correctness flips, so the question
 * becomes "pick every incorrect option". It turns multi-answer whenever more
 * than one option was wrong, which is most of them — a single-answer poll with
 * four options mirrors into a three-option select-all.
 *
 * A poll with no wrong options is left alone: there would be nothing to pick,
 * and an unanswerable poll is a soft-lock rather than a debuff.
 */
export const mirrorPoll = (poll: RunPoll): RunPoll => {
	const wrongCount = poll.options.filter((option) => !option.correct).length;
	if (wrongCount === 0) return poll;
	return {
		...poll,
		answerType: mirroredAnswerType(wrongCount),
		options: poll.options.map((option) => ({
			...option,
			correct: !option.correct,
		})),
	};
};

/**
 * Mirrored, a poll wants *every* wrong option, so it turns select-all as soon as
 * more than one option was wrong. The subtle half of the mirror, shared by the
 * engine's own transform above and the community board's grading — the flip
 * itself is a `!` and needs no home.
 */
export const mirroredAnswerType = (wrongCount: number): AnswerType =>
	wrongCount > 1 ? "multiple" : "single";

/**
 * The mirror as the grader sees it: just enough of a poll for `answerOutcome`,
 * with ids preserved and labels dropped. Kept separate from `mirrorPoll` because
 * a community poll's ids are numeric and its options carry different fields —
 * only the grading shape is common.
 */
export const mirrorGrading = <Id>(poll: GradedPoll<Id>): GradedPoll<Id> => {
	const wrong = poll.options.filter((option) => !option.correct);
	if (wrong.length === 0) return poll;
	return {
		answerType: mirroredAnswerType(wrong.length),
		options: poll.options.map((option) => ({
			id: option.id,
			correct: !option.correct,
		})),
	};
};

/** A correct extends the streak, a wrong breaks it, a partial holds it. */
export const nextStreak = (current: number, outcome: AnswerOutcome): number => {
	if (outcome === "correct") return current + 1;
	if (outcome === "wrong") return 0;
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
	/** Answered past a Timeout audit's clock, so it was scored as a miss whatever
	 * was picked (ADR-038). */
	readonly timedOut?: boolean;
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
	/** Polls whose community split has been bought, for the whole run rather than
	 * the window: the split screen has to survive a reload, and the server reads
	 * this list to decide whether it may hand the numbers over at all. */
	readonly peekedPollIds?: readonly string[];
	readonly gatesCleared: number;
	readonly streak: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly faucetEarnedKb?: number;
	readonly faucetThisGateKb?: number;
	readonly gateRewardKb?: number;
	/** The interest slice of `gateRewardKb`, kept so the gate report can attribute
	 * it to the config that earned it (as `faucetThisGateKb` does). */
	readonly interestThisGateKb?: number;
	/** The `.length` slice of `gateRewardKb`, kept for the same reason — it prices
	 * off the window that was drawn, so the loadout alone cannot recover it. */
	readonly extraPickThisGateKb?: number;
	readonly storagePlan?: number;
	readonly gateBillKb?: number;
	readonly planDowngraded?: boolean;
	readonly clearedGate?: number;
	/** Set while this gate is being replayed after a miss (ADR-037), so the
	 * screens can say "again" and the route sync can skip the clear's payout
	 * screen — `clearedGate` still holds the previous clear and cannot. Cleared
	 * when the retry starts. */
	readonly redoGate?: number;
	/** The config Dependabot bumped at the last clear, so the reward screen and
	 * the shop can flag it — the run log is not shown in the live game. Cleared
	 * when the climb resumes, like `justUnlockedSlots`. */
	readonly autoUpgradedConfigId?: string;
	/** Configs that faded to ×1 at the last clear and deleted themselves
	 * (Deprecated). Whole configs, not ids: they are gone from the pipeline, so
	 * an id would have nothing to resolve against. Cleared like the above. */
	readonly deletedConfigs?: readonly Config[];
	/** Configs whose subscription went unpaid at the last clear and lapsed
	 * (Freemium). Separate from `deletedConfigs` because the two exits read
	 * differently to the player — one ran out of effect, one ran out of money —
	 * and the reward screen says which. Cleared like the above. */
	readonly lapsedConfigs?: readonly Config[];
	/** KB the build's subscriptions took at the last clear, for the reward
	 * screen's deduction line beside the storage plan's. */
	readonly subscriptionBillKb?: number;
	/** The git tag (ADR-036): the gate this run planted its checkpoint at.
	 * Doubles as the once-per-run flag. */
	readonly pinPlantedAtGate?: number;
	/** Where this run began — 0 unless a tag rescued it. Keeps the death
	 * storage-credit honest: only gates actually climbed count. */
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

/**
 * The window's pick budget: every correct option across the polls it serves,
 * the already-answered ones included. Recomputed at each hydration rather than
 * stored at open, because a day rollover (ADR-011) swaps the window's unplayed
 * polls for tomorrow's.
 *
 * `mirrored` counts the wrong options instead, because at a Mirror gate those
 * are the picks the window actually demands — `.length` reveals a number the
 * player is about to spend, so it has to be the mirrored one.
 */
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

/** Where the open window began: `answered` and `currentIndex` advance one per
 * answer and reset together, so their difference is the window's first poll. */
export const windowStartIndex = (
	state: Pick<RunState, "currentIndex" | "window">
): number => state.currentIndex - state.window.answered;

/**
 * A window belongs to a gate, so it is opened with that gate's number: the
 * budget it reveals depends on whether the gate mirrors its polls, and the gate
 * being opened is not always the one just played (a clear opens the next).
 */
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

/**
 * `startAtGate` is the git tag's rescue (ADR-036): the run opens on that gate
 * with the width its clears would have granted and a stipend to shop with —
 * everything else (configs, coverage, plan) starts fresh.
 */
export const createRun = (
	polls: readonly RunPoll[],
	handed: readonly Config[],
	startAtGate = 0
): RunState => ({
	status: "configuring",
	pipeline: {
		id: "pipeline",
		slots: Math.max(BASE_SLOTS, slotsForGatesCleared(startAtGate)),
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

const closeWindow = (closing: RunState, nextIndex: number): RunState => {
	// The bill charges before the verdict, pass or fail — every attempt at a gate
	// pays the subscription, the failed ones included (ADR-035).
	const state = chargeStorageBill(closing);
	const gateNumber = state.gatesCleared;

	if (!gatePassed(state.pipeline, state.window, state.gatesCleared)) {
		// A miss peels (ADR-037): the base rule plus the gate's strip audits. The
		// run does not end at the gate — it ends when the peel has nothing left to
		// take, which the receipt says at the door.
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
	// Picks the window demanded beyond one per poll: what `.length` counted, and
	// the only part of the clear payout the loadout alone cannot price.
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
	// Max with the live width, so a run hydrated from the retired coverage
	// ladder (pre-ADR-034) never shrinks below what it already earned.
	const slots = Math.max(
		state.pipeline.slots,
		slotsForGatesCleared(state.gatesCleared + 1)
	);
	const grantedSlot = slots > state.pipeline.slots;
	const cleared: RunState = {
		...state,
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
		pipeline: grantedSlot ? { ...state.pipeline, slots } : state.pipeline,
		justUnlockedSlots: grantedSlot
			? [...(state.justUnlockedSlots ?? []), slots]
			: state.justUnlockedSlots,
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

	// Seeded off the run's own trail (answers so far, KB in hand), so two runs
	// at the same gate roll differently but a replayed clear replays its merge.
	const merged = autoUpgradeOnClear(
		cleared.pipeline.configs,
		`dependabot-${gateNumber}-${(state.allAnswered ?? []).length}-${state.storage}`
	);
	// Decay ticks after the merge on the merged configs, so one clear settles
	// the pipeline once. The gate just cleared scored at the pre-fade multiplier.
	const settled = decayOnClear(merged.configs);
	// The gate pays, and then the subscription collects (Freemium): billing the
	// pre-reward balance would lapse a plan this very clear was about to cover.
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

	// The audits read the *installed* pipeline while scoring reads the live one:
	// Dependency Outage takes a config down for the attempt, and the defeat
	// device's fraud was filed at the door, so an outage inside the window cannot
	// retroactively un-suppress what the receipt already showed as passing.
	const audits = auditsOf(state);
	const configs = liveConfigsOf(state);
	// The mirror flips the poll, so everything downstream — outcome, share,
	// streak, the answers the review shows as correct — grades the question the
	// player was actually asked.
	const graded = mirrorsPolls(audits) ? mirrorPoll(poll) : poll;
	const answeredOutcome = answerOutcome(graded, optionIds);
	// Over the clock is a miss whatever was picked, and it short-circuits the
	// mirror rather than feeding it: a timeout must never be the way to score.
	const limitMs = auditTimeLimitMs(audits, state.window.answered);
	const timedOut =
		limitMs !== undefined && elapsedMs !== undefined && elapsedMs > limitMs;
	const outcome: AnswerOutcome = timedOut ? "wrong" : answeredOutcome;
	const correct = outcome === "correct";
	// The audits transform the raw share before any multiplier (the mirror flips
	// it), so scoring — earn AND bleed — follows the audited share while streaks
	// and the faucet stay keyed to true correctness.
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
		auditedShare > 0
			? 0
			: roundToOneDecimal(
					WRONG_COVERAGE_LOSS * rewardMultiplierFor(configs) * gateMultiplier
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
	// The burn audit's per-poll tax; floors the balance at 0 — insolvency stays
	// non-lethal (ADR-023's downgrade is the storage cliff, never death).
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
		// The gate's score meter: net of losses and floored, so a bad opening
		// can be climbed out of but never banks a negative (ADR-035).
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
		// The mirrored expectation, not the poll's own answer: the reveal marks
		// what this gate asked for, and the review has to agree with the score.
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
		// The outcome above already reads "wrong" for a late answer, so the review
		// needs this to tell a genuine miss from a right answer that ran out of
		// clock — the tallies stay honest, and so does the player's memory.
		timedOut: timedOut ? true : undefined,
	};

	const coverage = roundToOneDecimal(
		Math.max(0, state.coverage + categoryAfter - categoryBefore)
	);

	const answered: RunState = {
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

/**
 * The audits in force on the gate this run is standing at — every rule that
 * reads the pipeline asks this rather than rebuilding the pair of arguments.
 */
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

/**
 * The build as it actually plays this poll: installed, minus whatever an audit
 * has taken offline. Everything that reads a power off the pipeline goes through
 * here, so a switched-off config cannot sell an action it can no longer perform.
 */
export const liveConfigsOf = (state: RunState): readonly Config[] => {
	const offline = offlineConfigsOf(state);
	if (offline.length === 0) return state.pipeline.configs;
	return state.pipeline.configs.filter(
		(config) => !offline.some((down) => down.id === config.id)
	);
};

/**
 * What the paid actions charge here: the fee ladder, times whatever Cost Overrun
 * is doing to it (ADR-038). Exported so the buttons print the same number the
 * reducer takes.
 */
export const lintFeeFor = (state: RunState): number =>
	lintCost(state.manualDisabled.length) * auditFeeMultiplier(auditsOf(state));

export const peekFeeFor = (state: RunState): number =>
	peekCost(state.window.peeked ?? 0) * auditFeeMultiplier(auditsOf(state));

export const lintApplies = (state: RunState): boolean => {
	const poll = state.polls[state.currentIndex];
	if (!poll || !canLint(liveConfigsOf(state), poll.category)) return false;
	// Feature Freeze removes the action rather than pricing it: a frozen linter
	// has no button to explain itself, and the receipt already said why.
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

/**
 * A peek is available on any poll, in any category — the split exists for all of
 * them. Once per poll: the whole split comes over at once, so a second look on
 * the same poll would be a charge for nothing.
 */
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

/**
 * The way out of a missed gate (ADR-037): the peel is paid, so the run rejoins
 * the normal post-gate loop — shop, prep, then the same gate again. Routing
 * through the shop is the point: KB is the comeback resource, and a rebuilt
 * pipeline is the only thing that makes the retry different from the attempt
 * that just failed.
 */
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
		// Seeded off answers-so-far, so every redo's shop rolls fresh but a
		// reloaded run re-rolls the same draft.
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
			// The license takes effect at the counter: drafting WTFPL reopens this
			// visit's table as the whole catalog, not the next shop's.
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
	// A Focus config is gated twice: its category's coverage says you have earned
	// the level, and the storage every upgrade costs says you can pay for it.
	// Mastery is permission, KB is the price — one never stands in for the other.
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

/**
 * The window the shop sells a tag in (ADR-036): from gate 4, and never past gate
 * 10 — a rescue deeper than that resumes a starter build into stacked audits and
 * a 4-config peel, so it would be a fortune spent on a death.
 */
const pinSoldAt = (gatesCleared: number): boolean =>
	gatesCleared >= PIN_FROM_GATE && gatesCleared <= PIN_UNTIL_GATE;

/**
 * The git tag (ADR-036): one per run, priced by the gate it marks, burnt by the
 * run it rescues. The tag itself persists on the account (run.repository mirrors
 * it), so it outlives this run's death — and a rescued run that wants another
 * has to buy it again.
 */
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

/**
 * The shop's three controls (ADR-029), each asked once. Every one splits the
 * same way: `{name}Available` is whether this depth of climb sells it at all,
 * `can{Name}` whether the run can pay for it right now — the shop hides an
 * unavailable control and disables an unaffordable one, so the two cannot be
 * one flag. Exported so the buttons ask the rule; the reducer refuses either
 * way.
 */
export const canRebuild = (state: RunState): boolean =>
	state.storage >= rebuildCost(state.rebuildsUsed);

/** WTFPL retires all three controls: rerolling, holding or widening a table
 * that already shows everything would sell the player nothing for real KB. */
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

/** The climb begins on a full starting hand — a tag-rescued run opens wider
 * than the bench can fill, so the demand clamps to the base three (ADR-036).
 * Exported so the Start button asks the rule; the reducer refuses either way. */
export const canStart = (pipeline: Pipeline): boolean =>
	pipeline.configs.length >= Math.min(pipeline.slots, BASE_SLOTS);

/** Won and dead are both terminal; nearly every caller wants "is it finished"
 * rather than which of the two, and spelling out the pair invites missing one. */
export const isRunOver = (status: RunStatus): boolean =>
	status === "won" || status === "dead";

const start = (state: RunState): RunState => {
	if (!canStart(state.pipeline)) return state;
	return { ...state, status: "answering" };
};

/**
 * Everything the shop writes. Read-only (ADR-038) refuses the lot before the
 * gate it guards; `drop` is deliberately not here — it belongs to the gate door,
 * not the till, and `atMinimumWidth` already governs it.
 */
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

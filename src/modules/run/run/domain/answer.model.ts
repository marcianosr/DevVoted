import {
	type Config,
	faucetKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import { autoUpgradeOnAnswer } from "~/modules/run/config/domain/autoUpgrade.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";
import { billSubscriptionsOnClear } from "~/modules/run/config/domain/subscription.model";
import {
	type AnswerContext,
	type GateWindow,
} from "~/modules/run/config/domain/effect.model";
import {
	coverageBreakdownForAnswer,
	coverageFactorsForAnswer,
	coverageForAnswer,
	extraPickPayoutFor,
	gateClearPayout,
	occupiedSlots,
	storageInterestFor,
} from "~/modules/run/build/domain/build.model";
import {
	type CoverageBreakdown,
	type CoverageFactors,
	bankableUnits,
	percentOf,
	surplusPayoutKb,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type GateClose,
	failPeelQuotaFor,
	gateClosingFor,
	gateDemandFor,
	runCoverageAtClose,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditBurnKb,
	auditScoreShare,
	auditTimeLimitMs,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { estimatePayoutKb } from "~/modules/run/run/domain/estimate.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	faucetRemainingKb,
	isPeelFatal,
	cappedStorage,
	FREE_PLAN,
	planBillKb,
	roundToOneDecimal,
	roundToTwoDecimals,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type RunPoll,
	answerOutcome,
	cachedHitsFor,
	coverageShare,
	mirrorPoll,
	nextStreak,
} from "~/modules/run/run/domain/runPoll.model";
import {
	addStorage,
	auditsOf,
	freshWindow,
	liveConfigsOf,
	type RunState,
	scheduleOf,
	shopDraft,
	withLog,
	withBuild,
} from "~/modules/run/run/domain/run.model";

const clearLine = (gateNumber: number, reward: number): string => {
	const swatch = swatchForGate(gateNumber);
	const earned = swatch ? `, ${swatch.name} earned` : "";
	return `Gate ${gateNumber} cleared! +${reward}KB${earned}.`;
};

type PlanSettlement = {
	readonly paidKb: number;
	readonly tier: number;
	readonly downgraded: boolean;
};

const settlePlanBill = (state: RunState, balanceKb: number): PlanSettlement => {
	const tier = state.storagePlan ?? 0;
	const owed = planBillKb(tier);
	if (owed === 0) return { paidKb: 0, tier, downgraded: false };
	if (balanceKb < owed)
		return { paidKb: balanceKb, tier: FREE_PLAN.tier, downgraded: true };
	return { paidKb: owed, tier, downgraded: false };
};

/** The gate's five results are in. It owes a close, not another answer. */
export const gateWindowComplete = (state: RunState): boolean =>
	state.window.answered >= SLICE_WINDOW;

const closeWindow = (state: RunState, nextIndex: number): RunState => {
	const gateNumber = state.gatesCleared;

	const schedule = scheduleOf(state);
	const committed = state.estimatedCorrect;
	const estimateKb = estimatePayoutKb(
		state.build.configs,
		committed,
		state.window.correct
	);
	const settledEstimate = {
		estimatedCorrect: undefined,
		estimateThisGateKb: committed === undefined ? undefined : estimateKb,
	};

	const close: GateClose = {
		build: state.build,
		bankedUnits: state.bankedUnits,
		unitsThisGate: state.window.unitsEarned,
		correctThisGate: state.window.correct,
		gatesCleared: state.gatesCleared,
		schedule,
	};
	const closing = gateClosingFor(close);
	const heldCoverage = roundToOneDecimal(percentOf(runCoverageAtClose(close)));

	if (closing !== "cleared") {
		const settledStorage = addStorage(
			state.storage,
			estimateKb,
			state.storagePlan ?? 0
		);
		const attempts = state.gateAttempts ?? 0;
		const quota = failPeelQuotaFor(
			state.build.configs,
			gateNumber,
			schedule,
			attempts
		);
		const occupied = occupiedSlots(state.build.configs);
		const demand = gateDemandFor(
			state.build.configs,
			state.gatesCleared,
			schedule
		);
		const missed = `Gate ${gateNumber} failed: the run reads ${heldCoverage}% of ${demand}%.`;

		// DANGER shuts the gate for good: no retry, no peel, no choice (ADR-076).
		if (closing === "fatal")
			return {
				...state,
				...settledEstimate,
				storage: settledStorage,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(state, `${missed} The gate shut on it. Run over.`),
			};

		if (isPeelFatal(quota, occupied))
			return {
				...state,
				...settledEstimate,
				storage: settledStorage,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(
					state,
					`${missed} It peels ${quota} — the build fills ${occupied}. Run over.`
				),
			};
		return {
			...state,
			...settledEstimate,
			storage: settledStorage,
			currentIndex: nextIndex,
			status: "awaiting-strip",
			autoUpgradeProgress: 0,
			gateAttempts: attempts + 1,
			peelRefundKb: 0,
			peelSlotsRemaining: quota,
			log: withLog(
				state,
				quota === 0
					? `${missed} This gate takes nothing — read it back, then shop and run it again.`
					: `${missed} Free up ${quota} slot${quota > 1 ? "s" : ""} and run it again.`
			),
		};
	}

	const interest = storageInterestFor(state.build.configs, state.storage);
	const extraPicks = (state.window.budget ?? 0) - state.window.answered;
	const extraPickKb = extraPickPayoutFor(state.build.configs, extraPicks);
	const totalUnits = state.bankedUnits + state.window.unitsEarned;
	const banked = roundToTwoDecimals(
		bankableUnits(totalUnits, state.gatesCleared)
	);
	const overflowKb = surplusPayoutKb(totalUnits, state.gatesCleared);
	const reward =
		gateClearPayout(
			state.build.configs,
			state.window.correct,
			state.gatesCleared,
			state.streak
		) +
		interest +
		extraPickKb +
		overflowKb +
		estimateKb;
	const planTier = state.storagePlan ?? 0;
	const rewarded = addStorage(state.storage, reward, planTier);
	const bill = settlePlanBill(state, rewarded);
	const cleared: RunState = {
		...state,
		...settledEstimate,
		window: freshWindow(
			state.polls,
			nextIndex,
			state.build.configs,
			state.gatesCleared + 1,
			scheduleOf(state)
		),
		manualDisabled: [],
		bankedUnits: banked,
		streak: 0,
		gateAttempts: 0,
		gatesCleared: state.gatesCleared + 1,
		clearedGate: gateNumber,
		redoGate: undefined,
		storage: cappedStorage(rewarded - bill.paidKb, bill.tier),
		storagePlan: bill.tier,
		planBilledKb: bill.paidKb,
		planDowngraded: bill.downgraded ? true : undefined,
		gateRewardKb: reward,
		storageBeforeClearKb: state.storage,
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

	const settled = decayOnClear(cleared.build.configs);
	const billed = billSubscriptionsOnClear(
		settled.configs,
		cleared.storage,
		gateNumber
	);

	return {
		...cleared,
		build:
			billed.configs === cleared.build.configs
				? cleared.build
				: withBuild(cleared.build, billed.configs),
		storage: cleared.storage - billed.paidKb,
		subscriptionBillKb: billed.paidKb,
		deletedConfigs: settled.deleted.length > 0 ? settled.deleted : undefined,
		lapsedConfigs: billed.lapsed.length > 0 ? billed.lapsed : undefined,
		configsLost:
			(state.configsLost ?? 0) + settled.deleted.length + billed.lapsed.length,
		draftOptions: shopDraft(state, draftSeed(gateNumber, 0)),
		rebuildsUsed: 0,
		soldThisShop: 0,
		draftedThisGate: [],
		status: "rewarding",
		log: withLog(
			state,
			`${clearLine(gateNumber, reward)} Spend it in the shop.`,
			...settled.deleted.map(
				(config) => `${config.label} faded to ×1 — deleted from the build.`
			),
			...(bill.paidKb > 0 ? [`Storage plan billed (-${bill.paidKb}KB).`] : []),
			...(bill.downgraded
				? ["The plan went unpaid — dropped to the free cap."]
				: []),
			...(billed.paidKb > 0
				? [`Subscriptions billed (-${billed.paidKb}KB).`]
				: []),
			...billed.lapsed.map(
				(config) => `${config.label} went unpaid — the plan lapsed.`
			)
		),
	};
};

type AnswerGrade = {
	readonly audits: readonly Audit[];
	readonly configs: readonly Config[];
	readonly graded: RunPoll;
	readonly outcome: AnswerOutcome;
	readonly timedOut: boolean;
	readonly auditedShare: number;
	readonly streak: number;
};

const gradeAnswer = (
	state: RunState,
	poll: RunPoll,
	optionIds: readonly string[],
	elapsedMs?: number
): AnswerGrade => {
	const audits = auditsOf(state);
	const configs = liveConfigsOf(state);
	const graded = mirrorsPolls(audits) ? mirrorPoll(poll) : poll;
	const answeredOutcome = answerOutcome(graded, optionIds);
	const limitMs = auditTimeLimitMs(audits, state.window.answered);
	const timedOut =
		limitMs !== undefined && elapsedMs !== undefined && elapsedMs > limitMs;
	const outcome: AnswerOutcome = timedOut ? "wrong" : answeredOutcome;
	const auditedShare = timedOut
		? 0
		: auditScoreShare(audits, coverageShare(graded, optionIds));
	return {
		audits,
		configs,
		graded,
		outcome,
		timedOut,
		auditedShare,
		streak: nextStreak(state.streak, outcome),
	};
};

type AnswerLedger = {
	readonly earnedCoverage: number;
	readonly coverageLoss: number;
	readonly breakdown: CoverageBreakdown;
	readonly factors?: CoverageFactors;
	readonly faucetKb: number;
	readonly burnKb: number;
};

export const answerContextFor = (
	state: RunState,
	poll: RunPoll
): AnswerContext => ({
	category: poll.category,
	answeredBefore: state.window.answered,
	cachedHits: cachedHitsFor(state.allAnswered ?? [], poll.category),
});

const scoreAnswer = (
	state: RunState,
	poll: RunPoll,
	grade: AnswerGrade
): AnswerLedger => {
	const { audits, configs, auditedShare } = grade;
	const answerContext = answerContextFor(state, poll);
	const rawFaucet =
		grade.outcome === "correct" ? faucetKbPerCorrect(configs) : 0;
	const faucetKb = Math.min(
		rawFaucet,
		faucetRemainingKb(state.faucetEarnedKb ?? 0)
	);
	return {
		earnedCoverage: coverageForAnswer(
			configs,
			answerContext,
			auditedShare,
			state.streak
		),
		coverageLoss: 0,
		breakdown: coverageBreakdownForAnswer(
			configs,
			answerContext,
			auditedShare,
			state.streak
		),
		factors: coverageFactorsForAnswer(configs, answerContext, auditedShare),
		faucetKb,
		burnKb: Math.min(
			auditBurnKb(
				audits,
				grade.outcome === "wrong",
				occupiedSlots(state.build.configs)
			),
			Math.max(0, state.storage + faucetKb)
		),
	};
};

const answeredPollFrom = (
	poll: RunPoll,
	optionIds: readonly string[],
	grade: AnswerGrade,
	ledger: AnswerLedger,
	elapsedMs?: number
): AnsweredPoll => ({
	id: poll.id,
	question: poll.question,
	category: poll.category,
	outcome: grade.outcome,
	picked: grade.graded.options
		.filter((option) => optionIds.includes(option.id))
		.map((option) => option.label),
	correct: grade.graded.options
		.filter((option) => option.correct)
		.map((option) => option.label),
	codeBlock: poll.codeBlock,
	explanation: poll.explanation,
	author: poll.author,
	options: poll.options.map((option) => option.label),
	answerType: grade.graded.answerType,
	coverageEarned: ledger.earnedCoverage,
	coverageLost: ledger.coverageLoss > 0 ? ledger.coverageLoss : undefined,
	coverageBreakdown: ledger.breakdown,
	coverageFactors: ledger.factors,
	faucetKb: ledger.faucetKb > 0 ? ledger.faucetKb : undefined,
	elapsedMs,
	timedOut: grade.timedOut ? true : undefined,
});

const applyAnswer = (
	state: RunState,
	poll: RunPoll,
	grade: AnswerGrade,
	ledger: AnswerLedger,
	answered: AnsweredPoll
): RunState => {
	const correct = grade.outcome === "correct";
	const categoryBefore = state.coverageByCategory[poll.category] ?? 0;
	const categoryAfter = roundToOneDecimal(
		Math.max(0, categoryBefore + ledger.earnedCoverage - ledger.coverageLoss)
	);
	const tally = state.window.byCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};

	const window: GateWindow = {
		correct: state.window.correct + (correct ? 1 : 0),
		answered: state.window.answered + 1,
		unitsEarned: roundToTwoDecimals(
			Math.max(0, state.window.unitsEarned + ledger.earnedCoverage)
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
		linted: state.window.linted ?? 0,
	};

	return {
		...state,
		window,
		manualDisabled: [],
		rebasedThisGate: undefined,
		streak: grade.streak,
		storage: cappedStorage(
			addStorage(state.storage, ledger.faucetKb, state.storagePlan ?? 0) -
				ledger.burnKb,
			state.storagePlan ?? 0
		),
		faucetEarnedKb: (state.faucetEarnedKb ?? 0) + ledger.faucetKb,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + ledger.faucetKb,
		coverage: roundToOneDecimal(
			Math.max(0, state.coverage + categoryAfter - categoryBefore)
		),
		coverageByCategory: {
			...state.coverageByCategory,
			[poll.category]: categoryAfter,
		},
		answeredThisGate: [...state.answeredThisGate, answered],
		allAnswered: [...(state.allAnswered ?? []), answered],
		log:
			ledger.burnKb > 0
				? withLog(state, `Storage leaked -${ledger.burnKb}KB.`)
				: state.log,
	};
};

const countAutoUpgrade = (
	applied: RunState,
	before: RunState,
	outcome: AnswerOutcome
): RunState => {
	const merged = autoUpgradeOnAnswer(
		applied.build.configs,
		before.autoUpgradeProgress ?? 0,
		outcome,
		`dependabot-${before.gatesCleared}-${(before.allAnswered ?? []).length}`
	);
	if (!merged.bumped)
		return { ...applied, autoUpgradeProgress: merged.progress };
	return {
		...applied,
		build: withBuild(applied.build, merged.configs),
		autoUpgradeProgress: merged.progress,
		autoUpgradedConfigId: merged.bumped.id,
		autoUpgradedByConfigId: merged.by?.id,
		log: withLog(
			applied,
			`Dependabot bumped ${merged.bumped.label} to L${merged.bumped.level ?? 1} — merged without review.`
		),
	};
};

export const answer = (
	state: RunState,
	optionIds: readonly string[],
	elapsedMs?: number
): RunState => {
	if (optionIds.length === 0) return state;
	if (gateWindowComplete(state)) return state;
	const poll = state.polls[state.currentIndex];
	if (!poll) return state;

	const grade = gradeAnswer(state, poll, optionIds, elapsedMs);
	const ledger = scoreAnswer(state, poll, grade);
	const answered = answeredPollFrom(poll, optionIds, grade, ledger, elapsedMs);
	const applied = applyAnswer(state, poll, grade, ledger, answered);
	const counted = countAutoUpgrade(applied, state, grade.outcome);

	// The answer that fills the window leaves `currentIndex` on its own poll, so
	// the reveal the player is reading still belongs to the gate that asked it.
	if (gateWindowComplete(counted)) return counted;
	return {
		...counted,
		currentIndex: state.currentIndex + 1,
		status: "answering",
	};
};

export const closeGate = (state: RunState): RunState =>
	gateWindowComplete(state)
		? closeWindow(state, state.currentIndex + 1)
		: state;

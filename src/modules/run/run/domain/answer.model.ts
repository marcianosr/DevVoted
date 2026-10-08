import {
	type Config,
	escrowKbPerCorrect,
	chainKbFor,
	faucetKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import { autoUpgradeOnAnswer } from "~/modules/run/config/domain/autoUpgrade.model";
import {
	type AnswerContext,
	type GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { answerPayoutFor } from "~/modules/run/build/domain/answerPayout.model";
import { occupiedSlots } from "~/modules/run/build/domain/build.model";
import {
	type CoverageBreakdown,
	type CoverageFactors,
	creditFor,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type Audit,
	auditBurnKb,
	auditScoreShare,
	auditsHideAnswerType,
	auditTimeLimitMs,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";
import { approvedPollOf } from "~/modules/run/run/domain/approval.model";
import { strictSettlementFor } from "~/modules/run/run/domain/strict.model";
import {
	faucetRemainingKb,
	roundToOneDecimal,
	roundToTwoDecimals,
} from "~/modules/run/run/domain/rules.model";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
	type RunOption,
	type RunPoll,
	answerOutcome,
	cachedHitsFor,
	chainLengthOf,
	coverageShare,
	mirrorPoll,
	nextStreak,
} from "~/modules/run/run/domain/runPoll.model";
import {
	addStorage,
	auditsOf,
	liveConfigsOf,
	type RunState,
	withLog,
	withBuild,
} from "~/modules/run/run/domain/run.model";

import {
	settleGate,
	gateWindowComplete,
} from "~/modules/run/run/domain/gateClose.model";

type AnswerGrade = {
	readonly audits: readonly Audit[];
	readonly configs: readonly Config[];
	readonly graded: RunPoll;
	readonly outcome: AnswerOutcome;
	readonly timedOut: boolean;
	readonly auditedShare: number;
	readonly streak: number;
	readonly elapsedMs?: number;
};

export const gradedPollFor = (state: RunState, poll: RunPoll): RunPoll =>
	mirrorsPolls(auditsOf(state)) ? mirrorPoll(poll) : poll;

export const creditedAnswerTypeFor = (
	state: RunState,
	graded: Pick<RunPoll, "answerType">
): AnswerType =>
	auditsHideAnswerType(auditsOf(state)) ? "single" : graded.answerType;

export const pollCreditFor = (state: RunState, poll: RunPoll): number =>
	creditFor(creditedAnswerTypeFor(state, gradedPollFor(state, poll)));

const gradeAnswer = (
	state: RunState,
	poll: RunPoll,
	optionIds: readonly string[],
	elapsedMs?: number
): AnswerGrade => {
	const audits = auditsOf(state);
	const configs = liveConfigsOf(state);
	const graded = gradedPollFor(state, poll);
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
		elapsedMs,
	};
};

type AnswerLedger = {
	readonly earnedCoverage: number;
	readonly coverageLoss: number;
	readonly breakdown: CoverageBreakdown;
	readonly factors?: CoverageFactors;
	readonly faucetKb: number;
	readonly escrowKb: number;
	readonly burnKb: number;
};

export const answerContextFor = (
	state: RunState,
	poll: RunPoll,
	elapsedMs?: number
): AnswerContext => ({
	category: poll.category,
	answerType: creditedAnswerTypeFor(state, poll),
	answeredBefore: state.window.answered,
	cachedHits: cachedHitsFor(state.allAnswered ?? [], poll.category),
	previouslyMissed: poll.missedBefore === true,
	...(elapsedMs === undefined ? {} : { elapsedMs }),
});

const scoreAnswer = (state: RunState, grade: AnswerGrade): AnswerLedger => {
	const { audits, configs, auditedShare } = grade;
	const answerContext = answerContextFor(state, grade.graded, grade.elapsedMs);
	const wager = strictSettlementFor(
		configs,
		state.strictArmed === true,
		grade.outcome
	);
	const rawFaucet =
		grade.outcome === "correct"
			? faucetKbPerCorrect(configs) +
				chainKbFor(configs, chainLengthOf(state.allAnswered ?? []) + 1)
			: 0;
	const faucetKb = Math.min(
		rawFaucet,
		faucetRemainingKb(state.faucetEarnedKb ?? 0)
	);
	const payout = answerPayoutFor(
		configs,
		answerContext,
		auditedShare,
		wager.bonus
	);
	return {
		earnedCoverage: payout.earned,
		coverageLoss: wager.loss,
		breakdown: payout.breakdown,
		factors: payout.factors,
		faucetKb,
		escrowKb: grade.outcome === "correct" ? escrowKbPerCorrect(configs) : 0,
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

type ExplainedOption = RunOption & { readonly explanation: string };

const isExplained = (option: RunOption): option is ExplainedOption =>
	option.explanation !== undefined;

const optionExplanationsOf = (
	options: readonly RunOption[]
): Readonly<Record<string, string>> | undefined => {
	const explained = options.filter(isExplained);
	if (explained.length === 0) return undefined;
	return Object.fromEntries(
		explained.map((option) => [option.label, option.explanation])
	);
};

const optionExplanationsUnless = (
	poll: RunPoll,
	graded: RunPoll
): Readonly<Record<string, string>> | undefined =>
	graded === poll ? optionExplanationsOf(poll.options) : undefined;

const answeredPollFrom = (
	poll: RunPoll,
	optionIds: readonly string[],
	grade: AnswerGrade,
	ledger: AnswerLedger,
	gate: number,
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
	optionExplanations: optionExplanationsUnless(poll, grade.graded),
	answerType: grade.graded.answerType,
	gate,
	coverageEarned: ledger.earnedCoverage,
	coverageLost: ledger.coverageLoss > 0 ? ledger.coverageLoss : undefined,
	coverageBreakdown: ledger.breakdown,
	coverageFactors: ledger.factors,
	faucetKb: ledger.faucetKb > 0 ? ledger.faucetKb : undefined,
	elapsedMs,
	timedOut: grade.timedOut ? true : undefined,
});

const accuracyEarnedOf = (ledger: AnswerLedger, credit: number): number =>
	(ledger.factors?.correct ?? 0) * credit;

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

	const credit = pollCreditFor(state, poll);
	const window: GateWindow = {
		correct: state.window.correct + (correct ? 1 : 0),
		answered: state.window.answered + 1,
		unitsEarned: roundToTwoDecimals(
			Math.max(
				0,
				state.window.unitsEarned + ledger.earnedCoverage - ledger.coverageLoss
			)
		),
		accuracyEarned:
			state.window.accuracyEarned + accuracyEarnedOf(ledger, credit),
		accuracyAvailable: state.window.accuracyAvailable + credit,
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
		strictArmed: undefined,
		rebasedThisGate: undefined,
		streak: grade.streak,
		storage: addStorage(state.storage, ledger.faucetKb - ledger.burnKb),
		faucetEarnedKb: (state.faucetEarnedKb ?? 0) + ledger.faucetKb,
		faucetThisGateKb: (state.faucetThisGateKb ?? 0) + ledger.faucetKb,
		pendingKb: (state.pendingKb ?? 0) + ledger.escrowKb,
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
	const ledger = scoreAnswer(state, grade);
	const answered = answeredPollFrom(
		poll,
		optionIds,
		grade,
		ledger,
		state.gatesCleared,
		elapsedMs
	);
	const applied = applyAnswer(state, poll, grade, ledger, answered);
	return advancedPast(countAutoUpgrade(applied, state, grade.outcome), state);
};

const skippedPollFrom = (
	poll: RunPoll,
	graded: RunPoll,
	gate: number
): AnsweredPoll => ({
	id: poll.id,
	question: poll.question,
	category: poll.category,
	outcome: "skipped",
	picked: [],
	correct: graded.options
		.filter((option) => option.correct)
		.map((option) => option.label),
	codeBlock: poll.codeBlock,
	explanation: poll.explanation,
	author: poll.author,
	options: poll.options.map((option) => option.label),
	optionExplanations: optionExplanationsUnless(poll, graded),
	answerType: graded.answerType,
	gate,
	coverageEarned: 0,
});

const applySkip = (
	state: RunState,
	poll: RunPoll,
	skipped: AnsweredPoll
): RunState => {
	const tally = state.window.byCategory[poll.category] ?? {
		seen: 0,
		correct: 0,
	};

	return {
		...state,
		window: {
			...state.window,
			answered: state.window.answered + 1,
			byCategory: {
				...state.window.byCategory,
				[poll.category]: { ...tally, seen: tally.seen + 1 },
			},
		},
		manualDisabled: [],
		strictArmed: undefined,
		rebasedThisGate: undefined,
		streak: nextStreak(state.streak, "skipped"),
		answeredThisGate: [...state.answeredThisGate, skipped],
		allAnswered: [...(state.allAnswered ?? []), skipped],
	};
};

const advancedPast = (counted: RunState, before: RunState): RunState =>
	gateWindowComplete(counted)
		? counted
		: {
				...counted,
				currentIndex: before.currentIndex + 1,
				status: "answering",
			};

export const skip = (state: RunState): RunState => {
	if (gateWindowComplete(state)) return state;
	const poll = state.polls[state.currentIndex];
	if (!poll) return state;
	if (approvedPollOf(state) !== undefined) return state;

	const skipped = skippedPollFrom(
		poll,
		gradedPollFor(state, poll),
		state.gatesCleared
	);
	const applied = applySkip(state, poll, skipped);

	return advancedPast(countAutoUpgrade(applied, state, "skipped"), state);
};

export const closeGate = (state: RunState): RunState =>
	gateWindowComplete(state) ? settleGate(state, state.currentIndex + 1) : state;

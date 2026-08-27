import {
	type Config,
	faucetKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import { autoUpgradeOnClear } from "~/modules/run/config/domain/autoUpgrade.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";
import { billSubscriptionsOnClear } from "~/modules/run/config/domain/subscription.model";
import {
	type AnswerContext,
	type GateWindow,
} from "~/modules/run/config/domain/effect.model";
import {
	type CoverageBreakdown,
	type CoverageFactors,
	coverageBreakdownForAnswer,
	coverageFactorsForAnswer,
	coverageForAnswer,
	coverageLossFor,
	extraPickPayoutFor,
	gateClearPayout,
	slotsFor,
	streakCapStepsFor,
	storageInterestFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	failStripQuotaFor,
	gateDemandFor,
	gatePassed,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditBurnKb,
	auditScoreShare,
	auditTimeLimitMs,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	faucetRemainingKb,
	gateBaseMultiplier,
	isStakeFatal,
	pollDifficultyMultiplier,
	roundToOneDecimal,
	SLICE_WINDOW,
	storagePlanFor,
	STORAGE_PLANS,
	streakMultiplier,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type RunPoll,
	answerOutcome,
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
	shopDraft,
	withLog,
	withPipeline,
} from "~/modules/run/run/domain/run.model";

const clearLine = (gateNumber: number, reward: number): string => {
	const swatch = swatchForGate(gateNumber);
	const earned = swatch ? `, ${swatch.name} earned` : "";
	return `Gate ${gateNumber} cleared! +${reward}KB${earned}.`;
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

type AnswerGrade = {
	readonly audits: readonly Audit[];
	readonly configs: readonly Config[];
	readonly graded: RunPoll;
	readonly outcome: AnswerOutcome;
	readonly timedOut: boolean;
	readonly auditedShare: number;
	readonly scoredShare: number;
	readonly streak: number;
};

const gradeAnswer = (
	state: RunState,
	poll: RunPoll,
	optionIds: readonly string[],
	elapsedMs?: number
): AnswerGrade => {
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
	// Scoring follows the audited share; streaks and the faucet stay keyed to true correctness.
	const auditedShare = timedOut
		? 0
		: auditScoreShare(audits, coverageShare(graded, optionIds));
	const gateMultiplier = gateBaseMultiplier(state.gatesCleared);
	const difficultyMultiplier = pollDifficultyMultiplier(
		graded.options.length,
		graded.answerType === "multiple"
	);
	return {
		audits,
		configs,
		graded,
		outcome,
		timedOut,
		auditedShare,
		scoredShare: auditedShare * gateMultiplier * difficultyMultiplier,
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

const scoreAnswer = (
	state: RunState,
	poll: RunPoll,
	grade: AnswerGrade
): AnswerLedger => {
	const { audits, configs, auditedShare, scoredShare } = grade;
	const answerContext: AnswerContext = {
		category: poll.category,
		answeredBefore: state.window.answered,
	};
	const streakBonus = streakMultiplier(
		grade.streak,
		streakCapStepsFor(configs)
	);
	const coverageLoss =
		auditedShare > 0 ? 0 : coverageLossFor(configs, state.gatesCleared);
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
			scoredShare,
			streakBonus
		),
		coverageLoss,
		breakdown: coverageBreakdownForAnswer(
			configs,
			answerContext,
			scoredShare,
			streakBonus,
			coverageLoss
		),
		factors: coverageFactorsForAnswer(
			configs,
			answerContext,
			scoredShare,
			streakBonus
		),
		faucetKb,
		// Floors at 0: insolvency stays non-lethal (ADR-023).
		burnKb: Math.min(
			auditBurnKb(audits, grade.outcome === "wrong"),
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
	// The mirrored expectation, so the review agrees with the score.
	correct: grade.graded.options
		.filter((option) => option.correct)
		.map((option) => option.label),
	codeBlock: poll.codeBlock,
	explanation: poll.explanation,
	options: poll.options.map((option) => option.label),
	answerType: grade.graded.answerType,
	coverageEarned: ledger.earnedCoverage,
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
		// Floored, so a bad opening can be climbed out of but never banks a negative (ADR-035).
		coverageGained: roundToOneDecimal(
			Math.max(
				0,
				state.window.coverageGained +
					ledger.earnedCoverage -
					ledger.coverageLoss
			)
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

	return widened({
		...state,
		window,
		manualDisabled: [],
		streak: grade.streak,
		storage: addStorage(state.storage, ledger.faucetKb) - ledger.burnKb,
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
	});
};

export const answer = (
	state: RunState,
	optionIds: readonly string[],
	elapsedMs?: number
): RunState => {
	if (optionIds.length === 0) return state;
	const poll = state.polls[state.currentIndex];
	if (!poll) return state;

	const grade = gradeAnswer(state, poll, optionIds, elapsedMs);
	const ledger = scoreAnswer(state, poll, grade);
	const answered = answeredPollFrom(poll, optionIds, grade, ledger, elapsedMs);
	const applied = applyAnswer(state, poll, grade, ledger, answered);

	const nextIndex = state.currentIndex + 1;
	if (applied.window.answered >= SLICE_WINDOW)
		return closeWindow(applied, nextIndex);
	return { ...applied, currentIndex: nextIndex, status: "answering" };
};

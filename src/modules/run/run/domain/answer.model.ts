import {
	type Config,
	escrowKbPerCorrect,
	faucetKbPerCorrect,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { autoUpgradeOnAnswer } from "~/modules/run/config/domain/autoUpgrade.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";
import { billSubscriptionsOnClear } from "~/modules/run/config/domain/subscription.model";
import {
	type AnswerContext,
	type GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { answerPayoutFor } from "~/modules/run/build/domain/answerPayout.model";
import {
	type Build,
	billableSlotsOf,
	catcherFor,
	extraPickPayoutFor,
	gateClearPayout,
	occupiedSlots,
	upkeepForBuild,
	storageInterestFor,
	stripConfig,
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
	bandAtClose,
	failPeelQuotaFor,
	type GateRuling,
	gateRulingFor,
	gateDemandFor,
	runCoverageAtClose,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditBurnKb,
	auditScoreShare,
	auditsHideAnswerType,
	auditTimeLimitMs,
	mirrorsPolls,
} from "~/modules/run/gate/domain/audit.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { estimatePayoutUnits } from "~/modules/run/run/domain/estimate.model";
import { slaUpliftKb } from "~/modules/run/run/domain/sla.model";
import { handAudit } from "~/modules/run/run/domain/heldAudit.model";
import { strictSettlementFor } from "~/modules/run/run/domain/strict.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	escrowCommitKb,
	faucetRemainingKb,
	highestAffordableSpace,
	isPeelFatal,
	upkeepForSpace,
	roundToOneDecimal,
	roundToTwoDecimals,
	SLICE_WINDOW,
	VICTORY_GATE,
	FLOOR_CORRECT,
	INCIDENT_SURVIVAL_KB,
} from "~/modules/run/run/domain/rules.model";
import {
	type AnsweredPoll,
	type AnswerOutcome,
	type AnswerType,
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
	incidentsAt,
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

type UpkeepSettlement = {
	readonly paidKb: number;
	/**
	 * Set only when the balance fell short: the space the payment actually
	 * bought. The build cannot be dropped to fit it — the rung follows the build
	 * (ADR-098) — so it becomes a cap the shop door holds the run to until the
	 * build fits, which is ADR-082 Decision 4's remedy with the rung derived.
	 */
	readonly droppedTo?: number;
};

const settleUpkeep = (build: Build, balanceKb: number): UpkeepSettlement => {
	const owed = upkeepForBuild(build);
	if (owed <= balanceKb) return { paidKb: owed };

	const affordable = highestAffordableSpace(balanceKb);
	return { paidKb: upkeepForSpace(affordable), droppedTo: affordable };
};

const missedLineFor = (
	ruling: GateRuling,
	gateNumber: number,
	correct: number,
	heldCoverage: number,
	demand: number
): string =>
	ruling.closing === "held" && ruling.heldBy === "floor"
		? `Gate ${gateNumber} failed: ${correct} of ${SLICE_WINDOW} right, ${FLOOR_CORRECT} needed.`
		: `Gate ${gateNumber} failed: the run reads ${heldCoverage}% of ${demand}%.`;

/** The gate's five results are in. It owes a close, not another answer. */
export const gateWindowComplete = (state: RunState): boolean =>
	state.window.answered >= SLICE_WINDOW;

const closeWindow = (state: RunState, nextIndex: number): RunState => {
	const gateNumber = state.gatesCleared;

	const schedule = scheduleOf(state);
	const committed = state.estimatedCorrect;
	const estimateUnits = estimatePayoutUnits(
		state.build.configs,
		committed,
		state.window.correct,
		state.gatesCleared
	);
	const settledEstimate = {
		estimatedCorrect: undefined,
		estimateThisGateUnits: committed === undefined ? undefined : estimateUnits,
	};

	// SLA cannot settle here the way the estimate does: it is a function OF the
	// band, so it has to wait until the close has read one. Only the clearing
	// path can pay it, and every other path drops the promise unpaid.
	const promised = state.slaBand;
	const droppedSla = { slaBand: undefined, slaUpliftKb: undefined };

	// The bet settles INSIDE the window rather than beside it: a won bet has to
	// be able to lift a gate over its own line, and it cannot once the band has
	// already been read off the window.
	const unitsThisGate = state.window.unitsEarned + estimateUnits;

	// The swatch is the window's own prize, not the clear's: a flawless window
	// earns it even where cumulative coverage lands the gate short (ADR-080).
	// A retried gate can come up flawless twice, so the gate is stamped once.
	const swatchGates = state.swatchGatesEarned ?? [];
	const settledSwatch = {
		swatchGatesEarned:
			state.window.correct >= SLICE_WINDOW && !swatchGates.includes(gateNumber)
				? [...swatchGates, gateNumber]
				: swatchGates,
	};

	// Database's open transaction. Only a cleared gate turns it into storage;
	// every other close rolls it back, and no cap room is spent either way until
	// the commit lands.
	const pending = state.pendingKb ?? 0;
	const rolledBackEscrow = {
		pendingKb: 0,
		escrowCommittedKb: 0,
		escrowRolledBackKb: pending,
	};

	const close: GateClose = {
		build: state.build,
		bankedUnits: state.bankedUnits,
		unitsThisGate,
		correctThisGate: state.window.correct,
		gatesCleared: state.gatesCleared,
		schedule,
	};
	const ruling = gateRulingFor(close);
	const closingBand = bandAtClose(close);
	const recordedClose = {
		lastClose: {
			gate: gateNumber,
			band: closingBand.id,
			cleared: ruling.closing === "cleared",
		},
	};
	const heldCoverage = roundToOneDecimal(percentOf(runCoverageAtClose(close)));

	if (ruling.closing !== "cleared") {
		const attempts = state.gateAttempts ?? 0;
		// Drawn on the build that closed the gate, the catcher included: it is the
		// first thing the peel takes, and its own weight settles that much of the
		// debt (ADR-096).
		const quota = failPeelQuotaFor(
			state.build.configs,
			gateNumber,
			schedule,
			attempts
		);
		const occupied = occupiedSlots(state.build.configs);
		const caughtBy =
			ruling.closing === "held" && ruling.heldBy === "catch"
				? catcherFor(state.build.configs)
				: undefined;
		const caught =
			caughtBy === undefined
				? undefined
				: {
						build: stripConfig(state.build, caughtBy.id),
						owed: Math.max(0, quota - slotsOf(caughtBy)),
						deletedConfigs: [caughtBy],
						caughtFatalBy: caughtBy.label,
					};
		const demand = gateDemandFor(
			state.build.configs,
			state.gatesCleared,
			schedule
		);
		const missed = missedLineFor(
			ruling,
			gateNumber,
			state.window.correct,
			heldCoverage,
			demand
		);

		// DANGER shuts the gate for good: no retry, no peel, no choice (ADR-076).
		if (ruling.closing === "fatal")
			return {
				...state,
				...settledEstimate,
				...settledSwatch,
				...rolledBackEscrow,
				...droppedSla,
				...recordedClose,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(state, `${missed} The gate shut on it. Run over.`),
			};

		// A catch that still let the build be emptied would die in exactly the
		// thin, deep build it was bought for.
		if (caught === undefined && isPeelFatal(quota, occupied))
			return {
				...state,
				...settledEstimate,
				...settledSwatch,
				...rolledBackEscrow,
				...droppedSla,
				...recordedClose,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(
					state,
					`${missed} It peels ${quota} — the build fills ${occupied}. Run over.`
				),
			};
		const owed = caught?.owed ?? quota;
		return {
			...state,
			...settledEstimate,
			...settledSwatch,
			...rolledBackEscrow,
			...droppedSla,
			...recordedClose,
			...(caught === undefined
				? {}
				: {
						build: caught.build,
						deletedConfigs: caught.deletedConfigs,
						caughtFatalBy: caught.caughtFatalBy,
					}),
			currentIndex: nextIndex,
			status: "awaiting-strip",
			autoUpgradeProgress: 0,
			gateAttempts: attempts + 1,
			heldBy: ruling.heldBy,
			peelRefundKb: 0,
			peelSlotsRemaining: owed,
			log: withLog(
				state,
				...(caught === undefined
					? []
					: [
							`${caught.caughtFatalBy} caught it — the gate holds instead of ending the run, and the catch is spent.`,
						]),
				owed === 0
					? `${missed} This gate takes nothing — read it back, then shop and run it again.`
					: `${missed} Free up ${owed} slot${owed > 1 ? "s" : ""} and run it again.`
			),
		};
	}

	const interest = storageInterestFor(state.build.configs, state.storage);
	const extraPicks = (state.window.budget ?? 0) - state.window.answered;
	const extraPickKb = extraPickPayoutFor(state.build.configs, extraPicks);
	const totalUnits = state.bankedUnits + unitsThisGate;
	const banked = roundToTwoDecimals(
		bankableUnits(totalUnits, state.gatesCleared)
	);
	const overflowKb = surplusPayoutKb(totalUnits, state.gatesCleared);
	const clearKb = gateClearPayout(
		state.build.configs,
		state.window.correct,
		state.gatesCleared,
		state.streak
	);
	// The commit is clamped here rather than at the answer, so the run cap
	// meters what a transaction paid and never what it merely held.
	const committedKb = escrowCommitKb(pending, state.faucetEarnedKb ?? 0);
	// A percentage of the gate's own prize, which is the figure prep already
	// printed against each band — never of the interest or the faucet, which the
	// promise said nothing about.
	const upliftKb = slaUpliftKb(
		state.build.configs,
		promised,
		closingBand,
		clearKb
	);
	const survivalKb =
		INCIDENT_SURVIVAL_KB * incidentsAt(state, gateNumber).length;
	const handed = handAudit(state, closingBand.id, gateNumber);
	const reward =
		clearKb +
		interest +
		extraPickKb +
		overflowKb +
		committedKb +
		upliftKb +
		survivalKb;
	const rewarded = addStorage(state.storage, reward);
	const bill = settleUpkeep(state.build, rewarded);
	const cleared: RunState = {
		...state,
		...settledEstimate,
		...settledSwatch,
		...recordedClose,
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
		heldBy: undefined,
		gatesCleared: state.gatesCleared + 1,
		clearedGate: gateNumber,
		redoGate: undefined,
		storage: Math.max(0, rewarded - bill.paidKb),
		upkeepBilledKb: bill.paidKb,
		upkeepPaidKb: (state.upkeepPaidKb ?? 0) + bill.paidKb,
		gateRewardKb: reward,
		clearThisGateKb: clearKb,
		overflowThisGateKb: overflowKb,
		streakAtClose: state.streak,
		storageBeforeClearKb: state.storage,
		interestThisGateKb: interest,
		extraPickThisGateKb: extraPickKb,
		faucetEarnedKb: (state.faucetEarnedKb ?? 0) + committedKb,
		pendingKb: 0,
		escrowCommittedKb: committedKb,
		escrowRolledBackKb: 0,
		slaBand: undefined,
		slaUpliftKb: promised === undefined ? undefined : upliftKb,
		incidentSurvivalKb: survivalKb,
		...handed,
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
	const finalBuild =
		billed.configs === cleared.build.configs
			? cleared.build
			: withBuild(cleared.build, billed.configs);

	/**
	 * Read after the subscriptions settle, because a lapse sheds weight too: a
	 * build the lapse already shrank into the space the bill covered is not over
	 * it, and carrying the cap would shut the door on a run that already fits.
	 */
	const overCovered =
		bill.droppedTo !== undefined &&
		billableSlotsOf(finalBuild) > bill.droppedTo;

	return {
		...cleared,
		build: finalBuild,
		spaceDroppedTo: overCovered ? bill.droppedTo : undefined,
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
			...(bill.paidKb > 0 ? [`Build space billed (-${bill.paidKb}KB).`] : []),
			...(overCovered
				? [
						`The space went unpaid — the bill covered ${bill.droppedTo}. Sell or drop to fit it before the shop lets you out.`,
					]
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

export const gradedPollFor = (state: RunState, poll: RunPoll): RunPoll =>
	mirrorsPolls(auditsOf(state)) ? mirrorPoll(poll) : poll;

/**
 * What the answer is PRICED as, which 207 Multi-Status flattens to a single.
 * The poll keeps its own type for grading; only the credit reads this, so a
 * select-all still has to be named in full to pay anything at all.
 */
export const creditedAnswerTypeFor = (
	state: RunState,
	poll: RunPoll
): AnswerType =>
	auditsHideAnswerType(auditsOf(state)) ? "single" : poll.answerType;

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
	};
};

type AnswerLedger = {
	readonly earnedCoverage: number;
	readonly coverageLoss: number;
	readonly breakdown: CoverageBreakdown;
	readonly factors?: CoverageFactors;
	readonly faucetKb: number;
	/** Pledged into the open transaction, not paid. Never reaches `storage` here. */
	readonly escrowKb: number;
	readonly burnKb: number;
};

export const answerContextFor = (
	state: RunState,
	poll: RunPoll
): AnswerContext => ({
	category: poll.category,
	answerType: creditedAnswerTypeFor(state, poll),
	answeredBefore: state.window.answered,
	cachedHits: cachedHitsFor(state.allAnswered ?? [], poll.category),
	previouslyMissed: poll.missedBefore === true,
});

const scoreAnswer = (state: RunState, grade: AnswerGrade): AnswerLedger => {
	const { audits, configs, auditedShare } = grade;
	const answerContext = answerContextFor(state, grade.graded);
	const wager = strictSettlementFor(
		configs,
		state.strictArmed === true,
		grade.outcome
	);
	const rawFaucet =
		grade.outcome === "correct" ? faucetKbPerCorrect(configs) : 0;
	const faucetKb = Math.min(
		rawFaucet,
		faucetRemainingKb(state.faucetEarnedKb ?? 0)
	);
	const payout = answerPayoutFor(
		configs,
		answerContext,
		auditedShare,
		state.streak,
		wager.bonus
	);
	return {
		earnedCoverage: payout.earned,
		coverageLoss: wager.loss,
		breakdown: payout.breakdown,
		factors: payout.factors,
		faucetKb,
		// Unclamped on purpose: the cap meters the commit, so a transaction that
		// rolls back must leave the run's cap room exactly as it found it.
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
			Math.max(
				0,
				state.window.unitsEarned + ledger.earnedCoverage - ledger.coverageLoss
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

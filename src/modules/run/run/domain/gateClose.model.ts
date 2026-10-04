import { slotsOf } from "~/modules/run/config/domain/config.model";
import { decayOnClear } from "~/modules/run/config/domain/decay.model";
import { billSubscriptionsOnClear } from "~/modules/run/config/domain/subscription.model";
import {
	catcherFor,
	extraPickPayoutFor,
	gateClearPayout,
	perfectBonusOnClear,
	occupiedSlots,
	storageInterestFor,
} from "~/modules/run/build/domain/build.model";
import {
	buildSpaceOf,
	settleUpkeep,
} from "~/modules/run/build/domain/buildSpace.model";
import {
	accuracyBonusAfter,
	accuracyMultiplierFor,
	headStartFor,
	surplusPayoutKb,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	closingBandFor,
	coversEveryChange,
	failPeelQuotaFor,
	gateDemandFor,
	gateRulingFor,
	heldAtClose,
	ladderAtClose,
	type GateClose,
	accuracyOf,
	windowOutputOf,
	type WindowTally,
} from "~/modules/run/gate/domain/gate.model";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import { estimatePayoutUnits } from "~/modules/run/run/domain/estimate.model";
import { slaUpliftKb } from "~/modules/run/run/domain/sla.model";
import { dealIncidentOffer } from "~/modules/run/run/domain/heldAudit.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	escrowCommitKb,
	isPeelFatal,
	roundToTwoDecimals,
	SLICE_WINDOW,
	VICTORY_GATE,
	INCIDENT_SURVIVAL_KB,
} from "~/modules/run/run/domain/rules.model";
import {
	addStorage,
	closesOf,
	freshWindow,
	incidentsAt,
	type LastClose,
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

const missedLineFor = (
	gateNumber: number,
	heldCoverage: number,
	demand: number
): string =>
	`Gate ${gateNumber} failed: the run reads ${heldCoverage}% of ${demand}%.`;

export const gateWindowComplete = (state: RunState): boolean =>
	state.window.answered >= SLICE_WINDOW;

const estimateUnitsAt = (state: RunState, correct: number): number =>
	estimatePayoutUnits(
		state.build.configs,
		state.estimatedCorrect,
		correct,
		state.gatesCleared
	);

const gateCloseAt = (
	state: RunState,
	window: WindowTally,
	correctThisGate: number
): GateClose => ({
	build: state.build,
	headStartUnits: state.headStartUnits,
	unitsThisGate:
		windowOutputOf(window, state.accuracyBonus) +
		estimateUnitsAt(state, correctThisGate),
	correctThisGate,
	gatesCleared: state.gatesCleared,
	schedule: scheduleOf(state),
});

export const missPeelFor = (state: RunState): number =>
	failPeelQuotaFor(
		state.build.configs,
		state.gatesCleared,
		scheduleOf(state),
		state.gateAttempts ?? 0
	);

export const settleGate = (state: RunState, nextIndex: number): RunState => {
	const gateNumber = state.gatesCleared;

	const schedule = scheduleOf(state);
	const committed = state.estimatedCorrect;
	const estimateUnits = estimateUnitsAt(state, state.window.correct);
	const settledCommitments = {
		estimatedCorrect: undefined,
		estimateThisGateUnits: committed === undefined ? undefined : estimateUnits,
		approvedPollId: undefined,
	};

	const promised = state.slaBand;
	const droppedSla = { slaBand: undefined, slaUpliftKb: undefined };

	const pending = state.pendingKb ?? 0;
	const rolledBackEscrow = {
		pendingKb: 0,
		escrowCommittedKb: 0,
		escrowRolledBackKb: pending,
	};

	const close = gateCloseAt(state, state.window, state.window.correct);
	const swatchGates = state.swatchGatesEarned ?? [];
	const settledSwatch = {
		swatchGatesEarned:
			coversEveryChange(close) && !swatchGates.includes(gateNumber)
				? [...swatchGates, gateNumber]
				: swatchGates,
	};
	const { unitsThisGate } = close;
	const ruling = gateRulingFor(close);
	const closingBand = closingBandFor(close);
	const heldCoverage = heldAtClose(close);
	const lastClose: LastClose = {
		gate: gateNumber,
		band: closingBand.id,
		cleared: ruling.closing === "cleared",
		closing: ruling.closing,
		...(ruling.closing === "held" ? { heldBy: ruling.heldBy } : {}),
		held: heldCoverage,
		ladder: ladderAtClose(close),
		correct: state.window.correct,
		accuracy: accuracyOf(state.window),
		multiplier: accuracyMultiplierFor(
			state.accuracyBonus,
			accuracyOf(state.window)
		),
	};
	const recordClose = (kb: number) => ({
		lastClose,
		closes: [...closesOf(state), { ...lastClose, kb }],
	});
	const recordedClose = recordClose(0);

	if (ruling.closing !== "cleared") {
		const attempts = state.gateAttempts ?? 0;
		const quota = missPeelFor(state);
		const occupied = occupiedSlots(state.build.configs);
		const caughtBy =
			ruling.closing === "held" && ruling.heldBy === "catch"
				? catcherFor(state.build.configs)
				: undefined;
		const caught =
			caughtBy === undefined ? undefined : { caughtFatalBy: caughtBy.label };
		const owed =
			caughtBy === undefined ? quota : Math.max(quota, slotsOf(caughtBy));
		const demand = gateDemandFor(
			state.build.configs,
			state.gatesCleared,
			schedule
		);
		const missed = missedLineFor(gateNumber, heldCoverage, demand);

		if (ruling.closing === "fatal")
			return {
				...state,
				...settledCommitments,
				...settledSwatch,
				...rolledBackEscrow,
				...droppedSla,
				...recordedClose,
				currentIndex: nextIndex,
				status: "dead",
				log: withLog(state, `${missed} The gate shut on it. Run over.`),
			};

		if (caught === undefined && isPeelFatal(quota, occupied))
			return {
				...state,
				...settledCommitments,
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
		return {
			...state,
			...settledCommitments,
			...settledSwatch,
			...rolledBackEscrow,
			...droppedSla,
			...recordedClose,
			...(caught === undefined ? {} : { caughtFatalBy: caught.caughtFatalBy }),
			currentIndex: nextIndex,
			status: "awaiting-strip",
			autoUpgradeProgress: 0,
			gateAttempts: attempts + 1,
			storageBeforeClearKb: state.storage,
			heldBy: ruling.heldBy,
			peelRefundKb: 0,
			peelSlotsRemaining: owed,
			log: withLog(
				state,
				...(caught === undefined
					? []
					: [
							`${caught.caughtFatalBy} caught it — the gate holds instead of ending the run. Drop it first to start paying the peel.`,
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
	const totalUnits = state.headStartUnits + unitsThisGate;
	const banked = roundToTwoDecimals(
		headStartFor(totalUnits, state.gatesCleared)
	);
	const overflowKb = surplusPayoutKb(totalUnits, state.gatesCleared);
	const clearKb = gateClearPayout(
		state.build.configs,
		state.window.correct,
		state.gatesCleared
	);
	const perfectBonusKb = perfectBonusOnClear(
		state.build.configs,
		closingBand,
		clearKb
	);
	const committedKb = escrowCommitKb(pending, state.faucetEarnedKb ?? 0);
	const upliftKb = slaUpliftKb(
		state.build.configs,
		promised,
		closingBand,
		clearKb
	);
	const survivalKb =
		INCIDENT_SURVIVAL_KB * incidentsAt(state, gateNumber).length;
	const reward =
		clearKb +
		perfectBonusKb +
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
		...settledCommitments,
		...settledSwatch,
		...recordClose(reward),
		window: freshWindow(
			state.polls,
			nextIndex,
			state.build.configs,
			state.gatesCleared + 1,
			scheduleOf(state)
		),
		manualDisabled: [],
		headStartUnits: banked,
		accuracyBonus: accuracyBonusAfter(
			state.accuracyBonus,
			accuracyOf(state.window)
		),
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
		perfectBonusThisGateKb: perfectBonusKb,
		overflowThisGateKb: overflowKb,
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

	const overCovered =
		bill.droppedTo !== undefined &&
		buildSpaceOf({ build: finalBuild, spaceDroppedTo: bill.droppedTo })
			.overflow > 0;

	return dealIncidentOffer(
		{
			...cleared,
			build: finalBuild,
			spaceDroppedTo: overCovered ? bill.droppedTo : undefined,
			storage: cleared.storage - billed.paidKb,
			subscriptionBillKb: billed.paidKb,
			deletedConfigs: settled.deleted.length > 0 ? settled.deleted : undefined,
			lapsedConfigs: billed.lapsed.length > 0 ? billed.lapsed : undefined,
			configsLost:
				(state.configsLost ?? 0) +
				settled.deleted.length +
				billed.lapsed.length,
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
		},
		cleared.gatesCleared,
		nextIndex
	);
};

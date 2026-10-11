import type { CategoryCode } from "~/shared/lib/categories";

import { approvedPollOf } from "~/modules/run/run/domain/approval.model";

import {
	type ShopControls,
	shopControlsFor,
} from "~/modules/run/run/application/shopControls.viewmodel";

import {
	type GatePayout,
	gatePayoutFor,
} from "~/modules/run/run/application/gatePayout.viewmodel";

import {
	type PaidActions,
	paidActionsFor,
	type BuyBackView,
	buyBackViewFor,
} from "~/modules/run/run/application/paidActions.viewmodel";

import {
	type AuditView,
	accuracyViewFor,
	guaranteedWindowOutputOf,
	auditViewsFor,
	type GateStake,
} from "~/modules/run/run/application/gateStake.viewmodel";
import {
	type PollView,
	redactPoll,
} from "~/modules/run/run/application/pollView.viewmodel";
import {
	type HeldAudit,
	canStart,
	closesOf,
	isAwaitingTomorrow,
	hiddenOptionIdsOf,
	isRunOver,
	offlinePairsOf,
	outageTargetsOf,
	type RecordedClose,
	type RunState,
	type RunStatus,
	liveConfigsOf,
	scheduleOf,
	type WarmBoot,
} from "~/modules/run/run/domain/run.model";
import { strictStakeOf } from "~/modules/run/run/domain/strict.model";
import {
	type AnswerType,
	type AnsweredPoll,
	chainLengthOf,
	mirrorPoll,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	answerContextFor,
	creditedAnswerTypeFor,
	gradedPollFor,
} from "~/modules/run/run/domain/answer.model";
import {
	gateWindowComplete,
	missPeelFor,
} from "~/modules/run/run/domain/gateClose.model";
import {
	type ConfigStatus,
	configStatusFor,
} from "~/modules/run/config/domain/configStatus.model";
import {
	type PollSlot,
	upcomingSlotsOf,
} from "~/modules/run/run/domain/rebase.model";
import {
	canEstimate,
	ESTIMATE_CHOICES,
	estimatePayoutUnits,
	estimatorFor,
} from "~/modules/run/run/domain/estimate.model";
import {
	SLA_BANDS,
	canCommitBand,
	committerFor,
} from "~/modules/run/run/domain/sla.model";
import {
	type Config,
	canMinify,
	minifySavingSlots,
	showsPollShape,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import {
	draftCostIn,
	isUpgradeOffer,
} from "~/modules/run/shop/domain/draft.model";
import {
	gateLadderFor,
	peelConfigRangeFor,
	peelShareFor,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditLabel,
	auditsHideAnswerType,
	type AuditId,
	auditsHideCategory,
	auditsHideMeter,
	auditTimeLimitMs,
	liveAuditsFor,
	mirrorsPolls,
	suppressedAuditFor,
} from "~/modules/run/gate/domain/audit.model";
import {
	swatchForGate,
	type SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import {
	type PerAnswerPreview,
	perAnswerPreviewFor,
} from "~/modules/run/build/domain/answerPayout.model";
import {
	auditorFor,
	budgeterFor,
	buildModifiersFor,
	gateClearPayout,
	occupiedSlots,
	prefetcherFor,
	type BuildModifiers,
} from "~/modules/run/build/domain/build.model";
import {
	buildSpaceOf,
	fitsBuildSpace,
} from "~/modules/run/build/domain/buildSpace.model";
import { canVendorLock } from "~/modules/run/build/domain/vendorLock.model";
import {
	type GateCloseView,
	gateCloseViewOf,
} from "~/modules/run/run/application/gateClose.viewmodel";
import {
	percentOf,
	runCoverageOf,
	type CommittableBand,
	SLA_UPLIFT,
	bandOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	autoUpgradeRemaining,
	hasUpgradeLeft,
} from "~/modules/run/config/domain/autoUpgrade.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	isPeelFatal,
	roundToOneDecimal,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

export type BuildSpaceView = {
	readonly space: number;
	readonly weight: number;
	readonly freeWeight: number;
	readonly emptyCreditKb: number;
	readonly perGateKb: number;
	readonly coveredSpace: number | null;
};

export type VendorLockView = {
	readonly offered: boolean;
	readonly lockedConfigId?: string;
};

export type SlaChoice = {
	readonly band: CommittableBand;
	readonly label: string;
	readonly uplift: number;
};

export type SlaControl = {
	readonly configLabel: string;
	readonly choices: readonly SlaChoice[];
};

export type EstimateChoice = {
	readonly count: number;
	readonly units: number;
};

export type EstimateControl = {
	readonly configLabel: string;
	readonly choices: readonly EstimateChoice[];
};

export type OfflineConfig = {
	readonly config: Config;
	readonly audit: string;
};

export type OutageTargetView = {
	readonly auditId: AuditId;
	readonly targets: readonly (readonly string[])[];
};

export type OfferRefusal =
	| {
			readonly reason: "no-room";
			readonly slots: number;
			readonly freeSlots: number;
	  }
	| {
			readonly reason: "too-expensive";
			readonly priceKb: number;
			readonly storageKb: number;
	  };

export type InstalledConfig = {
	readonly config: Config;
	readonly slots: number;
	readonly canMinify: boolean;
	readonly minifySavingSlots: number;
};

export type InstallScale = {
	readonly from: number;
	readonly to: number;
	readonly perGateKb: number;
};

export type ShopOffer = {
	readonly config: Config;
	readonly priceKb: number;
	readonly slots: number;
	readonly scale: InstallScale | null;
	readonly owned: boolean;
	readonly upgrades: boolean;
	readonly heldLevel: number | null;
	readonly locked: boolean;
	readonly installable: boolean;
	readonly refusal: OfferRefusal | null;
	readonly preview: BuildModifiers;
	readonly previewPerAnswer: PerAnswerPreview;
};

export type FastAnswerClock = {
	readonly label: string;
	readonly withinMs: number;
	readonly fast: number;
	readonly slow: number;
};

const fastAnswerClockOf = (
	configs: readonly Config[]
): FastAnswerClock | null => {
	const timed = configs.find(
		(config) => config.fastAnswerWithinMs !== undefined
	);
	if (timed?.fastAnswerWithinMs === undefined) return null;
	return {
		label: timed.label,
		withinMs: timed.fastAnswerWithinMs,
		fast: timed.fastCoverageMultiplier ?? 1,
		slow: timed.slowCoverageMultiplier ?? 1,
	};
};

export type RunView = {
	readonly status: RunStatus;
	readonly slots: number;
	readonly slotsUsed: number;
	readonly slotsFree: number;
	readonly overflowSlots: number;
	readonly configs: readonly Config[];
	readonly installed: readonly InstalledConfig[];
	readonly available: readonly Config[];
	readonly offers: readonly ShopOffer[];
	readonly newConfigIds: readonly string[];
	readonly peelSlotsRemaining: number;
	readonly peelRefundKb: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsLeftToday: number;
	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly hiddenOptionIds: readonly string[];
	readonly buyBack: BuyBackView;
	readonly paidActions: PaidActions;
	readonly offlineConfigs: readonly OfflineConfig[];
	readonly configStatuses: Readonly<Record<string, ConfigStatus>>;
	readonly mirroredPolls: boolean;
	readonly categoryHidden: boolean;
	readonly meterHidden: boolean;
	readonly pollTimeLimitMs: number | null;
	readonly fastAnswer: FastAnswerClock | null;
	readonly currentPollPeeked: boolean;
	readonly correctAnswersThisGate: number | null;
	readonly correctCountSource: string | null;
	readonly rebaseSlots: readonly PollSlot[];
	readonly estimate: EstimateControl | null;
	readonly estimatedCorrect: number | null;
	readonly approvedPollId: string | null;
	readonly sla: SlaControl | null;
	readonly slaBand: CommittableBand | null;
	readonly correctThisGate: number;
	readonly upcomingCategories: readonly CategoryCode[] | null;
	readonly nextGateCategories: readonly CategoryCode[] | null;
	readonly answerTypesThisGate: readonly AnswerType[] | null;
	readonly optionCountsThisGate: readonly number[] | null;
	readonly outageTargets: readonly OutageTargetView[] | null;
	readonly shopControls: ShopControls;
	readonly gatePayout: GatePayout;
	readonly heldAudit: HeldAudit | null;
	readonly incidentOffer: AuditId | null;
	readonly incidentRefreshes: number;
	readonly audits: readonly AuditView[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered: readonly AnsweredPoll[];
	readonly gateStake: GateStake;
	readonly canStart: boolean;
	readonly isOver: boolean;
	readonly faucetRemainingKb: number;
	readonly autoUpgradeRemaining: number | null;
	readonly gatesCleared: number;
	readonly gateComplete: boolean;

	readonly gateTheme?: SwatchTheme;

	readonly redoingGate: number | null;
	readonly clearedGate: number | null;
	readonly swatchGates: readonly number[];
	readonly victoryGate: number;
	readonly closes: readonly RecordedClose[];
	readonly lastClose: GateCloseView | null;
	readonly fullClearKb: number;

	readonly atMinimumWidth: boolean;

	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly upkeepPaidKb: number;
	readonly buildSpace: BuildSpaceView;
	readonly vendorLock: VendorLockView;

	readonly archiveAfterKb: number | null;
	readonly unlockedConfigIds: readonly string[];
	readonly unlockedThisRun: readonly RunUnlock[];
	readonly earnedTitleIds: readonly string[];
	readonly unlockedServiceIds: readonly string[];
	readonly unlockedServiceIdsThisRun: readonly string[];
	readonly ownedSwatchIds: readonly string[];
	readonly warmBoot: WarmBoot | null;
};

export type RunUnlock = {
	readonly configId: string;
	readonly viaMetric: string | null;
};

const slaControlFor = (state: RunState): SlaControl | null => {
	const committer = committerFor(state.build.configs);
	if (committer === undefined || !canCommitBand(state)) return null;
	return {
		configLabel: committer.label,
		choices: SLA_BANDS.map((band) => ({
			band,
			label: bandOf(band).label,
			uplift: SLA_UPLIFT[band],
		})),
	};
};

const estimateControlFor = (state: RunState): EstimateControl | null => {
	const estimator = estimatorFor(state.build.configs);
	if (estimator === undefined || !canEstimate(state)) return null;
	return {
		configLabel: estimator.label,
		choices: ESTIMATE_CHOICES.map((count) => ({
			count,
			units: estimatePayoutUnits(
				state.build.configs,
				count,
				count,
				state.gatesCleared
			),
		})),
	};
};

const offerRefusal = (
	state: RunState,
	config: Config,
	upgrades: boolean
): OfferRefusal | null => {
	const slots = slotsOf(config);
	if (!upgrades && !fitsBuildSpace(state, slots))
		return {
			reason: "no-room",
			slots,
			freeSlots: buildSpaceOf(state).roomLeft,
		};
	const priceKb = draftCostIn(state.build.configs, config);
	if (state.storage < priceKb)
		return { reason: "too-expensive", priceKb, storageKb: state.storage };
	return null;
};

const scaleFor = (
	state: RunState,
	withIt: readonly Config[]
): InstallScale | null => {
	const before = buildSpaceOf(state);
	const after = buildSpaceOf({ build: { ...state.build, configs: withIt } });
	if (after.space === before.space && after.upkeepKb === before.upkeepKb)
		return null;

	return { from: before.space, to: after.space, perGateKb: after.upkeepKb };
};

const offersFor = (state: RunState): readonly ShopOffer[] => {
	const installed = state.build.configs;
	const locked = state.lockedOfferIds ?? [];

	return state.draftOptions.map((config) => {
		const upgrades = isUpgradeOffer(installed, config);
		const held = installed.find((slotted) => slotted.id === config.id);
		const owned = !upgrades && held !== undefined;
		const refusal = offerRefusal(state, config, upgrades);
		const withIt = upgrades
			? installed.map((slotted) =>
					slotted.id === config.id ? config : slotted
				)
			: [...installed, config];
		return {
			config,
			priceKb: draftCostIn(installed, config),
			slots: slotsOf(config),
			scale: scaleFor(state, withIt),
			owned,
			upgrades,
			heldLevel: upgrades ? (held?.level ?? 1) : null,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: buildModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt, {
				answeredBefore: state.window.answered,
			}),
		};
	});
};

const buildSpaceViewFor = (state: RunState): BuildSpaceView => {
	const held = buildSpaceOf(state);
	return {
		space: held.space,
		weight: occupiedSlots(state.build.configs),
		freeWeight: held.freeWeight,
		emptyCreditKb: held.emptyCreditKb,
		perGateKb: held.upkeepKb,
		coveredSpace: state.spaceDroppedTo ?? null,
	};
};

const configStatusesFor = (
	state: RunState,
	poll: RunPoll | undefined,
	offline: readonly OfflineConfig[],
	liveAudits: readonly Audit[]
): Readonly<Record<string, ConfigStatus>> => {
	if (poll === undefined) return {};

	const schedule = scheduleOf(state);
	const auditHolding = new Map(
		offline.map((entry) => [entry.config.id, entry.audit])
	);
	const context = {
		...answerContextFor(state, gradedPollFor(state, poll)),
		suppressingAudit:
			suppressedAuditFor(state.build.configs, state.gatesCleared, schedule) !==
			undefined,
		categoryHidden: auditsHideCategory(liveAudits),
		answerTypeHidden: auditsHideAnswerType(liveAudits),
		faucetRemainingKb: faucetRemainingKb(state.faucetEarnedKb ?? 0),
		autoUpgradeProgress: state.autoUpgradeProgress ?? 0,
		nothingToUpgrade: !hasUpgradeLeft(state.build.configs),
		chainLength: chainLengthOf(state.allAnswered ?? []),
		pendingKb: state.pendingKb ?? 0,
		approvedThisPoll: approvedPollOf(state) !== undefined,
	};

	return Object.fromEntries(
		state.build.configs.map((config) => [
			config.id,
			configStatusFor(config, {
				...context,
				offlineAudit: auditHolding.get(config.id),
			}),
		])
	);
};

export const toRunView = (
	state: RunState,
	unlockedConfigIds: readonly string[] = [],
	unlockedThisRun: readonly RunUnlock[] = [],
	earnedTitleIds: readonly string[] = [],
	unlockedServiceIds: readonly string[] = []
): RunView => {
	const current = state.polls[state.currentIndex];
	const leftToday = Math.max(0, state.polls.length - state.currentIndex);
	const modifiers = buildModifiersFor(state.build.configs, state.gatesCleared);
	const perAnswer = perAnswerPreviewFor(state.build.configs, {
		answeredBefore: state.window.answered,
		answerType:
			current === undefined
				? undefined
				: creditedAnswerTypeFor(state, gradedPollFor(state, current)),
		wagerUnits:
			state.strictArmed === true
				? (strictStakeOf(liveConfigsOf(state)) ?? 0)
				: 0,
	});
	const carriedUnits = state.headStartUnits + guaranteedWindowOutputOf(state);
	const schedule = scheduleOf(state);
	const peelSlots = missPeelFor(state);
	const coverageLadder = gateLadderFor(
		state.build.configs,
		state.gatesCleared,
		schedule
	);
	const hidden = hiddenOptionIdsOf(state);
	const liveAudits = liveAuditsFor(
		state.build.configs,
		state.gatesCleared,
		schedule
	);
	const offline = offlinePairsOf(state).map((pair): OfflineConfig => ({
		config: pair.config,
		audit: auditLabel(pair.audit),
	}));
	const mirrored = mirrorsPolls(liveAudits);
	const answerTypeHidden = auditsHideAnswerType(liveAudits);
	const audits = auditViewsFor(state);
	const configStatuses = configStatusesFor(state, current, offline, liveAudits);
	const liveConfigs = liveConfigsOf(state);
	const prefetcher = prefetcherFor(liveConfigs);
	const held = buildSpaceOf(state);

	return {
		status: state.status,
		slots: held.space,
		slotsUsed: occupiedSlots(state.build.configs),
		slotsFree: held.roomLeft,
		overflowSlots: held.overflow,
		configs: state.build.configs,
		installed: state.build.configs.map((config) => ({
			config,
			slots: slotsOf(config),
			canMinify: canMinify(config),
			minifySavingSlots: minifySavingSlots(config),
		})),
		available: state.available,
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		archiveAfterKb: null,
		unlockedConfigIds,
		unlockedThisRun,
		earnedTitleIds,
		unlockedServiceIds,
		unlockedServiceIdsThisRun: [],
		ownedSwatchIds: [],
		warmBoot: state.warmBoot ?? null,
		peelSlotsRemaining: state.peelSlotsRemaining,
		peelRefundKb: state.peelRefundKb ?? 0,
		poll:
			state.status === "answering" && current
				? redactPoll(
						mirrored ? mirrorPoll(current) : current,
						hidden,
						answerTypeHidden
					)
				: null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsLeftToday: leftToday,
		pollsExhausted: leftToday === 0,
		disabledOptionIds: state.manualDisabled,
		hiddenOptionIds: hidden,
		buyBack: buyBackViewFor(state),
		paidActions: paidActionsFor(state),
		offlineConfigs: offline,
		configStatuses,
		mirroredPolls: mirrored,
		categoryHidden: auditsHideCategory(liveAudits),
		meterHidden: auditsHideMeter(liveAudits, state.window.answered),
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
		fastAnswer: fastAnswerClockOf(liveConfigs),
		currentPollPeeked:
			current !== undefined && (state.peekedPollIds ?? []).includes(current.id),
		correctAnswersThisGate:
			budgeterFor(liveConfigs) === undefined
				? null
				: (state.window.budget ?? null),
		correctCountSource: budgeterFor(liveConfigs)?.label ?? null,
		rebaseSlots: upcomingSlotsOf(state),
		estimate: estimateControlFor(state),
		estimatedCorrect: state.estimatedCorrect ?? null,
		approvedPollId: state.approvedPollId ?? null,
		sla: slaControlFor(state),
		slaBand: state.slaBand ?? null,
		correctThisGate: state.window.correct,
		upcomingCategories:
			prefetcher === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.category),
		nextGateCategories:
			prefetcher === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex - state.window.answered + SLICE_WINDOW,
							state.currentIndex - state.window.answered + 2 * SLICE_WINDOW
						)
						.map((poll) => poll.category),
		answerTypesThisGate:
			prefetcher === undefined || !showsPollShape(prefetcher)
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.answerType),
		optionCountsThisGate:
			prefetcher === undefined || !showsPollShape(prefetcher)
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.options.length),
		outageTargets:
			auditorFor(state.build.configs) === undefined
				? null
				: outageTargetsOf(state).map((target) => ({
						auditId: target.audit.id,
						targets: target.targets.map((configs) =>
							configs.map((config) => config.label)
						),
					})),
		shopControls: shopControlsFor(state),
		gatePayout: gatePayoutFor(state),
		heldAudit: state.heldAudit ?? null,
		incidentOffer: state.incidentOffer ?? null,
		incidentRefreshes: state.incidentRefreshes ?? 0,
		audits,
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		gateStake: {
			gateNumber: state.gatesCleared,
			pollsPerGate: SLICE_WINDOW,
			coverageLadder,
			coverageHeld: roundToOneDecimal(
				percentOf(runCoverageOf(carriedUnits, state.gatesCleared))
			),
			coverageAtOpen: roundToOneDecimal(
				percentOf(runCoverageOf(state.headStartUnits, state.gatesCleared))
			),
			audits,
			peelSlotsOnFailure: peelSlots,
			peelConfigsOnFailure: peelConfigRangeFor(state.build.configs, peelSlots),
			peelShareOnFailure: peelShareFor(
				state.build.configs,
				state.gatesCleared,
				schedule
			),
			missIsFatal: isPeelFatal(peelSlots, occupiedSlots(state.build.configs)),
			missIsFree:
				peelSlots === 0 &&
				!isPeelFatal(peelSlots, occupiedSlots(state.build.configs)),
			subscriptions: billLedger({
				configs: state.build.configs,
				gate: state.gatesCleared,
				storageKb: state.storage,
				spaceWeight: held.space,
				spaceBillKb: held.upkeepKb,
			}),
			modifiers,
			perAnswer,
			accuracy: accuracyViewFor(state),
		},
		canStart: canStart(state.build),
		isOver: isRunOver(state.status),
		faucetRemainingKb: faucetRemainingKb(state.faucetEarnedKb ?? 0),
		autoUpgradeRemaining:
			autoUpgradeRemaining(
				state.build.configs,
				state.autoUpgradeProgress ?? 0
			) ?? null,
		gatesCleared: state.gatesCleared,
		gateComplete: gateWindowComplete(state),
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		redoingGate: state.redoGate ?? null,
		clearedGate: state.clearedGate ?? null,
		swatchGates: state.swatchGatesEarned ?? [],
		victoryGate: VICTORY_GATE,
		closes: closesOf(state),
		lastClose: gateCloseViewOf(state),
		fullClearKb: gateClearPayout(
			state.build.configs,
			SLICE_WINDOW,
			state.gatesCleared
		),
		atMinimumWidth: atMinimumWidth(state.build.configs.length),
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		storage: state.storage,
		upkeepPaidKb: state.upkeepPaidKb ?? 0,
		buildSpace: buildSpaceViewFor(state),
		vendorLock: {
			offered: canVendorLock(state),
			lockedConfigId: state.build.vendorLockedConfigId,
		},
	};
};

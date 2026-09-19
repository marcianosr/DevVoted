import type { CategoryCode } from "~/shared/lib/categories";

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
	auditViewsFor,
	type GateStake,
	upcomingAuditFor,
} from "~/modules/run/run/application/gateStake.viewmodel";
import {
	type PollView,
	redactPoll,
} from "~/modules/run/run/application/pollView.viewmodel";
import {
	type AnswerTypeSplit,
	answerTypesOf,
	canStart,
	isAwaitingTomorrow,
	hiddenOptionIdsOf,
	isRunOver,
	offlinePairsOf,
	type RunState,
	type RunStatus,
	liveConfigsOf,
	scheduleOf,
} from "~/modules/run/run/domain/run.model";
import { strictStakeOf } from "~/modules/run/run/domain/strict.model";
import {
	type AnsweredPoll,
	mirrorPoll,
	type RunPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	answerContextFor,
	gradedPollFor,
	gateWindowComplete,
} from "~/modules/run/run/domain/answer.model";
import {
	type ConfigStatus,
	configStatusFor,
} from "~/modules/run/config/domain/effect.model";
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
	type Config,
	canMinify,
	minifySavingSlots,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import {
	draftCostIn,
	isUpgradeOffer,
} from "~/modules/run/shop/domain/draft.model";
import {
	failPeelQuotaFor,
	gateLadderFor,
	gateProjectionFor,
	peelConfigRangeFor,
	peelShareFor,
} from "~/modules/run/gate/domain/gate.model";
import {
	type Audit,
	auditLabel,
	auditsHideCategory,
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
	type BuildModifiers,
	budgeterFor,
	freeSlots,
	occupiedSlots,
	overflowSlots,
	prefetcherFor,
	perAnswerPreviewFor,
	projectorFor,
	buildModifiersFor,
} from "~/modules/run/build/domain/build.model";
import { canVendorLock } from "~/modules/run/build/domain/vendorLock.model";
import {
	percentOf,
	runCoverageOf,
} from "~/modules/run/build/domain/coverageRatio.model";
import { autoUpgradeRemaining } from "~/modules/run/config/domain/autoUpgrade.model";
import { recommendedPicks } from "~/modules/run/config/domain/hand.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	isPeelFatal,
	rungIndexForSpace,
	roundToOneDecimal,
	SLICE_WINDOW,
	spaceRungFor,
	upkeepForSpace,
	BUILD_SPACE_RUNGS,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { canPickBuildSpace } from "~/modules/run/run/domain/shopAction.model";

export type BuildSpaceRungView = {
	readonly rung: number;
	readonly weight: number;
	readonly perGateKb: number;
	readonly held: boolean;
	readonly pickable: boolean;
};

export type BuildSpaceView = {
	readonly space: number;
	readonly weight: number;
	readonly perGateKb: number;
	readonly offered: boolean;
	readonly rungs: readonly BuildSpaceRungView[];
};

export type VendorLockView = {
	/** The build holds the vendor and has not named one yet, so a pick is live. */
	readonly offered: boolean;
	readonly lockedConfigId?: string;
};

export type EstimateChoice = {
	readonly count: number;
	/** What this card pays if the window meets it, already resolved by the engine. */
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

export type ShopOffer = {
	readonly config: Config;
	readonly priceKb: number;
	readonly slots: number;
	readonly owned: boolean;
	readonly upgrades: boolean;
	readonly locked: boolean;
	readonly installable: boolean;
	readonly refusal: OfferRefusal | null;
	readonly preview: BuildModifiers;
	readonly previewPerAnswer: PerAnswerPreview;
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
	readonly recommendedConfigIds: readonly string[];
	readonly offers: readonly ShopOffer[];
	readonly newConfigIds: readonly string[];
	readonly peelSlotsRemaining: number;
	readonly peelRefundKb: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly hiddenOptionIds: readonly string[];
	readonly buyBack: BuyBackView;
	readonly paidActions: PaidActions;
	readonly offlineConfigs: readonly OfflineConfig[];
	readonly configStatuses: Readonly<Record<string, ConfigStatus>>;
	readonly mirroredPolls: boolean;
	readonly categoryHidden: boolean;
	readonly pollTimeLimitMs: number | null;
	readonly currentPollPeeked: boolean;
	readonly correctAnswersThisGate: number | null;
	readonly correctCountSource: string | null;
	readonly rebaseSlots: readonly PollSlot[];
	readonly estimate: EstimateControl | null;
	readonly estimatedCorrect: number | null;
	readonly correctThisGate: number;
	readonly upcomingCategories: readonly CategoryCode[] | null;
	readonly nextGateCategories: readonly CategoryCode[] | null;
	readonly answerTypesThisGate: AnswerTypeSplit | null;
	readonly optionCountsThisGate: readonly number[] | null;
	readonly shopControls: ShopControls;
	readonly gatePayout: GatePayout;
	readonly audits: readonly AuditView[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered: readonly AnsweredPoll[];
	readonly perAnswer: PerAnswerPreview;
	readonly gateStake: GateStake;
	readonly canStart: boolean;
	readonly isOver: boolean;
	readonly faucetRemainingKb: number;
	readonly autoUpgradeRemaining: number | null;
	readonly gatesCleared: number;
	/** The gate's five results are in and it owes a close. */
	readonly gateComplete: boolean;

	readonly gateTheme?: SwatchTheme;

	readonly redoingGate: number | null;
	readonly clearedGate: number | null;
	/** Gates this run played flawlessly, each one a swatch kept for good. */
	readonly swatchGates: readonly number[];
	readonly victoryGate: number;

	readonly atMinimumWidth: boolean;

	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	/** Build-space upkeep the whole run paid, for the run-over report. */
	readonly upkeepPaidKb: number;
	readonly buildSpace: BuildSpaceView;
	readonly vendorLock: VendorLockView;

	/**
	 * The account archive, in KB. Not run state — the service fills it from the
	 * users row, because a run knows nothing about the account it banks into.
	 */
	readonly archiveAfterKb: number | null;
	readonly unlockedConfigIds: readonly string[];
	readonly unlockedThisRun: readonly RunUnlock[];
};

export type RunUnlock = {
	readonly configId: string;
	readonly viaMetric: string | null;
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
	free: number,
	upgrades: boolean
): OfferRefusal | null => {
	const slots = slotsOf(config);
	if (!upgrades && slots > free)
		return { reason: "no-room", slots, freeSlots: free };
	const priceKb = draftCostIn(state.build.configs, config);
	if (state.storage < priceKb)
		return { reason: "too-expensive", priceKb, storageKb: state.storage };
	return null;
};

const offersFor = (state: RunState): readonly ShopOffer[] => {
	const installed = state.build.configs;
	const free = freeSlots(state.build);
	const locked = state.lockedOfferIds ?? [];

	return state.draftOptions.map((config) => {
		const upgrades = isUpgradeOffer(installed, config);
		const owned =
			!upgrades && installed.some((slotted) => slotted.id === config.id);
		const refusal = offerRefusal(state, config, free, upgrades);
		const withIt = upgrades
			? installed.map((slotted) =>
					slotted.id === config.id ? config : slotted
				)
			: [...installed, config];
		return {
			config,
			priceKb: draftCostIn(installed, config),
			slots: slotsOf(config),
			owned,
			upgrades,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: buildModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt),
		};
	});
};

const buildSpaceViewFor = (state: RunState): BuildSpaceView => {
	const held = rungIndexForSpace(state.build.slots);
	const offered = canPickBuildSpace(state);

	return {
		space: state.build.slots,
		weight: occupiedSlots(state.build.configs),
		perGateKb: upkeepForSpace(state.build.slots),
		offered,
		rungs: BUILD_SPACE_RUNGS.map((rung, index) => ({
			rung: index,
			weight: rung.weight,
			perGateKb: rung.kb,
			held: index === held,
			pickable: offered && index !== held,
		})),
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
		faucetRemainingKb: faucetRemainingKb(state.faucetEarnedKb ?? 0),
		autoUpgradeProgress: state.autoUpgradeProgress ?? 0,
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
	unlockedThisRun: readonly RunUnlock[] = []
): RunView => {
	const current = state.polls[state.currentIndex];
	const modifiers = buildModifiersFor(state.build.configs, state.gatesCleared);
	const perAnswer = perAnswerPreviewFor(
		state.build.configs,
		current === undefined
			? undefined
			: gradedPollFor(state, current).answerType,
		state.strictArmed === true ? (strictStakeOf(liveConfigsOf(state)) ?? 0) : 0
	);
	const carriedUnits = state.bankedUnits + state.window.unitsEarned;
	const schedule = scheduleOf(state);
	const peelSlots = failPeelQuotaFor(
		state.build.configs,
		state.gatesCleared,
		schedule
	);
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
	const audits = auditViewsFor(state);
	const configStatuses = configStatusesFor(state, current, offline, liveAudits);
	const liveConfigs = liveConfigsOf(state);

	return {
		status: state.status,
		slots: state.build.slots,
		slotsUsed: occupiedSlots(state.build.configs),
		slotsFree: freeSlots(state.build),
		overflowSlots: overflowSlots(state.build),
		configs: state.build.configs,
		installed: state.build.configs.map((config) => ({
			config,
			slots: slotsOf(config),
			canMinify: canMinify(config),
			minifySavingSlots: minifySavingSlots(config),
		})),
		available: state.available,
		recommendedConfigIds: recommendedPicks(
			state.available,
			state.build.slots
		).map((config) => config.id),
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		archiveAfterKb: null,
		unlockedConfigIds,
		unlockedThisRun,
		peelSlotsRemaining: state.peelSlotsRemaining,
		peelRefundKb: state.peelRefundKb ?? 0,
		poll:
			state.status === "answering" && current
				? redactPoll(mirrored ? mirrorPoll(current) : current, hidden)
				: null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsExhausted: state.currentIndex >= state.polls.length,
		disabledOptionIds: state.manualDisabled,
		hiddenOptionIds: hidden,
		buyBack: buyBackViewFor(state),
		paidActions: paidActionsFor(state),
		offlineConfigs: offline,
		configStatuses,
		mirroredPolls: mirrored,
		categoryHidden: auditsHideCategory(liveAudits),
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
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
		correctThisGate: state.window.correct,
		upcomingCategories:
			prefetcherFor(liveConfigs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.category),
		nextGateCategories:
			prefetcherFor(liveConfigs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex - state.window.answered + SLICE_WINDOW,
							state.currentIndex - state.window.answered + 2 * SLICE_WINDOW
						)
						.map((poll) => poll.category),
		answerTypesThisGate:
			prefetcherFor(liveConfigs) === undefined
				? null
				: answerTypesOf(
						state.polls.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
					),
		optionCountsThisGate:
			prefetcherFor(liveConfigs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.options.length),
		shopControls: shopControlsFor(state),
		gatePayout: gatePayoutFor(state),
		audits,
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		perAnswer,
		gateStake: {
			gateNumber: state.gatesCleared,
			pollsPerGate: SLICE_WINDOW,
			coverageLadder,
			coverageHeld: roundToOneDecimal(
				percentOf(runCoverageOf(carriedUnits, state.gatesCleared))
			),
			coverageAtOpen: roundToOneDecimal(
				percentOf(runCoverageOf(state.bankedUnits, state.gatesCleared))
			),
			unitsHeld: carriedUnits,
			audits,
			upcomingAudit: upcomingAuditFor(state.gatesCleared),
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
				spaceWeight: spaceRungFor(state.build.slots).weight,
				spaceBillKb: spaceRungFor(state.build.slots).kb,
			}),
			modifiers,
			perAnswer,
			projection:
				projectorFor(state.build.configs) === undefined
					? undefined
					: gateProjectionFor(
							carriedUnits,
							perAnswer,
							state.gatesCleared,
							coverageLadder.healthy
						),
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

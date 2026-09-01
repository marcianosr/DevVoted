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
	canStart,
	isAwaitingTomorrow,
	isRunOver,
	offlinePairsOf,
	type RunState,
	type RunStatus,
} from "~/modules/run/run/domain/run.model";
import {
	type AnsweredPoll,
	mirrorPoll,
} from "~/modules/run/run/domain/runPoll.model";
import {
	type Config,
	canMinify,
	minifySavingSlots,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import { draftCostIn } from "~/modules/run/shop/domain/draft.model";
import {
	failPeelQuotaFor,
	gateDemandFor,
	peelShareFor,
} from "~/modules/run/gate/domain/gate.model";
import {
	auditLabel,
	auditsHideCategory,
	auditTimeLimitMs,
	liveAuditsFor,
	mirrorsPolls,
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
	buildModifiersFor,
} from "~/modules/run/build/domain/build.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	isPeelFatal,
	MAX_SLOTS,
	planBillKb,
	SLICE_WINDOW,
	storageCapFor,
	STORAGE_PLANS,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import {
	canBuySlot,
	canCashSlot,
	slotCashOutFor,
	slotPriceFor,
} from "~/modules/run/run/domain/shopAction.model";
import {
	canBuyStartSlot,
	canRefundStartSlot,
	startSlotPriceKb,
	startSlotRefundKb,
} from "~/modules/run/run/domain/startSlot.model";

export type SlotDealView = {
	readonly costKb?: number;
	readonly makes?: number;
	readonly refusal?: string;
};

export type SlotsView = {
	readonly slots: number;
	readonly maxSlots: number;
	readonly buy: SlotDealView;
	readonly cash: SlotDealView;
};

export type StartSlotsView = {
	readonly archiveKb: number;
	readonly buy: SlotDealView;
	readonly cash: SlotDealView;
};

export type StoragePlanOption = {
	readonly tier: number;
	readonly capKb: number;
	readonly perGateKb: number;
	readonly held: boolean;
	readonly burnsKb: number;
};

export type StoragePlanView = {
	readonly capKb: number;
	readonly perGateKb: number;
	readonly options: readonly StoragePlanOption[];
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
	readonly offers: readonly ShopOffer[];
	readonly newConfigIds: readonly string[];
	readonly peelSlotsRemaining: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly paidActions: PaidActions;
	readonly offlineConfigs: readonly OfflineConfig[];
	readonly mirroredPolls: boolean;
	readonly categoryHidden: boolean;
	readonly pollTimeLimitMs: number | null;
	readonly currentPollPeeked: boolean;
	readonly correctAnswersThisGate: number | null;
	readonly upcomingCategories: readonly CategoryCode[] | null;
	readonly nextGateCategories: readonly CategoryCode[] | null;
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
	readonly gatesCleared: number;

	readonly gateTheme?: SwatchTheme;

	readonly redoingGate: number | null;
	readonly victoryGate: number;

	readonly atMinimumWidth: boolean;

	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly slotDeals: SlotsView;
	readonly startSlotDeals: StartSlotsView;
	readonly storagePlan: StoragePlanView;
};

const offerRefusal = (
	state: RunState,
	config: Config,
	free: number
): OfferRefusal | null => {
	const slots = slotsOf(config);
	if (slots > free) return { reason: "no-room", slots, freeSlots: free };
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
		const owned = installed.some((slotted) => slotted.id === config.id);
		const refusal = offerRefusal(state, config, free);
		const withIt = [...installed, config];
		return {
			config,
			priceKb: draftCostIn(installed, config),
			slots: slotsOf(config),
			owned,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: buildModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt, state.gatesCleared),
		};
	});
};

const buyRefusalFor = (state: RunState): string | undefined => {
	const price = slotPriceFor(state);
	if (price === undefined || state.build.slots >= MAX_SLOTS)
		return `Sold out — ${MAX_SLOTS} slots is the ceiling.`;
	if (state.storage < price)
		return `Costs ${price} KB, you have ${state.storage}.`;
	return undefined;
};

const cashRefusalFor = (state: RunState): string | undefined => {
	if (slotCashOutFor(state) === undefined)
		return "Nothing to cash — the first four slots are free.";
	if (freeSlots(state.build) === 0)
		return "Every slot is filled — uninstall or minify first.";
	return undefined;
};

const slotsViewFor = (state: RunState): SlotsView => {
	const price = slotPriceFor(state);
	const refund = slotCashOutFor(state);

	return {
		slots: state.build.slots,
		maxSlots: MAX_SLOTS,
		buy: {
			...(price === undefined ? {} : { costKb: price }),
			...(canBuySlot(state) ? { makes: state.build.slots + 1 } : {}),
			...(buyRefusalFor(state) === undefined
				? {}
				: { refusal: buyRefusalFor(state) }),
		},
		cash: {
			...(refund === undefined ? {} : { costKb: refund }),
			...(canCashSlot(state) ? { makes: state.build.slots - 1 } : {}),
			...(cashRefusalFor(state) === undefined
				? {}
				: { refusal: cashRefusalFor(state) }),
		},
	};
};

const startBuyRefusalFor = (
	state: RunState,
	archiveKb: number
): string | undefined => {
	const price = startSlotPriceKb(state);
	if (price === undefined)
		return `Sold out — ${MAX_SLOTS} slots is the ceiling.`;
	if (archiveKb < price)
		return `Costs ${price} KB of archive, you have ${archiveKb}.`;
	return undefined;
};

const startSlotsViewFor = (
	state: RunState,
	archiveKb: number
): StartSlotsView => {
	const price = startSlotPriceKb(state);
	const refund = startSlotRefundKb(state);
	const refusal = startBuyRefusalFor(state, archiveKb);

	return {
		archiveKb,
		buy: {
			...(price === undefined ? {} : { costKb: price }),
			...(canBuyStartSlot(state, archiveKb)
				? { makes: state.build.slots + 1 }
				: {}),
			...(refusal === undefined ? {} : { refusal }),
		},
		cash:
			refund === undefined || !canRefundStartSlot(state)
				? {}
				: { costKb: refund, makes: state.build.slots - 1 },
	};
};

const storagePlanViewFor = (state: RunState): StoragePlanView => {
	const tier = state.storagePlan ?? 0;

	return {
		capKb: storageCapFor(tier),
		perGateKb: planBillKb(tier),
		options: STORAGE_PLANS.map((plan) => ({
			tier: plan.tier,
			capKb: plan.capKb,
			perGateKb: plan.perGateKb,
			held: plan.tier === tier,
			burnsKb: Math.max(0, state.storage - plan.capKb),
		})),
	};
};

export const toRunView = (state: RunState, archiveKb = 0): RunView => {
	const current = state.polls[state.currentIndex];
	const modifiers = buildModifiersFor(state.build.configs, state.gatesCleared);
	const perAnswer = perAnswerPreviewFor(
		state.build.configs,
		state.gatesCleared
	);
	const peelSlots = failPeelQuotaFor(state.build.configs, state.gatesCleared);
	const liveAudits = liveAuditsFor(state.build.configs, state.gatesCleared);
	const offline = offlinePairsOf(state).map((pair): OfflineConfig => ({
		config: pair.config,
		audit: auditLabel(pair.audit),
	}));
	const mirrored = mirrorsPolls(liveAudits);
	const audits = auditViewsFor(state);

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
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		peelSlotsRemaining: state.peelSlotsRemaining,
		poll:
			state.status === "answering" && current
				? redactPoll(mirrored ? mirrorPoll(current) : current)
				: null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsExhausted: state.currentIndex >= state.polls.length,
		disabledOptionIds: state.manualDisabled,
		paidActions: paidActionsFor(state),
		offlineConfigs: offline,
		mirroredPolls: mirrored,
		categoryHidden: auditsHideCategory(liveAudits),
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
		currentPollPeeked:
			current !== undefined && (state.peekedPollIds ?? []).includes(current.id),
		correctAnswersThisGate:
			budgeterFor(state.build.configs) === undefined
				? null
				: (state.window.budget ?? null),
		upcomingCategories:
			prefetcherFor(state.build.configs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.category),
		nextGateCategories:
			prefetcherFor(state.build.configs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex - state.window.answered + SLICE_WINDOW,
							state.currentIndex - state.window.answered + 2 * SLICE_WINDOW
						)
						.map((poll) => poll.category),
		shopControls: shopControlsFor(state),
		gatePayout: gatePayoutFor(state),
		audits,
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		perAnswer,
		gateStake: {
			gateNumber: state.gatesCleared,
			pollsPerGate: SLICE_WINDOW,
			coverageDemand: gateDemandFor(state.build.configs, state.gatesCleared),
			coverageHeld: state.window.coverageGained,
			audits,
			upcomingAudit: upcomingAuditFor(state.gatesCleared),
			peelSlotsOnFailure: peelSlots,
			peelShareOnFailure: peelShareFor(state.build.configs, state.gatesCleared),
			missIsFatal: isPeelFatal(peelSlots, occupiedSlots(state.build.configs)),
			subscriptions: billLedger({
				configs: state.build.configs,
				gate: state.gatesCleared,
				storageKb: state.storage,
				planCapKb: storageCapFor(state.storagePlan ?? 0),
				planBillKb: planBillKb(state.storagePlan ?? 0),
			}),
			modifiers,
			perAnswer,
		},
		canStart: canStart(state.build),
		isOver: isRunOver(state.status),
		faucetRemainingKb: faucetRemainingKb(state.faucetEarnedKb ?? 0),
		gatesCleared: state.gatesCleared,
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		redoingGate: state.redoGate ?? null,
		victoryGate: VICTORY_GATE,
		atMinimumWidth: atMinimumWidth(state.build.configs.length),
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		storage: state.storage,
		slotDeals: slotsViewFor(state),
		startSlotDeals: startSlotsViewFor(state, archiveKb),
		storagePlan: storagePlanViewFor(state),
	};
};

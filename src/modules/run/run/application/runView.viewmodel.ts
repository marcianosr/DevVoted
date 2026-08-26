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
import { type Config } from "~/modules/run/config/domain/config.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import { draftCostIn } from "~/modules/run/shop/domain/draft.model";
import {
	failStripQuotaFor,
	gateDemandFor,
} from "~/modules/run/gate/domain/gate.model";
import {
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
	type PipelineModifiers,
	type SlotUnlock,
	budgeterFor,
	nextSlotUnlockFor,
	prefetcherFor,
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	isStakeFatal,
	isStoragePlanUnlocked,
	SLICE_WINDOW,
	storagePlanFor,
	storagePlanLadder,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

export type StoragePlanOption = {
	readonly tier: number;
	readonly capKb: number;
	readonly billKb: number;
	readonly current: boolean;
	/** KB sitting above this plan's cap that switching to it would burn on the spot. */
	readonly burnKb: number;
	/** Gates the run must clear before this rung is sold (ADR-030). */
	readonly fromGate: number;
	/** The one rung shown ahead of the run — visible, priced, not yet buyable. */
	readonly locked: boolean;
};

export type OfflineConfig = {
	readonly config: Config;
	readonly audit: string;
};

/** Carries the numbers, not the sentence: the wording lives with the shop screen so every phrasing stays reachable from a story. */
export type OfferRefusal =
	| { readonly reason: "no-slot" }
	| {
			readonly reason: "too-expensive";
			readonly priceKb: number;
			readonly storageKb: number;
	  };

/** One draft option, priced against the run looking at it. */
export type ShopOffer = {
	readonly config: Config;
	readonly priceKb: number;
	readonly owned: boolean;
	readonly locked: boolean;
	readonly installable: boolean;
	readonly refusal: OfferRefusal | null;
	/** What the build's payouts become with this installed — the hover preview. */
	readonly preview: PipelineModifiers;
	readonly previewPerAnswer: PerAnswerPreview;
};

export type RunView = {
	readonly status: RunStatus;
	readonly slots: number;
	readonly configs: readonly Config[];
	readonly available: readonly Config[];
	readonly offers: readonly ShopOffer[];
	readonly newConfigIds: readonly string[];
	readonly stripsRemaining: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly paidActions: PaidActions;
	/** Paired with the audit to blame, so no surface shows a dead row it cannot explain. Their effects are already out of `perAnswer`. */
	readonly offlineConfigs: readonly OfflineConfig[];
	/** The gate mirrors its polls, so the poll's own type has already been flipped. */
	readonly mirroredPolls: boolean;
	/** The clock on the poll on screen, in ms; null when it runs free. */
	readonly pollTimeLimitMs: number | null;
	/** The split query refuses to answer until this is true. */
	readonly currentPollPeeked: boolean;
	/** Null when no config is counting, which is what hides the line. */
	readonly correctAnswersThisGate: number | null;
	/** Prefetch's reveal. Null when no installed config reads the draw. */
	readonly upcomingCategories: readonly CategoryCode[] | null;
	/** Empty in the live game, where tomorrow's five come from the server; the pool-fed prototype fills it locally. */
	readonly nextGateCategories: readonly CategoryCode[] | null;
	readonly shopControls: ShopControls;
	/** A gate, a coverage total, or either (ADR-041); null at the cap. */
	readonly nextSlotUnlock: SlotUnlock | null;

	readonly justUnlockedSlots: readonly number[];
	readonly gatePayout: GatePayout;
	/** The live audits' answering-screen cues (suppressed ones excluded). */
	readonly audits: readonly AuditView[];
	readonly answeredThisGate: readonly AnsweredPoll[];
	readonly allAnswered: readonly AnsweredPoll[];
	/** Kept whole: every screen showing pricing wants all four, and a spread means each reassembles them by hand. */
	readonly perAnswer: PerAnswerPreview;
	readonly gateStake: GateStake;
	readonly canStart: boolean;
	readonly isOver: boolean;
	/** The rail counts it down beside the config earning it: a rate with no budget left is a promise the poll cannot keep. */
	readonly faucetRemainingKb: number;
	readonly gatesCleared: number;

	readonly gateTheme?: SwatchTheme;

	/** The gate being replayed after a fail (ADR-035); null otherwise. */
	readonly redoingGate: number | null;
	readonly victoryGate: number;

	/** One config left — sell and drop refuse, a pipeline never goes bare. */
	readonly atMinimumWidth: boolean;

	readonly pollsAnswered: number;
	readonly pollsPerGate: number;
	readonly coverage: number;
	readonly coverageByCategory: Readonly<Record<string, number>>;
	readonly storage: number;
	readonly storageCap: number;
	readonly storageBillKb: number;
	readonly storagePlans: readonly StoragePlanOption[];
};

const offerRefusal = (
	state: RunState,
	config: Config,
	isFull: boolean
): OfferRefusal | null => {
	if (isFull) return { reason: "no-slot" };
	const priceKb = draftCostIn(state.pipeline.configs, config);
	if (state.storage < priceKb)
		return { reason: "too-expensive", priceKb, storageKb: state.storage };
	return null;
};

const offersFor = (state: RunState): readonly ShopOffer[] => {
	const installed = state.pipeline.configs;
	const isFull = installed.length >= state.pipeline.slots;
	const locked = state.lockedOfferIds ?? [];

	return state.draftOptions.map((config) => {
		const owned = installed.some((slotted) => slotted.id === config.id);
		const refusal = offerRefusal(state, config, isFull);
		const withIt = [...installed, config];
		return {
			config,
			priceKb: draftCostIn(installed, config),
			owned,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: pipelineModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt, state.gatesCleared),
		};
	});
};

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	const plan = storagePlanFor(state.storagePlan);
	const modifiers = pipelineModifiersFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const perAnswer = perAnswerPreviewFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const strips = failStripQuotaFor(state.pipeline.configs, state.gatesCleared);
	const liveAudits = liveAuditsFor(state.pipeline.configs, state.gatesCleared);
	const offline = offlinePairsOf(state).map((pair): OfflineConfig => ({
		config: pair.config,
		audit: pair.audit.name,
	}));
	const mirrored = mirrorsPolls(liveAudits);
	const audits = auditViewsFor(state);

	return {
		status: state.status,
		slots: state.pipeline.slots,
		configs: state.pipeline.configs,
		available: state.available,
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		stripsRemaining: state.stripsRemaining,
		poll:
			state.status === "answering" && current
				? redactPoll(mirrored ? mirrorPoll(current) : current)
				: null,
		awaitingTomorrow: isAwaitingTomorrow(state),
		pollsExhausted: state.currentIndex >= state.polls.length,
		// Only options the player paid to lint off — no automatic masking.
		disabledOptionIds: state.manualDisabled,
		paidActions: paidActionsFor(state),
		offlineConfigs: offline,
		mirroredPolls: mirrored,
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
		currentPollPeeked:
			current !== undefined && (state.peekedPollIds ?? []).includes(current.id),
		correctAnswersThisGate:
			budgeterFor(state.pipeline.configs) === undefined
				? null
				: (state.window.budget ?? null),
		// Capped at the window edge; the prototype's state holds the whole pool.
		upcomingCategories:
			prefetcherFor(state.pipeline.configs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex,
							state.currentIndex - state.window.answered + SLICE_WINDOW
						)
						.map((poll) => poll.category),
		nextGateCategories:
			prefetcherFor(state.pipeline.configs) === undefined
				? null
				: state.polls
						.slice(
							state.currentIndex - state.window.answered + SLICE_WINDOW,
							state.currentIndex - state.window.answered + 2 * SLICE_WINDOW
						)
						.map((poll) => poll.category),
		shopControls: shopControlsFor(state),
		nextSlotUnlock: nextSlotUnlockFor(
			{ gatesCleared: state.gatesCleared, coverage: state.coverage },
			state.pipeline.slots
		),
		justUnlockedSlots: state.justUnlockedSlots ?? [],
		gatePayout: gatePayoutFor(state),
		audits,
		answeredThisGate: state.answeredThisGate,
		allAnswered: state.allAnswered ?? [],
		perAnswer,
		gateStake: {
			gateNumber: state.gatesCleared,
			pollsPerGate: SLICE_WINDOW,
			coverageDemand: gateDemandFor(state.pipeline.configs, state.gatesCleared),
			coverageHeld: state.window.coverageGained,
			audits,
			upcomingAudit: upcomingAuditFor(state.gatesCleared),
			stripsOnFailure: strips,
			missIsFatal: isStakeFatal(strips, state.pipeline.configs.length),
			billKb: plan.billKb,
			subscriptions: billLedger({
				configs: state.pipeline.configs,
				gate: state.gatesCleared,
				storageKb: state.storage,
				planBillKb: plan.billKb,
				planTier: plan.tier,
			}),
			modifiers,
			perAnswer,
		},
		canStart: canStart(state.pipeline),
		isOver: isRunOver(state.status),
		faucetRemainingKb: faucetRemainingKb(state.faucetEarnedKb ?? 0),
		gatesCleared: state.gatesCleared,
		gateTheme: swatchForGate(state.gatesCleared)?.theme,
		redoingGate: state.redoGate ?? null,
		victoryGate: VICTORY_GATE,
		atMinimumWidth: atMinimumWidth(state.pipeline.configs.length),
		pollsAnswered: state.window.answered,
		pollsPerGate: SLICE_WINDOW,
		coverage: state.coverage,
		coverageByCategory: state.coverageByCategory,
		storage: state.storage,
		storageCap: plan.capKb,
		storageBillKb: plan.billKb,
		storagePlans: storagePlanLadder(state.gatesCleared).map((option) => ({
			tier: option.tier,
			capKb: option.capKb,
			billKb: option.billKb,
			current: option.tier === plan.tier,
			burnKb: Math.max(0, state.storage - option.capKb),
			fromGate: option.fromGate,
			locked: !isStoragePlanUnlocked(option, state.gatesCleared),
		})),
	};
};

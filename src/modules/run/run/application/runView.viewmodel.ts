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
	minifySavingSpots,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import { billLedger } from "~/modules/run/config/domain/subscription.model";
import { draftCostIn } from "~/modules/run/shop/domain/draft.model";
import {
	failPeelQuotaFor,
	gateDemandFor,
	peelShareFor,
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
	budgeterFor,
	freeSpots,
	occupiedSpots,
	overflowSpots,
	prefetcherFor,
	perAnswerPreviewFor,
	pipelineModifiersFor,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	atMinimumWidth,
	faucetRemainingKb,
	EXTRA_SPOT_TIERS,
	extraRentKb,
	extraSpotsUnlocked,
	isPeelFatal,
	scheduledSpots,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

export type ExtraSpotOption = {
	readonly spots: number;
	readonly makes: number;
	readonly rentKb: number;
	readonly held: boolean;
	readonly fromGate?: number;
	readonly rentTooDear?: boolean;
};

export type ExtraSpotsView = {
	readonly renting: number;
	readonly perGateKb: number;
	readonly options: readonly ExtraSpotOption[];
};

export type OfflineConfig = {
	readonly config: Config;
	readonly audit: string;
};

export type OfferRefusal =
	| {
			readonly reason: "no-room";
			readonly spots: number;
			readonly freeSpots: number;
	  }
	| {
			readonly reason: "too-expensive";
			readonly priceKb: number;
			readonly storageKb: number;
	  };

export type InstalledConfig = {
	readonly config: Config;
	readonly spots: number;
	readonly canMinify: boolean;
	readonly minifySavingSpots: number;
};

export type ShopOffer = {
	readonly config: Config;
	readonly priceKb: number;
	readonly spots: number;
	readonly owned: boolean;
	readonly locked: boolean;
	readonly installable: boolean;
	readonly refusal: OfferRefusal | null;
	readonly preview: PipelineModifiers;
	readonly previewPerAnswer: PerAnswerPreview;
};

export type RunView = {
	readonly status: RunStatus;
	readonly spots: number;
	readonly spotsUsed: number;
	readonly spotsFree: number;
	readonly overflowSpots: number;
	readonly configs: readonly Config[];
	readonly installed: readonly InstalledConfig[];
	readonly available: readonly Config[];
	readonly offers: readonly ShopOffer[];
	readonly newConfigIds: readonly string[];
	readonly peelSpotsRemaining: number;
	readonly poll: PollView | null;
	readonly awaitingTomorrow: boolean;

	readonly pollsExhausted: boolean;
	readonly disabledOptionIds: readonly string[];
	readonly paidActions: PaidActions;
	readonly offlineConfigs: readonly OfflineConfig[];
	readonly mirroredPolls: boolean;
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
	readonly extraSpots: ExtraSpotsView;
};

const offerRefusal = (
	state: RunState,
	config: Config,
	free: number
): OfferRefusal | null => {
	const spots = spotsOf(config);
	if (spots > free) return { reason: "no-room", spots, freeSpots: free };
	const priceKb = draftCostIn(state.pipeline.configs, config);
	if (state.storage < priceKb)
		return { reason: "too-expensive", priceKb, storageKb: state.storage };
	return null;
};

const offersFor = (state: RunState): readonly ShopOffer[] => {
	const installed = state.pipeline.configs;
	const free = freeSpots(state.pipeline);
	const locked = state.lockedOfferIds ?? [];

	return state.draftOptions.map((config) => {
		const owned = installed.some((slotted) => slotted.id === config.id);
		const refusal = offerRefusal(state, config, free);
		const withIt = [...installed, config];
		return {
			config,
			priceKb: draftCostIn(installed, config),
			spots: spotsOf(config),
			owned,
			locked: locked.includes(config.id),
			installable: !owned && refusal === null,
			refusal,
			preview: pipelineModifiersFor(withIt, state.gatesCleared),
			previewPerAnswer: perAnswerPreviewFor(withIt, state.gatesCleared),
		};
	});
};

const extraSpotsViewFor = (state: RunState): ExtraSpotsView => {
	const held = state.extraSpots ?? 0;
	const unlocked = extraSpotsUnlocked(state.gatesCleared);
	const free = scheduledSpots(state.gatesCleared);

	const step = (spots: number, fromGate?: number): ExtraSpotOption => {
		const locked = fromGate !== undefined && spots > unlocked;
		const rentKb = extraRentKb(spots);
		return {
			spots,
			makes: free + spots,
			rentKb,
			held: spots === held,
			...(locked && fromGate !== undefined ? { fromGate } : {}),
			...(locked ? {} : { rentTooDear: state.storage < rentKb }),
		};
	};

	return {
		renting: held,
		perGateKb: extraRentKb(held),
		options: [
			step(0),
			...EXTRA_SPOT_TIERS.map((tier) => step(tier.spots, tier.fromGate)),
		],
	};
};

export const toRunView = (state: RunState): RunView => {
	const current = state.polls[state.currentIndex];
	const extraHeld = state.extraSpots ?? 0;
	const modifiers = pipelineModifiersFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const perAnswer = perAnswerPreviewFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const peelSpots = failPeelQuotaFor(
		state.pipeline.configs,
		state.gatesCleared
	);
	const liveAudits = liveAuditsFor(state.pipeline.configs, state.gatesCleared);
	const offline = offlinePairsOf(state).map((pair): OfflineConfig => ({
		config: pair.config,
		audit: pair.audit.name,
	}));
	const mirrored = mirrorsPolls(liveAudits);
	const audits = auditViewsFor(state);

	return {
		status: state.status,
		spots: state.pipeline.spots,
		spotsUsed: occupiedSpots(state.pipeline.configs),
		spotsFree: freeSpots(state.pipeline),
		overflowSpots: overflowSpots(state.pipeline),
		configs: state.pipeline.configs,
		installed: state.pipeline.configs.map((config) => ({
			config,
			spots: spotsOf(config),
			canMinify: canMinify(config),
			minifySavingSpots: minifySavingSpots(config),
		})),
		available: state.available,
		offers: offersFor(state),
		newConfigIds: state.draftedThisGate,
		peelSpotsRemaining: state.peelSpotsRemaining,
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
		pollTimeLimitMs:
			auditTimeLimitMs(liveAudits, state.window.answered) ?? null,
		currentPollPeeked:
			current !== undefined && (state.peekedPollIds ?? []).includes(current.id),
		correctAnswersThisGate:
			budgeterFor(state.pipeline.configs) === undefined
				? null
				: (state.window.budget ?? null),
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
			peelSpotsOnFailure: peelSpots,
			peelShareOnFailure: peelShareFor(
				state.pipeline.configs,
				state.gatesCleared
			),
			missIsFatal: isPeelFatal(
				peelSpots,
				occupiedSpots(state.pipeline.configs)
			),
			subscriptions: billLedger({
				configs: state.pipeline.configs,
				gate: state.gatesCleared,
				storageKb: state.storage,
				rentedSpots: extraHeld,
				spotRentKb: extraRentKb(extraHeld),
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
		extraSpots: extraSpotsViewFor(state),
	};
};

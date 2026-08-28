import {
	canMinify,
	type Config,
	isUpgradable,
	levelUp,
	minify as minified,
	minifySavingSpots,
	spotsOf,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
	hasRoomFor,
	type Pipeline,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";
import {
	draftCostIn,
	draftSeed,
	EXTEND_FROM_GATE,
	extendCost,
	LOCK_COST_KB,
	LOCK_FROM_GATE,
	MAX_EXTENSIONS,
	MAX_LOCKED_OFFERS,
	offerCount,
	rebuildCost,
	rollDraft,
	sellRefundIn,
	shopOffersFullRoster,
} from "~/modules/run/shop/domain/draft.model";
import {
	atMinimumWidth,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	pinCostFor,
	extraRentKb,
	extraSpotsUnlocked,
	spotsHeldWith,
} from "~/modules/run/run/domain/rules.model";
import {
	addStorage,
	type RunState,
	shopDraft,
	withLog,
	withPipeline,
} from "~/modules/run/run/domain/run.model";

const stayReward = (
	state: RunState,
	pipeline: Pipeline,
	draftOptions: readonly Config[],
	line: string
): RunState => ({
	...state,
	pipeline,
	draftOptions,
	log: withLog(state, line),
});

export const draft = (state: RunState, configId: string): RunState => {
	const chosen = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	if (!chosen) return state;
	const alreadyOwned = state.pipeline.configs.some(
		(candidate) => candidate.id === configId
	);
	const cost = draftCostIn(state.pipeline.configs, chosen);
	if (
		alreadyOwned ||
		!hasRoomFor(state.pipeline, spotsOf(chosen)) ||
		state.storage < cost
	)
		return state;
	const drafted = withPipeline(state.pipeline, [
		...state.pipeline.configs,
		chosen,
	]);
	return {
		...stayReward(
			state,
			drafted,
			chosen.offersFullRoster
				? shopDraft(
						{ ...state, pipeline: drafted },
						draftSeed(state.gatesCleared, state.rebuildsUsed)
					)
				: state.draftOptions,
			`Drafted ${chosen.label} (-${cost}KB).`
		),
		storage: state.storage - cost,
		draftedThisGate: [...state.draftedThisGate, chosen.id],
		lockedOfferIds: (state.lockedOfferIds ?? []).filter(
			(id) => id !== chosen.id
		),
	};
};

export const upgrade = (state: RunState, configId: string): RunState => {
	const owned = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!owned || !isUpgradable(owned)) return state;
	const level = owned.level ?? 1;
	const levelled = withPipeline(
		state.pipeline,
		state.pipeline.configs.map((config) =>
			config.id === configId ? levelUp(config) : config
		)
	);
	if (owned.focusCategory) {
		const have = state.coverageByCategory[owned.focusCategory] ?? 0;
		if (have < upgradeCoverageRequired(level)) return state;
	}
	const cost = upgradeStorageCost(level);
	if (state.storage < cost) return state;
	return stayReward(
		{ ...state, storage: state.storage - cost },
		levelled,
		state.draftOptions,
		`Upgraded ${owned.label} to L${level + 1} for ${cost}KB.`
	);
};

export const extraSpotsAvailable = (state: RunState): number =>
	extraSpotsUnlocked(state.gatesCleared);

export const canRentExtraSpots = (state: RunState, spots: number): boolean =>
	spots >= 0 &&
	spots <= extraSpotsAvailable(state) &&
	state.storage >= extraRentKb(spots);

export const setExtraSpots = (state: RunState, spots: number): RunState => {
	if (!canRentExtraSpots(state, spots)) return state;
	const wide = spotsHeldWith(state.gatesCleared, spots);
	return {
		...state,
		extraSpots: spots,
		pipeline: { ...state.pipeline, spots: wide },
		log: withLog(
			state,
			spots === 0
				? `Dropped the extra-spot rent — back to ${wide} spots.`
				: `Renting ${spots} extra spot${spots === 1 ? "" : "s"} — ${wide} wide, ${extraRentKb(spots)}KB a gate.`
		),
	};
};

export const minifyConfig = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || !canMinify(target)) return state;
	const freed = minifySavingSpots(target);
	return stayReward(
		state,
		withPipeline(
			state.pipeline,
			state.pipeline.configs.map((config) =>
				config.id === configId ? minified(config) : config
			)
		),
		state.draftOptions,
		`Minified ${target.label} — ${freed} spot${freed > 1 ? "s" : ""} freed, half the bonus gone.`
	);
};

const pinSoldAt = (gatesCleared: number): boolean =>
	gatesCleared >= PIN_FROM_GATE && gatesCleared <= PIN_UNTIL_GATE;

export const plantPin = (state: RunState): RunState => {
	if (state.pinPlantedAtGate !== undefined) return state;
	if (!pinSoldAt(state.gatesCleared)) return state;
	const cost = pinCostFor(state.gatesCleared);
	if (state.storage < cost) return state;
	return {
		...state,
		storage: state.storage - cost,
		pinPlantedAtGate: state.gatesCleared,
		log: withLog(
			state,
			`git tag planted at gate ${state.gatesCleared} (-${cost}KB) — your next run checks out here.`
		),
	};
};

export const canPlantPin = (state: RunState): boolean =>
	state.pinPlantedAtGate === undefined &&
	pinSoldAt(state.gatesCleared) &&
	state.storage >= pinCostFor(state.gatesCleared);

export const pinAvailable = (state: RunState): boolean =>
	state.pinPlantedAtGate === undefined && pinSoldAt(state.gatesCleared);

export const finishReward = (state: RunState): RunState => {
	return {
		...state,
		draftOptions: [],
		rebuildsUsed: 0,
		draftedThisGate: [],
		answeredThisGate: [],
		faucetThisGateKb: 0,
		gateRewardKb: 0,
		redoGate: undefined,
		autoUpgradedConfigId: undefined,
		deletedConfigs: undefined,
		lapsedConfigs: undefined,
		subscriptionBillKb: 0,
		spotRentKb: 0,
		rentDefaulted: undefined,
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

export const canRebuild = (state: RunState): boolean =>
	state.storage >= rebuildCost(state.rebuildsUsed);

export const rebuildAvailable = (state: RunState): boolean =>
	!shopOffersFullRoster(state.pipeline.configs);

export const lockAvailable = (state: RunState): boolean =>
	state.gatesCleared >= LOCK_FROM_GATE &&
	(state.lockedOfferIds ?? []).length < MAX_LOCKED_OFFERS &&
	!shopOffersFullRoster(state.pipeline.configs);

export const canLock = (state: RunState): boolean =>
	state.storage >= LOCK_COST_KB;

export const extendAvailable = (state: RunState): boolean =>
	state.gatesCleared >= EXTEND_FROM_GATE &&
	(state.extensionsBought ?? 0) < MAX_EXTENSIONS &&
	!shopOffersFullRoster(state.pipeline.configs);

export const canExtend = (state: RunState): boolean =>
	state.storage >= extendCost(state.extensionsBought ?? 0);

export const rebuildDraft = (state: RunState): RunState => {
	if (!rebuildAvailable(state) || !canRebuild(state)) return state;
	const cost = rebuildCost(state.rebuildsUsed);
	const nextRebuilds = state.rebuildsUsed + 1;
	return {
		...state,
		storage: state.storage - cost,
		rebuildsUsed: nextRebuilds,
		draftOptions: shopDraft(state, draftSeed(state.gatesCleared, nextRebuilds)),
		log: withLog(state, `Rebuilt the draft (-${cost}KB).`),
	};
};

export const lockOffer = (state: RunState, configId: string): RunState => {
	if (!lockAvailable(state) || !canLock(state)) return state;
	const offer = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	const locked = state.lockedOfferIds ?? [];
	if (!offer || locked.includes(configId)) return state;
	return {
		...state,
		storage: state.storage - LOCK_COST_KB,
		lockedOfferIds: [...locked, configId],
		log: withLog(
			state,
			`Locked ${offer.label} (-${LOCK_COST_KB}KB) — it holds until you install it.`
		),
	};
};

export const extendOffers = (state: RunState): RunState => {
	if (!extendAvailable(state) || !canExtend(state)) return state;
	const bought = state.extensionsBought ?? 0;
	const cost = extendCost(bought);
	const extensions = bought + 1;
	const [drawn] = rollDraft(
		draftSeed(state.gatesCleared, state.rebuildsUsed, extensions),
		[...state.pipeline.configs, ...state.draftOptions],
		[],
		1
	);
	return {
		...state,
		storage: state.storage - cost,
		extensionsBought: extensions,
		draftOptions: drawn ? [...state.draftOptions, drawn] : state.draftOptions,
		log: withLog(
			state,
			`Extended the shop to ${offerCount(extensions)} offers (-${cost}KB).`
		),
	};
};

const pipelineAtMinimumWidth = (state: RunState): boolean =>
	atMinimumWidth(state.pipeline.configs.length);

export const sell = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || pipelineAtMinimumWidth(state)) return state;
	const refund = sellRefundIn(state.pipeline.configs, target);
	return {
		...state,
		pipeline: stripConfig(state.pipeline, configId),
		storage: addStorage(state.storage, refund),
		log: withLog(state, `Sold ${target.label} (+${refund}KB).`),
	};
};

export const drop = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || pipelineAtMinimumWidth(state)) return state;
	return {
		...state,
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
		log: withLog(state, "Dropped a config to make room."),
	};
};

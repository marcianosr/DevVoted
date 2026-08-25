import {
	type Config,
	isUpgradable,
	levelUp,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
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
	isStoragePlanUnlocked,
	PIN_FROM_GATE,
	PIN_UNTIL_GATE,
	pinCostFor,
	STORAGE_PLANS,
	storagePlanFor,
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
		state.pipeline.configs.length >= state.pipeline.slots ||
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
			// WTFPL takes effect at the counter, reopening this visit's table.
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
	// Gated twice: coverage is permission, KB is the price. Neither stands in for the other.
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

export const changePlan = (state: RunState, tier: number): RunState => {
	const current = storagePlanFor(state.storagePlan);
	const next = STORAGE_PLANS.find((plan) => plan.tier === tier);
	if (!next || next.tier === current.tier) return state;
	if (!isStoragePlanUnlocked(next, state.gatesCleared)) return state;
	const clamped = Math.min(state.storage, next.capKb);
	const burned = state.storage - clamped;
	const upgradeLine = `Storage plan upgraded: ${next.capKb}KB cap for ${next.billKb}KB per gate.`;
	const downgradeLine = `Storage plan downgraded to a ${next.capKb}KB cap${
		burned > 0 ? ` — ${burned}KB over it burned` : ""
	}.`;
	return {
		...state,
		storagePlan: next.tier,
		storage: clamped,
		log: withLog(state, next.tier > current.tier ? upgradeLine : downgradeLine),
	};
};

/** ADR-036. Past gate 10 a rescue resumes a starter build into stacked audits, so it is not sold. */
const pinSoldAt = (gatesCleared: number): boolean =>
	gatesCleared >= PIN_FROM_GATE && gatesCleared <= PIN_UNTIL_GATE;

/** ADR-036. One per run; the tag persists on the account and outlives this run's death. */
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

/** Exported so the shop button asks the rule; the reducer refuses either way. */
export const canPlantPin = (state: RunState): boolean =>
	state.pinPlantedAtGate === undefined &&
	pinSoldAt(state.gatesCleared) &&
	state.storage >= pinCostFor(state.gatesCleared);

/** Whether this depth of climb sells the tag at all (same split as ADR-029). */
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
		gateBillKb: 0,
		planDowngraded: false,
		redoGate: undefined,
		justUnlockedSlots: [],
		autoUpgradedConfigId: undefined,
		deletedConfigs: undefined,
		lapsedConfigs: undefined,
		subscriptionBillKb: 0,
		storage: Math.min(state.storage, storagePlanFor(state.storagePlan).capKb),
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

/** ADR-029. `{name}Available` is whether this depth sells it, `can{Name}` whether the run can pay: the shop hides one and disables the other. */
export const canRebuild = (state: RunState): boolean =>
	state.storage >= rebuildCost(state.rebuildsUsed);

/** WTFPL retires all three: rerolling a table that already shows everything sells nothing. */
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
	// Per-offer, so it stays here: the view answers it from lockedOfferIds.
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

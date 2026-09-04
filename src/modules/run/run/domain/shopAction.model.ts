import {
	abArmLabel,
	canMinify,
	type Config,
	isUpgradable,
	levelUp,
	minify as minified,
	minifySavingSlots,
	slotsOf,
	switchArm,
	upgradeCoverageRequired,
	upgradeStorageCost,
} from "~/modules/run/config/domain/config.model";
import {
	freeSlots,
	hasRoomFor,
	type Build,
	lockerFor,
	locksSurviving,
	stripConfig,
} from "~/modules/run/build/domain/build.model";
import {
	draftCostIn,
	draftSeed,
	EXTEND_FROM_GATE,
	extendCost,
	isUpgradeOffer,
	LOCK_COST_KB,
	MAX_EXTENSIONS,
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
	BASE_SLOTS,
	MAX_SLOTS,
	nextSlotPriceKb,
	planBillKb,
	slotCashOutKb,
	STORAGE_PLANS,
	storagePlanFor,
} from "~/modules/run/run/domain/rules.model";
import {
	addStorage,
	type RunState,
	shopDraft,
	withLog,
	withBuild,
} from "~/modules/run/run/domain/run.model";

const stayReward = (
	state: RunState,
	build: Build,
	draftOptions: readonly Config[],
	line: string
): RunState => ({
	...state,
	build,
	draftOptions,
	log: withLog(state, line),
});

const draftUpgrade = (
	state: RunState,
	offer: Config,
	cost: number
): RunState => ({
	...stayReward(
		state,
		withBuild(
			state.build,
			state.build.configs.map((config) =>
				config.id === offer.id ? offer : config
			)
		),
		state.draftOptions.filter((option) => option !== offer),
		`Drafted ${offer.label} v${offer.level ?? 1} (-${cost}KB).`
	),
	storage: state.storage - cost,
	draftedThisGate: [...state.draftedThisGate, offer.id],
});

export const draft = (state: RunState, configId: string): RunState => {
	const chosen = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	if (!chosen) return state;
	const alreadyOwned = state.build.configs.some(
		(candidate) => candidate.id === configId
	);
	const cost = draftCostIn(state.build.configs, chosen);
	if (isUpgradeOffer(state.build.configs, chosen))
		return state.storage < cost ? state : draftUpgrade(state, chosen, cost);
	if (
		alreadyOwned ||
		!hasRoomFor(state.build, slotsOf(chosen)) ||
		state.storage < cost
	)
		return state;
	const drafted = withBuild(state.build, [...state.build.configs, chosen]);
	return {
		...stayReward(
			state,
			drafted,
			chosen.offersFullRoster
				? shopDraft(
						{ ...state, build: drafted },
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
	const owned = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!owned || !isUpgradable(owned)) return state;
	const level = owned.level ?? 1;
	const levelled = withBuild(
		state.build,
		state.build.configs.map((config) =>
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

export const slotPriceFor = (state: RunState): number | undefined =>
	nextSlotPriceKb(state.slotsBought ?? 0);

export const canBuySlot = (state: RunState): boolean => {
	const price = slotPriceFor(state);
	return (
		price !== undefined &&
		state.build.slots < MAX_SLOTS &&
		state.storage >= price
	);
};

export const buySlot = (state: RunState): RunState => {
	const price = slotPriceFor(state);
	if (price === undefined || !canBuySlot(state)) return state;
	const slots = state.build.slots + 1;
	return {
		...state,
		slotsBought: (state.slotsBought ?? 0) + 1,
		storage: state.storage - price,
		build: { ...state.build, slots },
		log: withLog(state, `Bought a slot for ${price}KB — ${slots} wide.`),
	};
};

export const slotCashOutFor = (state: RunState): number | undefined =>
	state.build.slots > BASE_SLOTS ? slotCashOutKb(state.build.slots) : undefined;

export const canCashSlot = (state: RunState): boolean =>
	slotCashOutFor(state) !== undefined && freeSlots(state.build) > 0;

export const cashSlot = (state: RunState): RunState => {
	const refund = slotCashOutFor(state);
	if (refund === undefined || !canCashSlot(state)) return state;
	const slots = state.build.slots - 1;
	return {
		...state,
		storage: addStorage(state.storage, refund, state.storagePlan ?? 0),
		build: { ...state.build, slots },
		log: withLog(state, `Cashed a slot for ${refund}KB — ${slots} wide.`),
	};
};

export const canSetStoragePlan = (tier: number): boolean =>
	tier >= 0 && tier < STORAGE_PLANS.length;

export const canAffordPlan = (state: RunState, tier: number): boolean =>
	tier <= (state.storagePlan ?? 0) || planBillKb(tier) <= state.storage;

export const setStoragePlan = (state: RunState, tier: number): RunState => {
	if (!canSetStoragePlan(tier) || !canAffordPlan(state, tier)) return state;
	const plan = storagePlanFor(tier);
	return {
		...state,
		storagePlan: tier,
		storage: Math.min(state.storage, plan.capKb),
		log: withLog(
			state,
			plan.perGateKb === 0
				? `Back on the free plan — ${plan.capKb}KB cap.`
				: `On the ${plan.capKb}KB plan — ${plan.perGateKb}KB a gate.`
		),
	};
};

export const minifyConfig = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || !canMinify(target)) return state;
	const freed = minifySavingSlots(target);
	return stayReward(
		state,
		withBuild(
			state.build,
			state.build.configs.map((config) =>
				config.id === configId ? minified(config) : config
			)
		),
		state.draftOptions,
		`Minified ${target.label} — ${freed} slot${freed > 1 ? "s" : ""} freed, half the bonus gone.`
	);
};

export const switchAbArm = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	const switched = target === undefined ? undefined : switchArm(target);
	if (!target || switched === target || switched?.abArm === undefined)
		return state;
	return stayReward(
		state,
		withBuild(
			state.build,
			state.build.configs.map((config) =>
				config.id === configId ? switched : config
			)
		),
		state.draftOptions,
		`${target.label} switches to arm ${abArmLabel(switched.abArm)}.`
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
		planBilledKb: 0,
		planDowngraded: undefined,
		status: "answering",
		log: withLog(state, "Climbing on."),
	};
};

export const canRebuild = (state: RunState): boolean =>
	state.storage >= rebuildCost(state.rebuildsUsed);

export const rebuildAvailable = (state: RunState): boolean =>
	!shopOffersFullRoster(state.build.configs);

export const lockAvailable = (state: RunState): boolean =>
	lockerFor(state.build.configs) !== undefined &&
	!shopOffersFullRoster(state.build.configs);

export const canLock = (state: RunState): boolean =>
	state.storage >= LOCK_COST_KB;

export const extendAvailable = (state: RunState): boolean =>
	state.gatesCleared >= EXTEND_FROM_GATE &&
	(state.extensionsBought ?? 0) < MAX_EXTENSIONS &&
	!shopOffersFullRoster(state.build.configs);

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
			`Locked ${offer.label} (-${LOCK_COST_KB}KB) — it holds until you install or release it.`
		),
	};
};

export const unlockOffer = (state: RunState, configId: string): RunState => {
	const locked = state.lockedOfferIds ?? [];
	if (!locked.includes(configId)) return state;
	const offer = state.draftOptions.find(
		(candidate) => candidate.id === configId
	);
	return {
		...state,
		lockedOfferIds: locked.filter((id) => id !== configId),
		log: withLog(
			state,
			`Released ${offer?.label ?? configId} — the next roll may replace it.`
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
		[...state.build.configs, ...state.draftOptions],
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

const buildAtMinimumWidth = (state: RunState): boolean =>
	atMinimumWidth(state.build.configs.length);

export const sell = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || buildAtMinimumWidth(state)) return state;
	const refund = sellRefundIn(state.build.configs, target);
	const build = stripConfig(state.build, configId);
	return {
		...state,
		build,
		storage: addStorage(state.storage, refund, state.storagePlan ?? 0),
		lockedOfferIds: locksSurviving(build.configs, state.lockedOfferIds),
		log: withLog(state, `Sold ${target.label} (+${refund}KB).`),
	};
};

export const drop = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!target || buildAtMinimumWidth(state)) return state;
	const build = withBuild(
		state.build,
		state.build.configs.filter((candidate) => candidate.id !== configId)
	);
	return {
		...state,
		build,
		lockedOfferIds: locksSurviving(build.configs, state.lockedOfferIds),
		log: withLog(state, "Dropped a config to make room."),
	};
};

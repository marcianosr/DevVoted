import { slotsOf } from "~/modules/run/config/domain/config.model";
import { recommendedPicks } from "~/modules/run/config/domain/hand.model";
import { auditsCloseShop } from "~/modules/run/gate/domain/audit.model";
import { hasRoomFor } from "~/modules/run/build/domain/build.model";
import {
	spendLint,
	spendPeek,
} from "~/modules/run/run/domain/paidAction.model";
import {
	auditsOf,
	canStart,
	type RunState,
	withBuild,
} from "~/modules/run/run/domain/run.model";
import { answer } from "~/modules/run/run/domain/answer.model";
import {
	buySlot,
	cashSlot,
	setStoragePlan,
	draft,
	drop,
	extendOffers,
	finishReward,
	lockOffer,
	unlockOffer,
	minifyConfig,
	switchAbArm,
	plantPin,
	rebuildDraft,
	sell,
	upgrade,
} from "~/modules/run/run/domain/shopAction.model";
import {
	minifyForPeel,
	resumeClimb,
	strip,
} from "~/modules/run/run/domain/strip.model";

export type RunAction =
	| { readonly type: "install"; readonly configId: string }
	| { readonly type: "uninstall"; readonly configId: string }
	| { readonly type: "start" }
	| {
			readonly type: "answer";
			readonly optionIds: readonly string[];
			readonly elapsedMs?: number;
	  }
	| { readonly type: "lint-poll" }
	| { readonly type: "peek-poll" }
	| { readonly type: "strip"; readonly configId: string }
	| { readonly type: "resume-climb" }
	| { readonly type: "draft"; readonly configId: string }
	| { readonly type: "upgrade"; readonly configId: string }
	| { readonly type: "rebuild-draft" }
	| { readonly type: "lock-offer"; readonly configId: string }
	| { readonly type: "unlock-offer"; readonly configId: string }
	| { readonly type: "extend-offers" }
	| { readonly type: "plant-pin" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string }
	| { readonly type: "minify"; readonly configId: string }
	| { readonly type: "switch-arm"; readonly configId: string }
	| { readonly type: "buy-slot" }
	| { readonly type: "cash-slot" }
	| { readonly type: "set-storage-plan"; readonly tier: number };

const installConfig = (state: RunState, configId: string): RunState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	const built = state.build.configs.some(
		(candidate) => candidate.id === configId
	);
	if (!config || built || !hasRoomFor(state.build, slotsOf(config)))
		return state;
	return {
		...state,
		build: withBuild(state.build, [...state.build.configs, config]),
	};
};

const uninstallConfig = (state: RunState, configId: string): RunState => {
	const config = state.build.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!config) return state;
	return {
		...state,
		build: withBuild(
			state.build,
			state.build.configs.filter((candidate) => candidate.id !== configId)
		),
	};
};

const start = (state: RunState): RunState => {
	if (!canStart(state.build)) return state;
	return { ...state, status: "answering" };
};

export const withRecommendedBuild = (state: RunState): RunState =>
	recommendedPicks(state.available, state.build.slots).reduce(
		(run, config) => runReducer(run, { type: "install", configId: config.id }),
		state
	);

const SHOP_WRITES: readonly RunAction["type"][] = [
	"draft",
	"upgrade",
	"rebuild-draft",
	"lock-offer",
	"unlock-offer",
	"extend-offers",
	"plant-pin",
	"buy-slot",
	"cash-slot",
	"set-storage-plan",
	"sell",
];

export const isShopLocked = (state: RunState): boolean =>
	auditsCloseShop(auditsOf(state));

export const runReducer = (state: RunState, action: RunAction): RunState => {
	if (SHOP_WRITES.includes(action.type) && isShopLocked(state)) return state;
	if (action.type === "install" && state.status === "configuring")
		return installConfig(state, action.configId);
	if (action.type === "uninstall" && state.status === "configuring")
		return uninstallConfig(state, action.configId);
	if (action.type === "start" && state.status === "configuring")
		return start(state);
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionIds, action.elapsedMs);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "peek-poll" && state.status === "answering")
		return spendPeek(state);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.configId);
	if (action.type === "minify" && state.status === "awaiting-strip")
		return minifyForPeel(state, action.configId);
	if (action.type === "resume-climb" && state.status === "awaiting-strip")
		return resumeClimb(state);
	if (action.type === "draft" && state.status === "rewarding")
		return draft(state, action.configId);
	if (action.type === "upgrade" && state.status === "rewarding")
		return upgrade(state, action.configId);
	if (action.type === "rebuild-draft" && state.status === "rewarding")
		return rebuildDraft(state);
	if (action.type === "lock-offer" && state.status === "rewarding")
		return lockOffer(state, action.configId);
	if (action.type === "unlock-offer" && state.status === "rewarding")
		return unlockOffer(state, action.configId);
	if (action.type === "extend-offers" && state.status === "rewarding")
		return extendOffers(state);
	if (action.type === "plant-pin" && state.status === "rewarding")
		return plantPin(state);
	if (action.type === "finish-reward" && state.status === "rewarding")
		return finishReward(state);
	if (action.type === "buy-slot" && state.status === "rewarding")
		return buySlot(state);
	if (action.type === "cash-slot" && state.status === "rewarding")
		return cashSlot(state);
	if (action.type === "set-storage-plan" && state.status === "rewarding")
		return setStoragePlan(state, action.tier);
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	if (action.type === "minify" && state.status === "rewarding")
		return minifyConfig(state, action.configId);
	if (
		action.type === "switch-arm" &&
		(state.status === "rewarding" || state.status === "answering")
	)
		return switchAbArm(state, action.configId);
	if (
		action.type === "drop" &&
		(state.status === "rewarding" ||
			(state.status === "answering" && state.window.answered === 0))
	)
		return drop(state, action.configId);
	return state;
};

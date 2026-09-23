import { slotsOf } from "~/modules/run/config/domain/config.model";
import { auditsCloseShop } from "~/modules/run/gate/domain/audit.model";
import { hasRoomFor } from "~/modules/run/build/domain/build.model";
import {
	spendLint,
	spendBuyBack,
	spendPeek,
} from "~/modules/run/run/domain/paidAction.model";
import {
	auditsOf,
	canStart,
	isPrepPhase,
	type RunState,
	withBuild,
	withPeakStorage,
} from "~/modules/run/run/domain/run.model";
import { answer, closeGate } from "~/modules/run/run/domain/answer.model";
import { commitEstimate } from "~/modules/run/run/domain/estimate.model";
import { commitBand } from "~/modules/run/run/domain/sla.model";
import {
	canVendorLock,
	commitVendorLock,
	isVendorLocked,
} from "~/modules/run/build/domain/vendorLock.model";
import { rebase } from "~/modules/run/run/domain/rebase.model";
import { armStrict } from "~/modules/run/run/domain/strict.model";
import { fireAudit } from "~/modules/run/run/domain/attack.model";
import {
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
	refuseGate,
	resumeClimb,
	strip,
} from "~/modules/run/run/domain/strip.model";

export type RunAction =
	| { readonly type: "install"; readonly configId: string }
	| { readonly type: "uninstall"; readonly configId: string }
	| { readonly type: "start" }
	| { readonly type: "rebase"; readonly from: number; readonly to: number }
	| { readonly type: "estimate"; readonly count: number }
	| { readonly type: "commit-band"; readonly band: string }
	| { readonly type: "fire-audit" }
	| {
			readonly type: "answer";
			readonly optionIds: readonly string[];
			readonly elapsedMs?: number;
	  }
	| { readonly type: "close-gate" }
	| { readonly type: "lint-poll" }
	| { readonly type: "peek-poll" }
	| { readonly type: "arm-strict" }
	| { readonly type: "buy-back-option"; readonly optionId: string }
	| { readonly type: "strip"; readonly configIds: readonly string[] }
	| { readonly type: "refuse-gate" }
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
	| { readonly type: "vendor-lock"; readonly configId: string };

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
	if (isVendorLocked(state, configId)) return state;
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
	if (canVendorLock(state)) return state;
	return { ...state, status: "answering" };
};

const SHOP_WRITES: readonly RunAction["type"][] = [
	"draft",
	"upgrade",
	"rebuild-draft",
	"lock-offer",
	"unlock-offer",
	"extend-offers",
	"plant-pin",
	"sell",
	"vendor-lock",
];

export const isShopLocked = (state: RunState): boolean =>
	auditsCloseShop(auditsOf(state));

const reduce = (state: RunState, action: RunAction): RunState => {
	if (SHOP_WRITES.includes(action.type) && isShopLocked(state)) return state;
	if (action.type === "install" && state.status === "configuring")
		return installConfig(state, action.configId);
	if (action.type === "uninstall" && state.status === "configuring")
		return uninstallConfig(state, action.configId);
	if (action.type === "start" && state.status === "configuring")
		return start(state);
	if (action.type === "rebase") return rebase(state, action.from, action.to);
	if (action.type === "estimate") return commitEstimate(state, action.count);
	if (action.type === "commit-band") return commitBand(state, action.band);
	if (action.type === "fire-audit") return fireAudit(state);
	if (action.type === "answer" && state.status === "answering")
		return answer(state, action.optionIds, action.elapsedMs);
	if (action.type === "close-gate" && state.status === "answering")
		return closeGate(state);
	if (action.type === "lint-poll" && state.status === "answering")
		return spendLint(state);
	if (action.type === "peek-poll" && state.status === "answering")
		return spendPeek(state);
	if (action.type === "arm-strict" && state.status === "answering")
		return armStrict(state);
	if (action.type === "buy-back-option" && state.status === "answering")
		return spendBuyBack(state, action.optionId);
	if (action.type === "strip" && state.status === "awaiting-strip")
		return strip(state, action.configIds);
	if (action.type === "minify" && state.status === "awaiting-strip")
		return minifyForPeel(state, action.configId);
	if (action.type === "refuse-gate" && state.status === "awaiting-strip")
		return refuseGate(state);
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
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	if (action.type === "vendor-lock" && isPrepPhase(state))
		return commitVendorLock(state, action.configId);
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

// A refused action returns the state it was handed, identity included, so the
// mark is only ever taken off a state something actually happened to.
export const runReducer = (state: RunState, action: RunAction): RunState => {
	const next = reduce(state, action);
	return next === state ? state : withPeakStorage(next);
};

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

type ActionRule = {
	readonly type: RunAction["type"];
	readonly when?: (state: RunState) => boolean;
	readonly run: (state: RunState, action: RunAction) => RunState;
};

const isAction = <K extends RunAction["type"]>(
	action: RunAction,
	type: K
): action is Extract<RunAction, { type: K }> => action.type === type;

/**
 * Widens one typed rule into the table's shape. The narrowing lives here rather
 * than in each entry, so a rule states only its own action type and payload.
 */
const on = <K extends RunAction["type"]>(spec: {
	readonly type: K;
	readonly when?: (state: RunState) => boolean;
	readonly run: (
		state: RunState,
		action: Extract<RunAction, { type: K }>
	) => RunState;
}): ActionRule => ({
	type: spec.type,
	when: spec.when,
	run: (state, action) =>
		isAction(action, spec.type) ? spec.run(state, action) : state,
});

const inStatus =
	(...statuses: readonly RunState["status"][]) =>
	(state: RunState): boolean =>
		statuses.includes(state.status);

// A config may be dropped freely while rewarding, but mid-gate only before the
// first answer lands — once the window has scored, the build is what it was.
const canDrop = (state: RunState): boolean =>
	state.status === "rewarding" ||
	(state.status === "answering" && state.window.answered === 0);

/**
 * First match wins, so order is behaviour. `minify` appears twice on purpose:
 * peeling and shopping spell the same action differently, and the status is the
 * only thing that separates them.
 */
const RULES: readonly ActionRule[] = [
	on({
		type: "install",
		when: inStatus("configuring"),
		run: (state, action) => installConfig(state, action.configId),
	}),
	on({
		type: "uninstall",
		when: inStatus("configuring"),
		run: (state, action) => uninstallConfig(state, action.configId),
	}),
	on({
		type: "start",
		when: inStatus("configuring"),
		run: (state) => start(state),
	}),
	on({
		type: "rebase",
		run: (state, action) => rebase(state, action.from, action.to),
	}),
	on({
		type: "estimate",
		run: (state, action) => commitEstimate(state, action.count),
	}),
	on({
		type: "commit-band",
		run: (state, action) => commitBand(state, action.band),
	}),
	on({ type: "fire-audit", run: (state) => fireAudit(state) }),
	on({
		type: "answer",
		when: inStatus("answering"),
		run: (state, action) => answer(state, action.optionIds, action.elapsedMs),
	}),
	on({
		type: "close-gate",
		when: inStatus("answering"),
		run: (state) => closeGate(state),
	}),
	on({
		type: "lint-poll",
		when: inStatus("answering"),
		run: (state) => spendLint(state),
	}),
	on({
		type: "peek-poll",
		when: inStatus("answering"),
		run: (state) => spendPeek(state),
	}),
	on({
		type: "arm-strict",
		when: inStatus("answering"),
		run: (state) => armStrict(state),
	}),
	on({
		type: "buy-back-option",
		when: inStatus("answering"),
		run: (state, action) => spendBuyBack(state, action.optionId),
	}),
	on({
		type: "strip",
		when: inStatus("awaiting-strip"),
		run: (state, action) => strip(state, action.configIds),
	}),
	on({
		type: "minify",
		when: inStatus("awaiting-strip"),
		run: (state, action) => minifyForPeel(state, action.configId),
	}),
	on({
		type: "refuse-gate",
		when: inStatus("awaiting-strip"),
		run: (state) => refuseGate(state),
	}),
	on({
		type: "resume-climb",
		when: inStatus("awaiting-strip"),
		run: (state) => resumeClimb(state),
	}),
	on({
		type: "draft",
		when: inStatus("rewarding"),
		run: (state, action) => draft(state, action.configId),
	}),
	on({
		type: "upgrade",
		when: inStatus("rewarding"),
		run: (state, action) => upgrade(state, action.configId),
	}),
	on({
		type: "rebuild-draft",
		when: inStatus("rewarding"),
		run: (state) => rebuildDraft(state),
	}),
	on({
		type: "lock-offer",
		when: inStatus("rewarding"),
		run: (state, action) => lockOffer(state, action.configId),
	}),
	on({
		type: "unlock-offer",
		when: inStatus("rewarding"),
		run: (state, action) => unlockOffer(state, action.configId),
	}),
	on({
		type: "extend-offers",
		when: inStatus("rewarding"),
		run: (state) => extendOffers(state),
	}),
	on({
		type: "plant-pin",
		when: inStatus("rewarding"),
		run: (state) => plantPin(state),
	}),
	on({
		type: "finish-reward",
		when: inStatus("rewarding"),
		run: (state) => finishReward(state),
	}),
	on({
		type: "sell",
		when: inStatus("rewarding"),
		run: (state, action) => sell(state, action.configId),
	}),
	on({
		type: "vendor-lock",
		when: isPrepPhase,
		run: (state, action) => commitVendorLock(state, action.configId),
	}),
	on({
		type: "minify",
		when: inStatus("rewarding"),
		run: (state, action) => minifyConfig(state, action.configId),
	}),
	on({
		type: "switch-arm",
		when: inStatus("rewarding", "answering"),
		run: (state, action) => switchAbArm(state, action.configId),
	}),
	on({
		type: "drop",
		when: canDrop,
		run: (state, action) => drop(state, action.configId),
	}),
];

const ruleFor = (state: RunState, action: RunAction) =>
	RULES.find(
		(rule) => rule.type === action.type && (rule.when?.(state) ?? true)
	);

const reduce = (state: RunState, action: RunAction): RunState => {
	if (SHOP_WRITES.includes(action.type) && isShopLocked(state)) return state;
	const rule = ruleFor(state, action);
	return rule ? rule.run(state, action) : state;
};

// A refused action returns the state it was handed, identity included, so the
// mark is only ever taken off a state something actually happened to.
export const runReducer = (state: RunState, action: RunAction): RunState => {
	const next = reduce(state, action);
	return next === state ? state : withPeakStorage(next);
};

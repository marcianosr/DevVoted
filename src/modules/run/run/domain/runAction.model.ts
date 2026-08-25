import { starterStackFor } from "~/modules/run/config/domain/stack.model";
import { auditsCloseShop } from "~/modules/run/gate/domain/audit.model";
import {
	spendLint,
	spendPeek,
} from "~/modules/run/run/domain/paidAction.model";
import {
	auditsOf,
	canStart,
	type RunState,
	withPipeline,
} from "~/modules/run/run/domain/run.model";
import { answer } from "~/modules/run/run/domain/answer.model";
import {
	changePlan,
	draft,
	drop,
	extendOffers,
	finishReward,
	lockOffer,
	plantPin,
	rebuildDraft,
	sell,
	upgrade,
} from "~/modules/run/run/domain/shopAction.model";
import { resumeClimb, strip } from "~/modules/run/run/domain/strip.model";
import {} from "~/modules/run/run/domain/paidAction.model";

export type RunAction =
	| { readonly type: "slot"; readonly configId: string }
	| { readonly type: "unslot"; readonly configId: string }
	| { readonly type: "pick-stack"; readonly stackId: string }
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
	| { readonly type: "extend-offers" }
	| { readonly type: "plant-pin" }
	| { readonly type: "finish-reward" }
	| { readonly type: "sell"; readonly configId: string }
	| { readonly type: "drop"; readonly configId: string }
	| { readonly type: "change-plan"; readonly tier: number };

const slotConfig = (state: RunState, configId: string): RunState => {
	const config = state.available.find((candidate) => candidate.id === configId);
	if (!config || state.pipeline.configs.length >= state.pipeline.slots)
		return state;
	return {
		...state,
		available: state.available.filter((candidate) => candidate.id !== configId),
		pipeline: withPipeline(state.pipeline, [...state.pipeline.configs, config]),
	};
};

const pickStack = (state: RunState, stackId: string): RunState => {
	const stack = starterStackFor(stackId);
	if (!stack || stack.configs.length > state.pipeline.slots) return state;
	const pool = [...state.pipeline.configs, ...state.available];
	const members = stack.configs.flatMap((member) => {
		const handed = pool.find((config) => config.id === member.id);
		return handed ? [handed] : [];
	});
	if (members.length < stack.configs.length) return state;
	const memberIds = new Set(members.map((config) => config.id));
	return {
		...state,
		pipeline: withPipeline(state.pipeline, members),
		available: pool.filter((config) => !memberIds.has(config.id)),
	};
};

const unslotConfig = (state: RunState, configId: string): RunState => {
	const config = state.pipeline.configs.find(
		(candidate) => candidate.id === configId
	);
	if (!config) return state;
	return {
		...state,
		available: [...state.available, config],
		pipeline: withPipeline(
			state.pipeline,
			state.pipeline.configs.filter((candidate) => candidate.id !== configId)
		),
	};
};

const start = (state: RunState): RunState => {
	if (!canStart(state.pipeline)) return state;
	return { ...state, status: "answering" };
};

/** Read-only (ADR-038) refuses these. `drop` is absent deliberately: it belongs to the gate door, and `atMinimumWidth` governs it. */
const SHOP_WRITES: readonly RunAction["type"][] = [
	"draft",
	"upgrade",
	"rebuild-draft",
	"lock-offer",
	"extend-offers",
	"plant-pin",
	"change-plan",
	"sell",
];

/** Whether the coming gate's audits have shut the shop (ADR-038). */
export const isShopLocked = (state: RunState): boolean =>
	auditsCloseShop(auditsOf(state));

export const runReducer = (state: RunState, action: RunAction): RunState => {
	if (SHOP_WRITES.includes(action.type) && isShopLocked(state)) return state;
	if (action.type === "slot" && state.status === "configuring")
		return slotConfig(state, action.configId);
	if (action.type === "unslot" && state.status === "configuring")
		return unslotConfig(state, action.configId);
	if (action.type === "pick-stack" && state.status === "configuring")
		return pickStack(state, action.stackId);
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
	if (action.type === "extend-offers" && state.status === "rewarding")
		return extendOffers(state);
	if (action.type === "plant-pin" && state.status === "rewarding")
		return plantPin(state);
	if (action.type === "finish-reward" && state.status === "rewarding")
		return finishReward(state);
	if (action.type === "change-plan" && state.status === "rewarding")
		return changePlan(state, action.tier);
	if (action.type === "sell" && state.status === "rewarding")
		return sell(state, action.configId);
	if (
		action.type === "drop" &&
		(state.status === "rewarding" ||
			(state.status === "answering" && state.window.answered === 0))
	)
		return drop(state, action.configId);
	return state;
};

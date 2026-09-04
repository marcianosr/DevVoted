import {
	canMinify,
	minify as minified,
	minifySavingSlots,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	isBare,
	locksSurviving,
	stripConfig,
} from "~/modules/run/build/domain/build.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	freshWindow,
	type RunState,
	shopDraft,
	withLog,
	withBuild,
} from "~/modules/run/run/domain/run.model";

const paid = (
	state: RunState,
	build: RunState["build"],
	freed: number,
	line: string
): RunState => {
	const remaining = Math.max(0, state.peelSlotsRemaining - freed);
	return {
		...state,
		build,
		lockedOfferIds: locksSurviving(build.configs, state.lockedOfferIds),
		peelSlotsRemaining: remaining,
		log: withLog(
			state,
			remaining > 0
				? `${line} ${remaining} more slot${remaining > 1 ? "s" : ""} to free.`
				: `${line} Peel paid — rebuild in the shop.`
		),
	};
};

export const strip = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find((config) => config.id === configId);
	if (!target || state.peelSlotsRemaining <= 0) return state;
	return paid(
		state,
		stripConfig(state.build, configId),
		slotsOf(target),
		`Dropped ${target.label}, freeing ${slotsOf(target)}.`
	);
};

export const minifyForPeel = (state: RunState, configId: string): RunState => {
	const target = state.build.configs.find((config) => config.id === configId);
	if (!target || state.peelSlotsRemaining <= 0 || !canMinify(target))
		return state;
	const freed = minifySavingSlots(target);
	return paid(
		state,
		withBuild(
			state.build,
			state.build.configs.map((config) =>
				config.id === configId ? minified(config) : config
			)
		),
		freed,
		`Minified ${target.label}, freeing ${freed}.`
	);
};

export const resumeClimb = (state: RunState): RunState => {
	if (state.peelSlotsRemaining > 0) return state;
	if (isBare(state.build))
		return {
			...state,
			status: "dead",
			log: withLog(state, "Nothing left in the build — run over."),
		};
	return {
		...state,
		window: freshWindow(
			state.polls,
			state.currentIndex,
			state.build.configs,
			state.gatesCleared
		),
		manualDisabled: [],
		gateRewardKb: 0,
		interestThisGateKb: 0,
		extraPickThisGateKb: 0,
		draftOptions: shopDraft(
			state,
			draftSeed(state.gatesCleared, (state.allAnswered ?? []).length)
		),
		rebuildsUsed: 0,
		draftedThisGate: [],
		redoGate: state.gatesCleared,
		status: "rewarding",
		log: withLog(
			state,
			`Gate ${state.gatesCleared} again — rebuild in the shop first.`
		),
	};
};

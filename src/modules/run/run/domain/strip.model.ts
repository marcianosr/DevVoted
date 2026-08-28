import {
	canMinify,
	minify as minified,
	minifySavingSpots,
	spotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	isBare,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";
import { draftSeed } from "~/modules/run/shop/domain/draft.model";
import {
	freshWindow,
	type RunState,
	shopDraft,
	withLog,
	withPipeline,
} from "~/modules/run/run/domain/run.model";

const paid = (
	state: RunState,
	pipeline: RunState["pipeline"],
	freed: number,
	line: string
): RunState => {
	const remaining = Math.max(0, state.peelSpotsRemaining - freed);
	return {
		...state,
		pipeline,
		peelSpotsRemaining: remaining,
		log: withLog(
			state,
			remaining > 0
				? `${line} ${remaining} more spot${remaining > 1 ? "s" : ""} to free.`
				: `${line} Peel paid — rebuild in the shop.`
		),
	};
};

export const strip = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || state.peelSpotsRemaining <= 0) return state;
	return paid(
		state,
		stripConfig(state.pipeline, configId),
		spotsOf(target),
		`Dropped ${target.label}, freeing ${spotsOf(target)}.`
	);
};

export const minifyForPeel = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || state.peelSpotsRemaining <= 0 || !canMinify(target))
		return state;
	const freed = minifySavingSpots(target);
	return paid(
		state,
		withPipeline(
			state.pipeline,
			state.pipeline.configs.map((config) =>
				config.id === configId ? minified(config) : config
			)
		),
		freed,
		`Minified ${target.label}, freeing ${freed}.`
	);
};

export const resumeClimb = (state: RunState): RunState => {
	if (state.peelSpotsRemaining > 0) return state;
	if (isBare(state.pipeline))
		return {
			...state,
			status: "dead",
			log: withLog(state, "Nothing left in the pipeline — run over."),
		};
	return {
		...state,
		window: freshWindow(
			state.polls,
			state.currentIndex,
			state.pipeline.configs,
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

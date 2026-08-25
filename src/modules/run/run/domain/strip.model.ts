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
} from "~/modules/run/run/domain/run.model";

export const strip = (state: RunState, configId: string): RunState => {
	const target = state.pipeline.configs.find(
		(config) => config.id === configId
	);
	if (!target || state.stripsRemaining <= 0) return state;
	const pipeline = stripConfig(state.pipeline, configId);
	const remaining = state.stripsRemaining - 1;
	return {
		...state,
		pipeline,
		stripsRemaining: remaining,
		log: withLog(
			state,
			remaining > 0
				? `Peeled a config. ${remaining} more to drop.`
				: `Peel paid — rebuild in the shop.`
		),
	};
};

/** ADR-037. Routes through the shop deliberately: KB is the comeback resource. */
export const resumeClimb = (state: RunState): RunState => {
	if (state.stripsRemaining > 0) return state;
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
		// Seeded off answers-so-far: fresh per redo, stable across a reload.
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

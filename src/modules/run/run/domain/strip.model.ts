import {
	canMinify,
	type Config,
	minifiedAmount,
	minify as minified,
	minifySavingSlots,
	slotsOf,
} from "~/modules/run/config/domain/config.model";
import {
	isBare,
	locksSurviving,
	stripConfig,
} from "~/modules/run/build/domain/build.model";
import { draftSeed, sellRefundIn } from "~/modules/run/shop/domain/draft.model";
import {
	addStorage,
	freshWindow,
	type RunState,
	scheduleOf,
	shopDraft,
	withLog,
	withBuild,
} from "~/modules/run/run/domain/run.model";

export const peelRefundIn = (
	configs: readonly Config[],
	config: Config
): number =>
	configs.reduce(
		(total, collector) =>
			collector.refundsPeeledConfigs === true
				? total + minifiedAmount(collector, sellRefundIn(configs, config))
				: total,
		0
	);

const storageAfterRefund = (state: RunState, refundKb: number): number =>
	refundKb === 0
		? state.storage
		: addStorage(state.storage, refundKb, state.storagePlan ?? 0);

const paid = (
	state: RunState,
	build: RunState["build"],
	freed: number,
	line: string,
	refundKb = 0
): RunState => {
	const remaining = Math.max(0, state.peelSlotsRemaining - freed);
	return {
		...state,
		build,
		storage: storageAfterRefund(state, refundKb),
		peelRefundKb: (state.peelRefundKb ?? 0) + refundKb,
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
	const refund = peelRefundIn(state.build.configs, target);
	const freed = slotsOf(target);
	return paid(
		state,
		stripConfig(state.build, configId),
		freed,
		refund > 0
			? `Dropped ${target.label}, freeing ${freed} (+${refund}KB collected).`
			: `Dropped ${target.label}, freeing ${freed}.`,
		refund
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
			state.gatesCleared,
			scheduleOf(state)
		),
		manualDisabled: [],
		gateRewardKb: 0,
		interestThisGateKb: 0,
		extraPickThisGateKb: 0,
		peelRefundKb: 0,
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

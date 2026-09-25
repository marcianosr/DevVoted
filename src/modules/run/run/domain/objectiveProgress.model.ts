import type { CategoryCode } from "~/shared/lib/categories";

import { freeSlots } from "~/modules/run/build/domain/build.model";
import type { ObjectiveMetric } from "~/modules/run/config/domain/configUnlock.model";
import { mirrorsPolls } from "~/modules/run/gate/domain/audit.model";
import {
	BOOT_CACHE_BANK_KB,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import {
	archiveCreditBytes,
	auditsOf,
	isRunOver,
	liveConfigsOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import {
	type AnsweredPoll,
	cachedHitsFor,
} from "~/modules/run/run/domain/runPoll.model";
import { STORAGE_UNITS } from "~/shared/lib/storage";

const lastLanded = (
	state: RunState,
	next: RunState
): AnsweredPoll | undefined =>
	(next.allAnswered ?? []).length > (state.allAnswered ?? []).length
		? (next.allAnswered ?? []).at(-1)
		: undefined;

const windowCorrectAfter = (state: RunState, correct: boolean): number =>
	state.window.correct + (correct ? 1 : 0);

const cachePays = (state: RunState, category: CategoryCode): boolean =>
	cachedHitsFor(state.allAnswered ?? [], category) > 0 &&
	liveConfigsOf(state).some((config) => config.cacheHitStep !== undefined);

const metEstimate = (state: RunState, correct: boolean): boolean =>
	state.estimatedCorrect !== undefined &&
	windowCorrectAfter(state, correct) >= state.estimatedCorrect;

const holdsTwoUpgraded = (state: RunState): boolean =>
	state.build.configs.filter((config) => (config.level ?? 1) >= 2).length >= 2;

const gatesReached = (
	state: RunState,
	next: RunState
): readonly ObjectiveMetric[] =>
	Array.from(
		{ length: next.gatesCleared - state.gatesCleared },
		(_, offset) => `reached-gate:${state.gatesCleared + offset + 1}` as const
	);

const answerMetrics = (
	state: RunState,
	next: RunState
): readonly ObjectiveMetric[] => {
	const landed = lastLanded(state, next);
	if (!landed) return [];
	const correct = landed.outcome === "correct";
	const settled = state.window.answered + 1 >= SLICE_WINDOW;
	const perfect =
		settled && windowCorrectAfter(state, correct) === SLICE_WINDOW;
	return [
		"polls-answered",
		...(correct
			? (["polls-correct", `category-correct:${landed.category}`] as const)
			: []),
		...(landed.outcome === "partial" ? (["partials-paid"] as const) : []),
		...(correct && cachePays(state, landed.category)
			? (["cache-hits"] as const)
			: []),
		...(perfect ? (["perfect-windows"] as const) : []),
		...(perfect && state.gatesCleared >= 3
			? (["perfect-window-deep"] as const)
			: []),
		...(settled && metEstimate(state, correct)
			? (["exact-estimates"] as const)
			: []),
		...(state.rebasedThisGate === true ? (["gates-reordered"] as const) : []),
	];
};

const clearMetrics = (
	state: RunState,
	next: RunState
): readonly ObjectiveMetric[] => {
	if (next.gatesCleared <= state.gatesCleared) return [];
	const landed = lastLanded(state, next);
	const noMiss =
		windowCorrectAfter(state, landed?.outcome === "correct") === SLICE_WINDOW;
	const preAudits = auditsOf(state);
	return [
		"gates-cleared",
		...gatesReached(state, next),
		...(preAudits.length > 0 ? (["audited-gates-cleared"] as const) : []),
		...(mirrorsPolls(preAudits) && noMiss
			? (["mirror-clear-no-miss"] as const)
			: []),
		...(freeSlots(state.build) === 0 ? (["full-build-clear"] as const) : []),
		...(holdsTwoUpgraded(state) ? (["double-v2-clear"] as const) : []),
		...(next.gatesCleared === 4 && (next.storageBeforeClearKb ?? 0) < 16
			? (["lean-gate-four"] as const)
			: []),
		// Only a clear can honour a promise, so this counter can only live here:
		// the band SLA was measured against does not exist until the close.
		...((next.slaUpliftKb ?? 0) > 0 ? (["slas-met"] as const) : []),
		...(next.status === "won" ? (["runs-won"] as const) : []),
	];
};

/** `available` is the hand dealt at run start and nothing rewrites it, so it is the hand. */
const holdsADealtConfig = (state: RunState): boolean =>
	state.build.configs.some((config) =>
		state.available.some((dealt) => dealt.id === config.id)
	);

/** Once, on the action that ends the run; abandoning never comes through here. */
const endMetrics = (
	state: RunState,
	next: RunState
): readonly ObjectiveMetric[] => {
	if (!isRunOver(next.status) || isRunOver(state.status)) return [];
	return [
		...(archiveCreditBytes(next) >= BOOT_CACHE_BANK_KB * STORAGE_UNITS.KB
			? (["banked-256-one-run"] as const)
			: []),
		...(holdsADealtConfig(next)
			? (["finished-holding-a-dealt-config"] as const)
			: []),
	];
};

const actionMetrics = (
	state: RunState,
	next: RunState,
	action: RunAction
): readonly ObjectiveMetric[] => {
	if (action.type === "peek-poll") {
		return (next.peekedPollIds ?? []).length >
			(state.peekedPollIds ?? []).length
			? ["community-peeks"]
			: [];
	}
	if (action.type === "lock-offer") return ["offers-locked"];
	if (action.type === "vendor-lock") return ["configs-vendor-locked"];
	if (action.type === "switch-arm") return ["arms-switched"];
	if (action.type === "sell") {
		return (next.soldThisShop ?? 0) === 3
			? ["configs-sold", "sold-three-one-shop"]
			: ["configs-sold"];
	}
	if (action.type === "rebuild-draft") return ["rebuilds"];
	return [];
};

export const objectiveIncrementsFor = (
	state: RunState,
	next: RunState,
	action: RunAction
): readonly ObjectiveMetric[] => {
	if (next === state) return [];
	return [
		...answerMetrics(state, next),
		...clearMetrics(state, next),
		...endMetrics(state, next),
		...actionMetrics(state, next, action),
	];
};

import type { CategoryCode } from "~/shared/lib/categories";

import { freeSlots } from "~/modules/run/build/domain/build.model";
import type { ObjectiveMetric } from "~/modules/run/config/domain/configUnlock.model";
import { mirrorsPolls } from "~/modules/run/gate/domain/audit.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import {
	auditsOf,
	liveConfigsOf,
	type RunState,
} from "~/modules/run/run/domain/run.model";
import type { RunAction } from "~/modules/run/run/domain/runAction.model";
import {
	type AnsweredPoll,
	cachedHitsFor,
} from "~/modules/run/run/domain/runPoll.model";

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

const exactEstimate = (state: RunState, correct: boolean): boolean =>
	state.estimatedCorrect !== undefined &&
	state.estimatedCorrect === windowCorrectAfter(state, correct);

const holdsTwoUpgraded = (state: RunState): boolean =>
	state.build.configs.filter((config) => (config.level ?? 1) >= 2).length >= 2;

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
		...(correct && cachePays(state, landed.category)
			? (["cache-hits"] as const)
			: []),
		...(perfect ? (["perfect-windows"] as const) : []),
		...(perfect && state.gatesCleared >= 3
			? (["perfect-window-deep"] as const)
			: []),
		...(settled && exactEstimate(state, correct)
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
		...(preAudits.length > 0 ? (["audited-gates-cleared"] as const) : []),
		...(mirrorsPolls(preAudits) && noMiss
			? (["mirror-clear-no-miss"] as const)
			: []),
		...(freeSlots(state.build) === 0 ? (["full-build-clear"] as const) : []),
		...(holdsTwoUpgraded(state) ? (["double-v2-clear"] as const) : []),
		...(next.gatesCleared === 4 && (next.storageBeforeClearKb ?? 0) < 16
			? (["lean-gate-four"] as const)
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
		...actionMetrics(state, next, action),
	];
};

import {
	type Config,
	minifiedAmount,
} from "~/modules/run/config/domain/config.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export const ESTIMATE_CHOICES: readonly number[] = Array.from(
	{ length: SLICE_WINDOW },
	(_, index) => index + 1
);

export const estimatorFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.storagePerEstimate !== undefined);

export const canEstimate = (state: Pick<RunState, "status">): boolean =>
	state.status === "configuring" || state.status === "rewarding";

const isWholeWindowCount = (count: number): boolean =>
	Number.isInteger(count) && count >= 1 && count <= SLICE_WINDOW;

export const commitEstimate = (state: RunState, count: number): RunState => {
	if (!canEstimate(state)) return state;
	if (estimatorFor(state.build.configs) === undefined) return state;
	if (!isWholeWindowCount(count)) return state;
	return { ...state, estimatedCorrect: count };
};

export const estimatePayoutKb = (
	configs: readonly Config[],
	estimated: number | undefined,
	correct: number
): number => {
	const estimator = estimatorFor(configs);
	if (estimator === undefined) return 0;
	if (estimated === undefined || estimated !== correct) return 0;
	return minifiedAmount(
		estimator,
		(estimator.storagePerEstimate ?? 0) * estimated
	);
};

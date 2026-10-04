import {
	type Config,
	minifiedUnits,
} from "~/modules/run/config/domain/config.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import { type RunState, isPrepPhase } from "~/modules/run/run/domain/run.model";

export const ESTIMATE_CHOICES: readonly number[] = Array.from(
	{ length: SLICE_WINDOW },
	(_, index) => index + 1
);

export const estimatorFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.coveragePerEstimate !== undefined);

export const canEstimate = (state: Pick<RunState, "status">): boolean =>
	isPrepPhase(state);

export const estimateOwed = (state: RunState): boolean =>
	estimatorFor(state.build.configs) !== undefined &&
	canEstimate(state) &&
	state.estimatedCorrect === undefined;

const isWholeWindowCount = (count: number): boolean =>
	Number.isInteger(count) && count >= 1 && count <= SLICE_WINDOW;

export const commitEstimate = (state: RunState, count: number): RunState => {
	if (!canEstimate(state)) return state;
	if (estimatorFor(state.build.configs) === undefined) return state;
	if (!isWholeWindowCount(count)) return state;
	return { ...state, estimatedCorrect: count };
};

export const estimatePayoutUnits = (
	configs: readonly Config[],
	estimated: number | undefined,
	correct: number,
	gatesCleared: number
): number => {
	const estimator = estimatorFor(configs);
	if (estimator === undefined || estimated === undefined) return 0;
	if (correct < estimated) return 0;
	return minifiedUnits(
		estimator,
		estimated * (gatesCleared + 1) * (estimator.coveragePerEstimate ?? 0)
	);
};

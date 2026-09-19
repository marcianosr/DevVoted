import {
	type Config,
	minifiedUnits,
} from "~/modules/run/config/domain/config.model";
import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";
import type { RunState } from "~/modules/run/run/domain/run.model";

export const ESTIMATE_CHOICES: readonly number[] = Array.from(
	{ length: SLICE_WINDOW },
	(_, index) => index + 1
);

export const estimatorFor = (configs: readonly Config[]): Config | undefined =>
	configs.find((config) => config.coveragePerEstimate !== undefined);

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

/**
 * The bet is a floor, not a bullseye: beating your own call still pays. Under
 * the exact-match rule it replaced, playing 1 predicted that you would bomb
 * four of five, so caution and a low card were opposite gestures and no
 * cautious bet existed anywhere on the board.
 *
 * The rate is per point PER GATE because the line it is measured against grows
 * with depth (`scoringSlotsAt` is `5 * (gate + 1)`). A flat payout would be a
 * quarter of a window at gate 0 and rounding error by gate 12; scaling holds it
 * at a constant share of whatever the gate is asking for.
 */
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

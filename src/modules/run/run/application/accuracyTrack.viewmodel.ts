import type { AccuracyView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import { ACCURACY_GAIN_PER_GATE } from "~/modules/run/build/domain/coverageRatio.model";
import type {
	AccuracyTick,
	AccuracyTrackProps,
} from "~/ui/kanto-theme/AccuracyTrack.ui";

const CORRECT_OUTCOME = "correct";
const ACCURACY_WORD = "Accuracy";
const THIS_GATE_UP_TO = "this gate up to";
const LABEL_JOIN = ", ";
const TICK_STEP = 0.05;
const TICKS_PER_WINDOW = 5;
const WINDOW_SPAN = TICK_STEP * TICKS_PER_WINDOW;
const STEPS_PER_UNIT = 1 / TICK_STEP;
const FLOAT_SLACK = 1e-9;
const LABEL_DECIMALS = 2;

const multiplierLabel = (multiplier: number): string =>
	`×${roundToTwoDecimals(multiplier)}`;

const tickLabel = (multiplier: number): string =>
	`×${multiplier.toFixed(LABEL_DECIMALS)}`;

const windowStartFor = (base: number): number =>
	Math.max(1, Math.floor(base * STEPS_PER_UNIT + FLOAT_SLACK) / STEPS_PER_UNIT);

const shareIn =
	(from: number) =>
	(multiplier: number): number =>
		Math.min(1, Math.max(0, (multiplier - from) / WINDOW_SPAN));

const ticksFrom = (from: number): readonly AccuracyTick[] =>
	Array.from({ length: TICKS_PER_WINDOW + 1 }, (_, step) => ({
		share: step / TICKS_PER_WINDOW,
		...(step === TICKS_PER_WINDOW
			? {}
			: { label: tickLabel(from + step * TICK_STEP) }),
	}));

const labelOf = (live: number, best: number): string =>
	roundToTwoDecimals(live) === roundToTwoDecimals(best)
		? `${ACCURACY_WORD} ${multiplierLabel(live)}`
		: [
				`${ACCURACY_WORD} ${multiplierLabel(live)}`,
				`${THIS_GATE_UP_TO} ${multiplierLabel(best)}`,
			].join(LABEL_JOIN);

const trackFor = (
	live: number,
	best: number,
	base: number
): AccuracyTrackProps => {
	const from = windowStartFor(base);
	const share = shareIn(from);
	return {
		label: labelOf(live, best),
		figure: multiplierLabel(live),
		bonus: share(live),
		cap: share(best),
		ticks: ticksFrom(from),
	};
};

export const accuracyTrackOf = ({
	live,
	best,
	carried,
}: Pick<AccuracyView, "live" | "best" | "carried">): AccuracyTrackProps =>
	trackFor(live, best, 1 + carried);

const pulseOf = (
	answered: AnsweredPoll | undefined
): Pick<AccuracyTrackProps, "pulse"> =>
	answered?.outcome === CORRECT_OUTCOME ? { pulse: { key: answered.id } } : {};

export const accuracyTrackFor = (
	view: RunView,
	answered?: AnsweredPoll
): AccuracyTrackProps => ({
	...accuracyTrackOf(view.gateStake.accuracy),
	...pulseOf(answered),
});

export const landedAccuracyTrackFor = (
	multiplier: number
): AccuracyTrackProps =>
	trackFor(multiplier, multiplier, multiplier - ACCURACY_GAIN_PER_GATE);

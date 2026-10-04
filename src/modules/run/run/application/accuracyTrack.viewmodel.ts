import type { AccuracyView } from "~/modules/run/run/application/gateStake.viewmodel";
import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import { roundToTwoDecimals } from "~/modules/run/run/domain/rules.model";
import type { AccuracyTrackProps } from "~/ui/kanto-theme/AccuracyTrack.ui";

const CORRECT_OUTCOME = "correct";
const ACCURACY_WORD = "Accuracy";
const UP_TO = "up to";
const LABEL_JOIN = ", ";
const FIRST_TRACK_SCALE = 2;

const multiplierLabel = (multiplier: number): string =>
	`×${roundToTwoDecimals(multiplier)}`;

const trackScaleFor = (best: number): number =>
	Math.max(FIRST_TRACK_SCALE, Math.ceil(best));

const shareOfScale = (multiplier: number, scale: number): number =>
	(multiplier - 1) / (scale - 1);

const readingsOf = ({ guaranteed, best }: AccuracyView): readonly string[] =>
	roundToTwoDecimals(guaranteed) === roundToTwoDecimals(best)
		? [multiplierLabel(guaranteed)]
		: [multiplierLabel(guaranteed), `${UP_TO} ${multiplierLabel(best)}`];

const ceilingOf = ({ guaranteed, best }: AccuracyView) =>
	roundToTwoDecimals(guaranteed) === roundToTwoDecimals(best)
		? {}
		: { ceiling: `${UP_TO} ${multiplierLabel(best)}` };

const pulseOf = (
	answered: AnsweredPoll | undefined
): Pick<AccuracyTrackProps, "pulse"> =>
	answered?.outcome === CORRECT_OUTCOME ? { pulse: { key: answered.id } } : {};

export const accuracyTrackFor = (
	view: RunView,
	answered?: AnsweredPoll
): AccuracyTrackProps => {
	const accuracy = view.gateStake.accuracy;
	const readings = readingsOf(accuracy);

	return {
		label: `${ACCURACY_WORD} ${readings.join(LABEL_JOIN)}`,
		figure: multiplierLabel(accuracy.guaranteed),
		...ceilingOf(accuracy),
		sure: shareOfScale(accuracy.guaranteed, trackScaleFor(accuracy.best)),
		best: shareOfScale(accuracy.best, trackScaleFor(accuracy.best)),
		...pulseOf(answered),
	};
};

export const landedAccuracyTrackFor = (
	multiplier: number
): AccuracyTrackProps => {
	const reading = multiplierLabel(multiplier);
	const share = shareOfScale(multiplier, trackScaleFor(multiplier));

	return {
		label: `${ACCURACY_WORD} ${reading}`,
		figure: reading,
		sure: share,
		best: share,
	};
};

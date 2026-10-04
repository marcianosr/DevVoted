import { CHOICE_LABEL } from "~/shared/lib/copy";
import {
	accuracyMultiplierFor,
	coverageGainPercentFor,
	MULTIPLE_CREDIT,
	SINGLE_CREDIT,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	roundToOneDecimal,
	roundToTwoDecimals,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";

import type {
	ScoringFigure,
	ScoringProps,
	ScoringStep,
	ScoringTone,
} from "~/ui/kanto-theme/Scoring.ui";

const UP_TO = "up to";
const ACCURACY_LABEL = "Accuracy Bonus";
const MULTIPLIER = "×";
const POINTS = "%";

const SINGLE_STEP = 1;
const MULTIPLE_STEP = 0.25;

const capitalised = (label: string) =>
	`${label.charAt(0).toUpperCase()}${label.slice(1)}`;

const shareLabel = (units: number, gate: number) =>
	`+${roundToOneDecimal(coverageGainPercentFor(units, gate))}${POINTS}`;

const toneOf = (units: number, credit: number): ScoringTone => {
	if (units === 0) return "none";
	return units === credit ? "full" : "partial";
};

const stepsOf = (credit: number, step: number, gate: number): ScoringStep[] =>
	Array.from({ length: Math.round(1 / step) + 1 }, (_, index) => {
		const units = roundToTwoDecimals(index * step * credit);
		return {
			figure: `${units}`,
			coverage: shareLabel(units, gate),
			tone: toneOf(units, credit),
		};
	});

export const gainsFor = (gate: number): readonly ScoringFigure[] => [
	{
		label: capitalised(CHOICE_LABEL.single),
		steps: stepsOf(SINGLE_CREDIT, SINGLE_STEP, gate),
	},
	{
		label: `${capitalised(CHOICE_LABEL.multiple)} ${UP_TO}`,
		steps: stepsOf(MULTIPLE_CREDIT, MULTIPLE_STEP, gate),
	},
];

const flawlessMultiplierFor = (accuracyBonus: number) =>
	roundToTwoDecimals(
		accuracyMultiplierFor(accuracyBonus, {
			earned: SLICE_WINDOW,
			available: SLICE_WINDOW,
		})
	);

export const accuracyFor = (accuracyBonus: number): ScoringFigure => ({
	label: ACCURACY_LABEL,
	figure: `${UP_TO} ${MULTIPLIER}${flawlessMultiplierFor(accuracyBonus)}`,
});

export const scoringFor = (
	gate: number,
	accuracyBonus: number
): ScoringProps => ({
	gains: gainsFor(gate),
	accuracy: accuracyFor(accuracyBonus),
});

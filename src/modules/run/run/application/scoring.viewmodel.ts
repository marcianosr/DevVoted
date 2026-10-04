import { CHOICE_LABEL } from "~/shared/lib/copy";
import {
	answerPayoutFor,
	previewContextFor,
} from "~/modules/run/build/domain/answerPayout.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
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

const ANSWERED_BEFORE_TYPICAL = 1;

const builtUnitsOf = (
	configs: readonly Config[],
	answerType: AnswerType,
	share: number
): number =>
	answerPayoutFor(
		configs,
		previewContextFor({ answeredBefore: ANSWERED_BEFORE_TYPICAL, answerType }),
		share
	).earned;

const stepsOf = (
	credit: number,
	step: number,
	gate: number,
	built: (share: number) => number
): ScoringStep[] => {
	const steps = Array.from({ length: Math.round(1 / step) + 1 }, (_, index) => {
		const share = index * step;
		const units = roundToTwoDecimals(share * credit);
		return {
			units,
			builtUnits: roundToTwoDecimals(built(share)),
			step: {
				figure: `${units}`,
				coverage: shareLabel(units, gate),
				tone: toneOf(units, credit),
			},
		};
	});
	const buildLifts = steps.some((entry) => entry.builtUnits !== entry.units);

	return steps.map((entry) =>
		buildLifts ? { ...entry.step, built: `${entry.builtUnits}` } : entry.step
	);
};

export const gainsFor = (
	gate: number,
	configs: readonly Config[] = []
): readonly ScoringFigure[] => [
	{
		label: capitalised(CHOICE_LABEL.single),
		steps: stepsOf(SINGLE_CREDIT, SINGLE_STEP, gate, (share) =>
			builtUnitsOf(configs, "single", share)
		),
	},
	{
		label: `${capitalised(CHOICE_LABEL.multiple)} ${UP_TO}`,
		steps: stepsOf(MULTIPLE_CREDIT, MULTIPLE_STEP, gate, (share) =>
			builtUnitsOf(configs, "multiple", share)
		),
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
	accuracyBonus: number,
	configs: readonly Config[] = []
): ScoringProps => ({
	gains: gainsFor(gate, configs),
	accuracy: accuracyFor(accuracyBonus),
});

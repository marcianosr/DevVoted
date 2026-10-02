import { ANSWER_TYPE_LABEL } from "~/shared/lib/copy";
import {
	accuracyMultiplierFor,
	coverageGainPercentFor,
	healthyAt,
	MULTIPLE_CREDIT,
	percentOf,
	SINGLE_CREDIT,
} from "~/modules/run/build/domain/coverageRatio.model";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import {
	GATE_COUNT,
	roundToOneDecimal,
	roundToTwoDecimals,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

import type { CoverageBandId } from "~/ui/kanto-theme/CoverageBar.ui";
import type { LeadLine, LeadPart } from "~/ui/kanto-theme/Lead.ui";
import type {
	ScoringGateRow,
	ScoringPrice,
	ScoringProps,
	ScoringStep,
	ScoringTone,
} from "~/ui/kanto-theme/Scoring.ui";

const SINGLE_LABEL = "single ";
const MULTIPLE_LABEL = " · multiple up to ";
const ACCURACY_LABEL = " · accuracy up to ";
const HINT_LEAD = "credit per poll · a multiple counts ";
const HINT_TRAIL = " · configs add on top";
const CURVE_LEAD = "Right answers multiply what the window covered: ";
const CURVE_JOIN = " ";
const CURVE_TRAIL = ". A multiple counts as two.";
const POINTS = "%";
const RISES_LEAD = "The line rises. ";
const HOLDS_LEAD = "The line holds. ";
const TOPS_LEAD = "The line goes no higher. ";
const ASKS = " asks ";
const AT = " at ";
const AND_MORE_AFTER = " and more at the gates after.";
const AND_EVERY_AFTER = " and at every gate after.";
const THE_LAST_GATE = ", the last gate.";

const RIGHT_COUNTS: readonly number[] = Array.from(
	{ length: SLICE_WINDOW + 1 },
	(_, right) => right
);
const SINGLE_STEP = 1;
const MULTIPLE_STEP = 0.25;
const HEALTHY_BAND: CoverageBandId = "healthy";
const GATES: readonly number[] = Array.from(
	{ length: GATE_COUNT },
	(_, gate) => gate
);

const gateNameOf = (gate: number) => gateSwatchAt(gate).gateName;

const shareLabel = (units: number, gate: number) =>
	`+${roundToOneDecimal(coverageGainPercentFor(units, gate))}${POINTS}`;

const healthyPercentAt = (gate: number) =>
	roundToOneDecimal(percentOf(healthyAt(gate)));

export const scoringMetaFor = (gate: number): LeadLine => [
	SINGLE_LABEL,
	{ figure: shareLabel(SINGLE_CREDIT, gate), gain: true },
	MULTIPLE_LABEL,
	{ figure: shareLabel(MULTIPLE_CREDIT, gate), gain: true },
	ACCURACY_LABEL,
	{ figure: `×${multiplierAt(SLICE_WINDOW)}` },
];

const toneOf = (units: number, credit: number): ScoringTone => {
	if (units === 0) return "none";
	return units === credit ? "full" : "partial";
};

const stepsOf = (credit: number, step: number): ScoringStep[] =>
	Array.from({ length: Math.round(1 / step) + 1 }, (_, index) => {
		const units = roundToTwoDecimals(index * step * credit);
		return { figure: `${units}`, tone: toneOf(units, credit) };
	});

export const pricesFor = (): ScoringPrice[] => [
	{
		label: ANSWER_TYPE_LABEL.single,
		steps: stepsOf(SINGLE_CREDIT, SINGLE_STEP),
	},
	{
		label: ANSWER_TYPE_LABEL.multiple,
		steps: stepsOf(MULTIPLE_CREDIT, MULTIPLE_STEP),
	},
];

export const SCORING_HINT: LeadLine = [
	HINT_LEAD,
	{ figure: `${MULTIPLE_CREDIT}` },
	HINT_TRAIL,
];

const multiplierAt = (right: number) =>
	roundToTwoDecimals(
		accuracyMultiplierFor({ earned: right, available: SLICE_WINDOW })
	);

const curveStatement = (): LeadLine => [
	CURVE_LEAD,
	...RIGHT_COUNTS.flatMap((right): LeadPart[] => [
		...(right === 0 ? [] : [CURVE_JOIN]),
		{ figure: `${right} ×${multiplierAt(right)}` },
	]),
	CURVE_TRAIL,
];

const risesAfter = (gate: number): boolean =>
	GATES.some(
		(later) => later > gate && healthyPercentAt(later) > healthyPercentAt(gate)
	);

export const lineStatementFor = (gate: number): LeadLine => {
	const asks: readonly LeadPart[] = [
		{ band: HEALTHY_BAND },
		ASKS,
		{ figure: `${healthyPercentAt(gate)}%`, band: HEALTHY_BAND },
		`${AT}${gateNameOf(gate)}`,
	];

	if (gate >= VICTORY_GATE) return [TOPS_LEAD, ...asks, THE_LAST_GATE];
	if (risesAfter(gate)) return [RISES_LEAD, ...asks, AND_MORE_AFTER];
	return [HOLDS_LEAD, ...asks, AND_EVERY_AFTER];
};

const scheduleGatesFor = (gate: number): readonly number[] =>
	[
		...new Set([
			...GATES.filter((reached) => reached <= gate),
			Math.min(gate + 1, VICTORY_GATE),
			VICTORY_GATE,
		]),
	].sort((one, other) => one - other);

export const scoringRowsFor = (gate: number): readonly ScoringGateRow[] =>
	scheduleGatesFor(gate).map((scheduled): ScoringGateRow => {
		const stated = { gate: scheduled, name: gateNameOf(scheduled) };

		if (scheduled > gate) return { locked: true, ...stated };
		return {
			...stated,
			unit: shareLabel(1, scheduled),
			healthy: `${healthyPercentAt(scheduled)}%`,
			...(scheduled === gate ? { current: true } : {}),
		};
	});

export const scoringFor = (gate: number): ScoringProps => ({
	meta: scoringMetaFor(gate),
	prices: pricesFor(),
	hint: SCORING_HINT,
	statements: [curveStatement(), lineStatementFor(gate)],
	rows: scoringRowsFor(gate),
});

import { ANSWER_TYPE_LABEL } from "~/shared/lib/copy";
import {
	answerPayoutFor,
	perAnswerPreviewFor,
	previewContextFor,
	type PreviewFacts,
} from "~/modules/run/build/domain/answerPayout.model";
import {
	bankableUnits,
	coverageGainPercentFor,
	healthyAt,
	healthyUnitsAt,
	percentOf,
	ratioOf,
	runCoverageOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	type Config,
	focusMultiplierOf,
} from "~/modules/run/config/domain/config.model";
import { clearingRungFor } from "~/modules/run/gate/application/bandOutcomes.viewmodel";
import { gateSwatchAt } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";
import {
	GATE_COUNT,
	roundToOneDecimal,
	roundToTwoDecimals,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

import type { CodebaseGate, CodebaseProps } from "~/ui/kanto-theme/Codebase.ui";
import {
	type CoverageBandId,
	type CoverageBarProps,
	coverageBandOf,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type {
	GateStrictnessProps,
	StrictnessRow,
} from "~/ui/kanto-theme/GateStrictness.ui";
import type { LeadLine } from "~/ui/kanto-theme/Lead.ui";
import type { PollPaysProps, PollPaysRow } from "~/ui/kanto-theme/PollPays.ui";

import { type ScoredFrame, scoredLeadFor } from "./scoredLead.viewmodel";

const SLOTS_OPEN = "slots open";
const SLOTS_WORD = "slots";
const COVERED = "covered";
const UNIT_WORD = "unit";
const UNITS_WORD = "units";
const MULTIPLIED = "×";

const GREW_LEAD = "The codebase grew from ";
const GREW_JOIN = " to ";
const GREW_TRAIL = " slots. The same ";
const READ = " read ";
const AT = " at ";
const AND = " and ";
const HERE = " here. ";
const NOTHING_LOST = "Nothing was lost.";
const REACHES = " reaches ";

const GROWS_LEAD = "The codebase grows. Each gate opens ";
const GROWS_TRAIL = " more slots, so one unit moves the bar less.";
const RISES_LEAD = "The line rises. ";
const HOLDS_LEAD = "The line holds. ";
const ASKS = " asks ";
const FROM = " from ";
const TO = " to ";
const THEN_CLIMBS = ", then climbs to ";
const AT_EVERY_GATE = " at every gate.";
const STAYS_BANKED =
	"Your units stay banked; a new gate only adds slots to cover.";
const FROM_GATE = " From ";
const ON = " on, ";
const MORE_THAN_A_UNIT =
	" asks more than one unit an answer, so multiple-answer polls and coverage configs carry the climb.";
const SUMMARY_JOIN = " · ";
const ONE_UNIT_IS = "one unit is ";

const HEALTHY_BAND: CoverageBandId = "healthy";
const BASE_FACTS: PreviewFacts = { answeredBefore: 0 };
const GATES: readonly number[] = Array.from(
	{ length: GATE_COUNT },
	(_, gate) => gate
);

export type PollPaysFrame = ScoredFrame & {
	configs: readonly Config[];
};

const unitsWord = (units: number) => (units === 1 ? UNIT_WORD : UNITS_WORD);

const unitsLabel = (units: number) => {
	const rounded = roundToTwoDecimals(units);
	return `${rounded} ${unitsWord(rounded)}`;
};

const percentFigure = (percent: number) =>
	`${roundToOneDecimal(percent).toFixed(1)}%`;

const shareLabel = (units: number, gate: number) =>
	`+${roundToTwoDecimals(coverageGainPercentFor(units, gate))}%`;

const healthyPercentAt = (gate: number) =>
	roundToOneDecimal(percentOf(healthyAt(gate)));

const gateNameOf = (gate: number) => gateSwatchAt(gate).gateName;

const clampToWindow = (slots: number) =>
	Math.min(SLICE_WINDOW, Math.max(0, slots));

export const slotsOpenLabelOf = (gate: number): string =>
	`${scoringSlotsAt(gate)} ${SLOTS_OPEN}`;

export const codebaseFor = (unitsHeld: number, gate: number): CodebaseProps => {
	const filled = Math.floor(bankableUnits(unitsHeld, gate));

	return {
		gates: ALL_SWATCHES.filter((swatch) => swatch.gate <= gate).map(
			(swatch): CodebaseGate => ({
				swatch,
				covered: clampToWindow(filled - SLICE_WINDOW * swatch.gate),
				slots: SLICE_WINDOW,
				...(swatch.gate === gate ? { current: true } : {}),
			})
		),
		label: `${filled} of ${scoringSlotsAt(gate)} ${SLOTS_WORD} ${COVERED}`,
	};
};

const grewLineFor = ({
	gate,
	unitsHeld,
	held,
	ladder,
}: PollPaysFrame): LeadLine => {
	const band = coverageBandOf(held, ladder);
	const units = roundToTwoDecimals(unitsHeld);
	const previous = percentOf(runCoverageOf(unitsHeld, gate - 1));

	return [
		GREW_LEAD,
		{ figure: `${scoringSlotsAt(gate - 1)}` },
		GREW_JOIN,
		{ figure: `${scoringSlotsAt(gate)}` },
		GREW_TRAIL,
		{ figure: `${units}`, band },
		` ${unitsWord(units)}${READ}`,
		{ figure: percentFigure(previous) },
		`${AT}${gateNameOf(gate - 1)}${AND}`,
		{ figure: percentFigure(held), band },
		HERE,
		NOTHING_LOST,
	];
};

const hasRebased = ({ gate, unitsHeld }: PollPaysFrame) =>
	gate > 0 && unitsHeld > 0;

export const standingLineFor = (frame: PollPaysFrame): LeadLine =>
	hasRebased(frame) ? grewLineFor(frame) : scoredLeadFor(frame);

export const owedLineFor = ({
	gate,
	held,
	ladder,
}: PollPaysFrame): LeadLine | undefined => {
	const rung = clearingRungFor(ladder);
	const owed = roundToOneDecimal(
		ratioOf(rung.from - held) * scoringSlotsAt(gate)
	);

	if (owed <= 0) return undefined;
	return [
		{ figure: `+${unitsLabel(owed)}`, band: rung.band },
		REACHES,
		{ band: rung.band },
		".",
	];
};

const rowOf = (
	answer: string,
	units: number,
	gate: number,
	via?: string
): PollPaysRow => ({
	answer,
	...(via === undefined ? {} : { via }),
	units: unitsLabel(units),
	share: shareLabel(units, gate),
});

const focusRowsFor = (
	configs: readonly Config[],
	gate: number
): readonly PollPaysRow[] =>
	configs.flatMap((config) => {
		if (config.focusCategory === undefined) return [];

		const { earned } = answerPayoutFor(
			configs,
			{ ...previewContextFor(BASE_FACTS), category: config.focusCategory },
			1
		);

		return [
			rowOf(
				ANSWER_TYPE_LABEL.single,
				earned,
				gate,
				`${config.label} ${MULTIPLIED}${focusMultiplierOf(config)}`
			),
		];
	});

export const payRowsFor = (
	configs: readonly Config[],
	gate: number
): readonly PollPaysRow[] => [
	rowOf(
		ANSWER_TYPE_LABEL.single,
		perAnswerPreviewFor(configs, BASE_FACTS).coveragePerCorrect,
		gate
	),
	...focusRowsFor(configs, gate),
	rowOf(
		ANSWER_TYPE_LABEL.multiple,
		perAnswerPreviewFor(configs, { ...BASE_FACTS, answerType: "multiple" })
			.coveragePerCorrect,
		gate
	),
];

export const pollPaysPropsFor = (
	frame: PollPaysFrame,
	bar: CoverageBarProps
): PollPaysProps => {
	const owed = owedLineFor(frame);

	return {
		slotsOpen: slotsOpenLabelOf(frame.gate),
		codebase: codebaseFor(frame.unitsHeld, frame.gate),
		standing: standingLineFor(frame),
		bar,
		...(owed === undefined ? {} : { owed }),
		rows: payRowsFor(frame.configs, frame.gate),
	};
};

const scheduleGatesFor = (gate: number): readonly number[] =>
	[...new Set([0, 1, gate, VICTORY_GATE])].sort((one, other) => one - other);

export const strictnessRowsFor = (gate: number): readonly StrictnessRow[] =>
	scheduleGatesFor(gate).map((scheduled): StrictnessRow => ({
		gate: gateNameOf(scheduled),
		slots: `${scoringSlotsAt(scheduled)}`,
		unit: shareLabel(1, scheduled),
		healthy: `${healthyPercentAt(scheduled)}%`,
		...(scheduled === gate ? { current: true } : {}),
	}));

const lastGateOnOpeningLine = (): number =>
	GATES.filter((gate) => healthyPercentAt(gate) === healthyPercentAt(0)).at(
		-1
	) ?? 0;

const firstGateAskingMoreThanAUnitAnAnswer = (): number | undefined =>
	GATES.find(
		(gate) =>
			gate > 0 && healthyUnitsAt(gate) - healthyUnitsAt(gate - 1) > SLICE_WINDOW
	);

const growsStatement = (): LeadLine => [
	GROWS_LEAD,
	{ figure: `${SLICE_WINDOW}` },
	GROWS_TRAIL,
];

const lineStatement = (): LeadLine => {
	const last = lastGateOnOpeningLine();
	const opening = { figure: `${healthyPercentAt(0)}%`, band: HEALTHY_BAND };

	if (last === VICTORY_GATE)
		return [HOLDS_LEAD, { band: HEALTHY_BAND }, ASKS, opening, AT_EVERY_GATE];

	const range =
		last === 0
			? `${AT}${gateNameOf(0)}`
			: `${FROM}${gateNameOf(0)}${TO}${gateNameOf(last)}`;

	return [
		RISES_LEAD,
		{ band: HEALTHY_BAND },
		ASKS,
		opening,
		range,
		THEN_CLIMBS,
		{ figure: `${healthyPercentAt(VICTORY_GATE)}%`, band: HEALTHY_BAND },
		`${AT}${gateNameOf(VICTORY_GATE)}.`,
	];
};

const noteFor = (): LeadLine => {
	const first = firstGateAskingMoreThanAUnitAnAnswer();

	if (first === undefined) return [STAYS_BANKED];
	return [
		STAYS_BANKED,
		`${FROM_GATE}${gateNameOf(first)}${ON}`,
		{ band: HEALTHY_BAND },
		MORE_THAN_A_UNIT,
	];
};

const summaryFor = (gate: number): string =>
	`${gateNameOf(gate)}${SUMMARY_JOIN}${scoringSlotsAt(gate)} ${SLOTS_WORD}${SUMMARY_JOIN}${ONE_UNIT_IS}${shareLabel(1, gate)}`;

export const strictnessFor = (gate: number): GateStrictnessProps => ({
	summary: summaryFor(gate),
	statements: [growsStatement(), lineStatement()],
	rows: strictnessRowsFor(gate),
	note: noteFor(),
});

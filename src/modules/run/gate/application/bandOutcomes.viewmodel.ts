import { CLEARING_BANDS } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	SLICE_WINDOW,
	roundToOneDecimal,
	FLOOR_CORRECT,
} from "~/modules/run/run/domain/rules.model";
import { signedKbLabel } from "~/shared/lib/storage";

import type {
	BandOutcome,
	BandOutcomesProps,
} from "~/ui/kanto-theme/BandOutcomes.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	type CoverageBandId,
	type CoverageBarProps,
	type CoverageLadder,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type {
	Objective,
	ObjectivesProps,
} from "~/ui/kanto-theme/Objectives.ui";

const AS_PERCENT = 100;
const BELOW_FULL = AS_PERCENT - 1;
const RANGE_DASH = "–";

export const BAND_OUTCOMES_TITLE = "Objectives and rewards";
export const BAND_OUTCOMES_NOTE =
	"Paid when the gate shuts. Miss it and you owe a peel, settled in KB or in configs.";

export const ESCROW_NOTE =
	"An open transaction only pays on a clear: SHAKY or DANGER rolls back every KB this window held.";

const REQUIRED_LEAD = "Main objective";
const CLEAR_SECTION = "to clear the gate";
const CLEAR_LEAD = "Finish at";
const CLEAR_TRAIL = "or better";
const OPTIONAL_LEAD = "Extra objectives";
const SWATCH_SECTION = "to earn the";
const SWATCH_WORD = "swatch";
const AUDIT_SECTION = "to arm an audit";

const ENDS_THE_RUN = "the run ends";
const CAUGHT_INSTEAD = "caught · peel instead";
const PEEL_TRAIL = "peel";

const spanLabel = (low: number, high: number) =>
	`${low} ${RANGE_DASH} ${high}%`;

export type CoverageRung = {
	readonly band: CoverageBandId;
	readonly from: number;
	readonly to: number;
};

const PERFECT_RUNG: CoverageRung = {
	band: "perfect",
	from: AS_PERCENT,
	to: AS_PERCENT,
};

/**
 * The bands this gate's ladder has room to draw, best first. The opening gates
 * squeeze their lower rungs out — OK collapses onto the healthy line and the
 * floor clamps to zero — and an audit that scales the ladder can squeeze one out
 * at any gate. One derivation, so the table's rows, the objective's badge and
 * the tick beside it can never name different sets.
 */
export const coverageRungsFor = (
	ladder: CoverageLadder
): readonly CoverageRung[] => {
	const healthy = roundToOneDecimal(ladder.healthy);
	const ok = roundToOneDecimal(ladder.ok);
	const floor = roundToOneDecimal(ladder.floor);

	return [
		PERFECT_RUNG,
		{ band: "healthy", from: healthy, to: BELOW_FULL },
		...(ok > healthy - 1
			? []
			: [{ band: "ok" as const, from: ok, to: healthy - 1 }]),
		...(floor > ok - 1
			? []
			: [{ band: "shaky" as const, from: floor, to: ok - 1 }]),
		...(floor <= 0 ? [] : [{ band: "danger" as const, from: 0, to: floor }]),
	];
};

/**
 * The lowest landing that still clears. Usually OK; at the calibration gate,
 * where OK has no room, it is HEALTHY. The rungs run best first and the clearing
 * bands are a prefix of them, so the last clearing rung is the lowest one.
 */
export const clearingRungFor = (ladder: CoverageLadder): CoverageRung =>
	coverageRungsFor(ladder).reduce(
		(lowest, rung) => (CLEARING_BANDS[rung.band] ? rung : lowest),
		PERFECT_RUNG
	);

/**
 * Right answers this window owes to reach `line`, or undefined where five cannot.
 * Counted from where the run stood when the window opened, so the figure prices
 * the window rather than counting down as it is played out.
 */
export const answersOwedFor = (
	line: number,
	held: number,
	gainPercent: number
): number | undefined => {
	const owed = roundToOneDecimal(Math.max(0, line - held));

	if (owed === 0) return 0;
	if (gainPercent <= 0) return undefined;

	const needed = Math.ceil(owed / gainPercent);

	return needed > SLICE_WINDOW ? undefined : needed;
};

const answersToLand = (line: number, gainPercent: number): number =>
	answersOwedFor(line, 0, gainPercent) ?? SLICE_WINDOW;

const outOf = (count: number) => `${count} of ${SLICE_WINDOW}`;

export type BandOutcomesFrame = {
	gateName: string;
	gate: number;
	correctThisGate: number;
	held: number;
	ladder: CoverageLadder;
	coverageGainPercent: number;
	peelKb: number;
	/** True while the build holds a config that escrows its earnings (Database). */
	escrows?: boolean;
	/** True while a catch stands between a DANGER close and the end of the run. */
	catchesFatal?: boolean;
	payout: (correct: number) => number;
};

/**
 * A band is only landed when the meter reaches it AND the day's floor of right
 * answers is paid: a floor-held meter reads high but closes SHAKY (ADR-094), so
 * an objective that ignored the floor would tick on a window that failed.
 */
const landsAt = (line: number, frame: BandOutcomesFrame): boolean =>
	roundToOneDecimal(frame.held) >= line &&
	frame.correctThisGate >= FLOOR_CORRECT;

const bandObjectiveFor = (
	band: CoverageBandId,
	explain: string,
	met: boolean,
	trail?: string
): Objective => ({
	statement: {
		lead: CLEAR_LEAD,
		figure: COVERAGE_BAND_WORD[band],
		color: COVERAGE_BAND_COLOR[band],
		...(trail === undefined ? {} : { trail }),
	},
	explain,
	met,
});

/**
 * The audit a strong close arms (ADR-099), listed only where it is genuinely
 * extra. At the calibration gates OK has no room, so the clearing line already
 * is HEALTHY and the row would restate the required objective word for word.
 */
const auditObjectivesFor = (
	rung: CoverageRung,
	frame: BandOutcomesFrame
): readonly Objective[] => {
	if (rung.band === "healthy") return [];

	return [
		bandObjectiveFor(
			"healthy",
			AUDIT_SECTION,
			landsAt(roundToOneDecimal(frame.ladder.healthy), frame),
			CLEAR_TRAIL
		),
	];
};

/**
 * The gate, its swatch and the audit a strong close arms are three prizes on one
 * window, and a player can take any without the others: run coverage is
 * cumulative, so a flawless window can still land short of the clearing line,
 * and a comfortable clear can carry a miss. Every row reads live, so the panel
 * says which are already in hand before the build is committed.
 */
export const objectivesFor = (frame: BandOutcomesFrame): ObjectivesProps => {
	const rung = clearingRungFor(frame.ladder);

	return {
		requiredLead: REQUIRED_LEAD,
		required: bandObjectiveFor(
			rung.band,
			CLEAR_SECTION,
			landsAt(rung.from, frame),
			CLEAR_TRAIL
		),
		optionalLead: OPTIONAL_LEAD,
		optional: [
			{
				...bandObjectiveFor(
					"perfect",
					`${SWATCH_SECTION} ${frame.gateName} ${SWATCH_WORD}`,
					frame.correctThisGate >= SLICE_WINDOW
				),
				figures: [{ label: outOf(SLICE_WINDOW) }],
			},
			...auditObjectivesFor(rung, frame),
		],
	};
};

const rangeOf = ({ band, from, to }: CoverageRung) => {
	if (band === "perfect") return `${AS_PERCENT}%`;
	if (band === "danger") return `under ${to}%`;
	return spanLabel(from, to);
};

const paysOf = (rung: CoverageRung, frame: BandOutcomesFrame) => {
	if (rung.band === "perfect") return signedKbLabel(frame.payout(SLICE_WINDOW));
	if (rung.band === "shaky")
		return `${signedKbLabel(-frame.peelKb)} ${PEEL_TRAIL}`;
	if (rung.band === "danger")
		return frame.catchesFatal === true ? CAUGHT_INSTEAD : ENDS_THE_RUN;

	return signedKbLabel(
		frame.payout(answersToLand(rung.from, frame.coverageGainPercent))
	);
};

export const bandOutcomesFor = (frame: BandOutcomesFrame): BandOutcome[] =>
	coverageRungsFor(frame.ladder).map((rung) => ({
		band: rung.band,
		range: rangeOf(rung),
		pays: paysOf(rung, frame),
	}));

export const bandOutcomesPropsFor = (
	frame: BandOutcomesFrame,
	bar: CoverageBarProps
): BandOutcomesProps => ({
	title: BAND_OUTCOMES_TITLE,
	objectives: objectivesFor(frame),
	note:
		frame.escrows === true
			? `${BAND_OUTCOMES_NOTE} ${ESCROW_NOTE}`
			: BAND_OUTCOMES_NOTE,
	outcomes: bandOutcomesFor(frame),
	bar,
});

import { CLEARING_BANDS } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import { swatchForGate } from "~/modules/run/gate/domain/swatch.model";
import {
	SLICE_WINDOW,
	roundToOneDecimal,
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
	ObjectivesProps,
	RequiredObjective,
} from "~/ui/kanto-theme/Objectives.ui";

const AS_PERCENT = 100;
const BELOW_FULL = AS_PERCENT - 1;
const RANGE_DASH = "–";

export const BAND_OUTCOMES_TITLE = "Objectives and rewards";
export const BAND_OUTCOMES_NOTE =
	"Pays land in the run balance when the gate shuts. A peel is paid in KB or in configs.";

const CLEAR_SECTION = "to clear the gate";
const CLEAR_LEAD = "Finish at";
const CLEAR_TRAIL = "or better";
const OPTIONAL_LEAD = "Extra objectives";
const CLIMB_SHUTS = "Anything under it and the climb ends here.";
const ANSWER_LEAD = "answer";
const SWATCH_KEPT = "kept for good";

const ENDS_THE_RUN = "the run ends";
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
	/** Where the run stood when this window opened, so the price does not move. */
	openingHeld: number;
	ladder: CoverageLadder;
	coverageGainPercent: number;
	peelKb: number;
	payout: (correct: number) => number;
};

const owedClause = (owed: number | undefined): string => {
	if (owed === undefined)
		return `, which ${outOf(SLICE_WINDOW)} right no longer reaches`;
	if (owed === 0) return ", which the run already holds";
	return `, or ${owed} of the ${SLICE_WINDOW} right`;
};

const shutClause = (gate: number): string => {
	const next = swatchForGate(gate + 1);
	return next === undefined
		? CLIMB_SHUTS
		: `Anything under it and ${next.gateName} stays shut.`;
};

/**
 * The clearing line in three readings: the percentage, the answers that reach it
 * from where this window opened, and what staying under it costs. The badge
 * beside it names the band; this says what the band is worth in answers, which
 * is the unit the player actually spends.
 */
const clearExplainFor = (
	rung: CoverageRung,
	{ gate, openingHeld, coverageGainPercent }: BandOutcomesFrame
): string => {
	const owed = answersOwedFor(rung.from, openingHeld, coverageGainPercent);

	return `That is ${rung.from}% coverage${owedClause(owed)}. ${shutClause(gate)}`;
};

const requiredObjectiveFor = (
	rung: CoverageRung,
	met: boolean,
	frame: BandOutcomesFrame
): RequiredObjective => ({
	lead: CLEAR_SECTION,
	statement: {
		lead: CLEAR_LEAD,
		figure: COVERAGE_BAND_WORD[rung.band],
		color: COVERAGE_BAND_COLOR[rung.band],
		trail: CLEAR_TRAIL,
	},
	explain: clearExplainFor(rung, frame),
	met,
});

/**
 * The gate and its swatch are two prizes on one window, and a player can take
 * either without the other: run coverage is cumulative, so a flawless window
 * can still land short of the clearing line, and a comfortable clear can carry
 * a miss. Both rows read live, so the panel says which of the two is already in
 * hand before the build is committed.
 */
export const objectivesFor = (frame: BandOutcomesFrame): ObjectivesProps => {
	const rung = clearingRungFor(frame.ladder);
	const met = roundToOneDecimal(frame.held) >= rung.from;

	return {
		required: requiredObjectiveFor(rung, met, frame),
		optionalLead: OPTIONAL_LEAD,
		optional: [
			{
				name: `Earn the ${frame.gateName} swatch`,
				detail: SWATCH_KEPT,
				met: frame.correctThisGate >= SLICE_WINDOW,
				requirements: [{ lead: ANSWER_LEAD, figure: outOf(SLICE_WINDOW) }],
			},
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
	if (rung.band === "danger") return ENDS_THE_RUN;

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
	note: BAND_OUTCOMES_NOTE,
	outcomes: bandOutcomesFor(frame),
	bar,
});

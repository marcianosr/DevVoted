import { CLEARING_BANDS } from "~/modules/run/gate/application/gateOutcome.viewmodel";
import {
	type GateSwatch,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import {
	SLICE_WINDOW,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import { signedKbLabel } from "~/shared/lib/storage";

import type {
	BandOutcome,
	BandOutcomesProps,
} from "~/ui/kanto-theme/BandOutcomes.ui";
import type {
	CoverageBandId,
	CoverageLadder,
} from "~/ui/kanto-theme/CoverageBar.ui";
import type { LeadLine, LeadPart } from "~/ui/kanto-theme/Lead.ui";
import type {
	Objective,
	ObjectivesProps,
} from "~/ui/kanto-theme/Objectives.ui";

const AS_PERCENT = 100;
const BELOW_FULL = AS_PERCENT - 1;
const RANGE_DASH = "–";

export const BAND_OUTCOMES_TITLE = "At stake";
const PAID_WHEN = "Paid when the gate shuts.";
export const BAND_OUTCOMES_NOTE = `${PAID_WHEN} Miss it and you owe a peel, settled in KB or in configs.`;
export const FREE_MISS_NOTE = `${PAID_WHEN} Miss it and you owe nothing: the same gate runs again on ${SLICE_WINDOW} fresh polls.`;

export const ESCROW_NOTE =
	"An open transaction only pays on a clear: SHAKY or DANGER rolls back every KB this window held.";

const CLEAR_LEAD = "Finish at ";
const CLEAR_TRAIL = " or better";
const EARNS = "earns ";
const ADVANCE_LEAD = "advance to ";
const OR_MORE = " or more";
const ALL_RIGHT = `Answer all ${SLICE_WINDOW} right`;
const SWATCH_WORD = "swatch";

const ENDS_THE_RUN = "the run ends";
const CAUGHT_INSTEAD = "caught · peel instead";
const PEEL_TRAIL = "peel";
const NO_PEEL = "no peel";

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

export const clearingRungFor = (ladder: CoverageLadder): CoverageRung =>
	coverageRungsFor(ladder).reduce(
		(lowest, rung) => (CLEARING_BANDS[rung.band] ? rung : lowest),
		PERFECT_RUNG
	);

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

export type BandOutcomesFrame = {
	swatch: GateSwatch;
	gate: number;
	held: number;
	ladder: CoverageLadder;
	coverageGainPercent: number;
	peelKb: number;
	escrows?: boolean;
	catchesFatal?: boolean;
	payout: (correct: number) => number;
};

const rangeOf = ({ band, from, to }: CoverageRung) => {
	if (band === "perfect") return `${AS_PERCENT}%`;
	if (band === "danger") return `under ${to}%`;
	return spanLabel(from, to);
};

const peelsNothing = (frame: BandOutcomesFrame) => frame.peelKb === 0;

const paysOf = (rung: CoverageRung, frame: BandOutcomesFrame) => {
	if (rung.band === "perfect") return signedKbLabel(frame.payout(SLICE_WINDOW));
	if (rung.band === "shaky")
		return peelsNothing(frame)
			? NO_PEEL
			: `${signedKbLabel(-frame.peelKb)} ${PEEL_TRAIL}`;
	if (rung.band === "danger")
		return frame.catchesFatal === true ? CAUGHT_INSTEAD : ENDS_THE_RUN;

	return signedKbLabel(
		frame.payout(answersToLand(rung.from, frame.coverageGainPercent))
	);
};

const advancePartsFor = (gate: number): readonly LeadPart[] => {
	const next = swatchForGate(gate + 1);

	if (next === undefined) return [];
	return [{ figure: `${ADVANCE_LEAD}${next.gateName}` }];
};

const clearObjectiveFor = (
	rung: CoverageRung,
	frame: BandOutcomesFrame
): Objective => {
	const earns: LeadLine = [
		EARNS,
		...advancePartsFor(frame.gate),
		{ figure: paysOf(rung, frame), band: rung.band },
		OR_MORE,
	];

	return {
		statement: [CLEAR_LEAD, { band: rung.band }, CLEAR_TRAIL],
		earns,
	};
};

const swatchObjectiveFor = ({ swatch }: BandOutcomesFrame): Objective => ({
	statement: [ALL_RIGHT],
	earns: [EARNS, { swatch, label: `${swatch.gateName} ${SWATCH_WORD}` }],
});

export const objectivesFor = (frame: BandOutcomesFrame): ObjectivesProps => ({
	objectives: [
		clearObjectiveFor(clearingRungFor(frame.ladder), frame),
		swatchObjectiveFor(frame),
	],
});

export const bandOutcomesFor = (frame: BandOutcomesFrame): BandOutcome[] =>
	coverageRungsFor(frame.ladder).map((rung) => ({
		band: rung.band,
		range: rangeOf(rung),
		pays: paysOf(rung, frame),
	}));

const noteFor = (frame: BandOutcomesFrame): string => {
	const lead = peelsNothing(frame) ? FREE_MISS_NOTE : BAND_OUTCOMES_NOTE;

	return frame.escrows === true ? `${lead} ${ESCROW_NOTE}` : lead;
};

export const bandOutcomesPropsFor = (
	frame: BandOutcomesFrame,
	standing: CoverageBandId
): BandOutcomesProps => ({
	title: BAND_OUTCOMES_TITLE,
	objectives: objectivesFor(frame),
	note: noteFor(frame),
	outcomes: bandOutcomesFor(frame),
	standing,
});

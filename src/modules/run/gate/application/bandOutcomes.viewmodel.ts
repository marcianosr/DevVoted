import {
	ratioOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import { GATE_WORD } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { clearsAt } from "~/modules/run/gate/domain/gate.model";
import {
	type GateSwatch,
	swatchForGate,
} from "~/modules/run/gate/domain/swatch.model";
import {
	MIN_WINDOW_UNITS,
	SLICE_WINDOW,
	meetsWindowMinimum,
	roundToOneDecimal,
} from "~/modules/run/run/domain/rules.model";
import { signedKbLabel } from "~/shared/lib/storage";

import type {
	BandLadderProps,
	LadderRung,
} from "~/ui/kanto-theme/BandLadder.ui";
import type { BandOutcomesProps } from "~/ui/kanto-theme/BandOutcomes.ui";
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
const ROOM = 1;

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
const ALL_RIGHT_LEAD = "Answer all ";
const OF_WORD = "of";
const SCORED_WORD = "scored";
const MINIMUM_LEAD = "Score at least ";
const MINIMUM_TRAIL = " units this window";
const MINIMUM_EARNS =
	"partials count · the gate holds otherwise, whatever the meter reads";
const ALL_RIGHT_TRAIL = " right";
const SWATCH_WORD = "swatch";
const META_JOIN = " · ";

const ENDS_THE_RUN = "the run ends";
const CAUGHT_INSTEAD = "caught · peel instead";
const PEEL_TRAIL = "peel";
const NO_PEEL = "no peel";

const UNIT_WORD = "unit";
const UNITS_WORD = "units";
const UNITS_TO = " to ";
const POLL_WORD = "poll";
const POLLS_WORD = "polls";
const LEFT = " left";
const STANDING_JOIN = " · ";

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

const hasRoom = (rung: CoverageRung) =>
	rung.band === "danger" ? rung.to > rung.from : rung.to - rung.from >= ROOM;

export const coverageRungsFor = (
	ladder: CoverageLadder
): readonly CoverageRung[] => {
	const healthy = roundToOneDecimal(ladder.healthy);
	const ok = roundToOneDecimal(ladder.ok);
	const floor = roundToOneDecimal(ladder.floor);

	return [
		PERFECT_RUNG,
		{ band: "healthy", from: healthy, to: AS_PERCENT },
		...[
			{ band: "ok" as const, from: ok, to: healthy },
			{ band: "shaky" as const, from: floor, to: ok },
			{ band: "danger" as const, from: 0, to: floor },
		].filter(hasRoom),
	];
};

export const clearingRungFor = (
	ladder: CoverageLadder,
	gate: number
): CoverageRung =>
	coverageRungsFor(ladder).reduce(
		(lowest, rung) => (clearsAt(rung.band, gate) ? rung : lowest),
		PERFECT_RUNG
	);

const nextRungFor = (
	ladder: CoverageLadder,
	held: number
): CoverageRung | undefined =>
	[...coverageRungsFor(ladder)].reverse().find((rung) => rung.from > held);

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
	answeredThisGate: number;
	scoredThisGate?: number;
	escrows?: boolean;
	catchesFatal?: boolean;
	payout: (correct: number) => number;
};

const peelsNothing = (frame: BandOutcomesFrame) => frame.peelKb === 0;

const paysOf = (rung: CoverageRung, frame: BandOutcomesFrame) => {
	if (rung.band === "perfect") return signedKbLabel(frame.payout(SLICE_WINDOW));
	if (rung.band === "danger")
		return frame.catchesFatal === true ? CAUGHT_INSTEAD : ENDS_THE_RUN;
	if (!clearsAt(rung.band, frame.gate))
		return peelsNothing(frame)
			? NO_PEEL
			: `${signedKbLabel(-frame.peelKb)} ${PEEL_TRAIL}`;

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

const minimumObjectiveFor = (): Objective => ({
	statement: [MINIMUM_LEAD, { figure: `${MIN_WINDOW_UNITS}` }, MINIMUM_TRAIL],
	earns: [MINIMUM_EARNS],
});

const swatchObjectiveFor = ({ swatch }: BandOutcomesFrame): Objective => ({
	statement: [ALL_RIGHT_LEAD, { figure: `${SLICE_WINDOW}` }, ALL_RIGHT_TRAIL],
	earns: [EARNS, { swatch, label: `${swatch.gateName} ${SWATCH_WORD}` }],
});

export const objectivesFor = (frame: BandOutcomesFrame): ObjectivesProps => ({
	objectives: [
		clearObjectiveFor(clearingRungFor(frame.ladder, frame.gate), frame),
		minimumObjectiveFor(),
		swatchObjectiveFor(frame),
	],
});

export const metaFor = ({ swatch, gate }: BandOutcomesFrame): LeadLine => [
	`${swatch.gateName}${META_JOIN}${GATE_WORD} `,
	{ figure: `${gate}` },
];

export const ladderFor = (frame: BandOutcomesFrame): BandLadderProps => ({
	held: frame.held,
	lines: frame.ladder,
	rungs: [...coverageRungsFor(frame.ladder)]
		.reverse()
		.map((rung): LadderRung => ({ ...rung, pays: paysOf(rung, frame) })),
});

const wordOf = (count: number, one: string, many: string) =>
	count === 1 ? one : many;

const pollsLeftPartsFor = (frame: BandOutcomesFrame): readonly LeadPart[] => {
	const left = SLICE_WINDOW - frame.answeredThisGate;

	return [
		{ figure: `${left}` },
		` ${wordOf(left, POLL_WORD, POLLS_WORD)}${LEFT}`,
	];
};

const minimumPartsFor = (frame: BandOutcomesFrame): readonly LeadPart[] => {
	const scored = frame.scoredThisGate;

	if (scored === undefined || meetsWindowMinimum(scored)) return [];

	return [
		STANDING_JOIN,
		{ figure: `${roundToOneDecimal(scored)}` },
		` ${OF_WORD} `,
		{ figure: `${MIN_WINDOW_UNITS}` },
		` ${UNITS_WORD} ${SCORED_WORD}`,
	];
};

export const standingLineFor = (frame: BandOutcomesFrame): LeadLine => {
	const next = nextRungFor(frame.ladder, frame.held);
	const polls = pollsLeftPartsFor(frame);
	const minimum = minimumPartsFor(frame);

	if (next === undefined) return [...polls, ...minimum];

	const owed = roundToOneDecimal(
		ratioOf(next.from - frame.held) * scoringSlotsAt(frame.gate)
	);

	return [
		{ figure: `+${owed}`, band: next.band },
		` ${wordOf(owed, UNIT_WORD, UNITS_WORD)}${UNITS_TO}`,
		{ band: next.band },
		STANDING_JOIN,
		...polls,
		...minimum,
	];
};

const noteFor = (frame: BandOutcomesFrame): string => {
	const lead = peelsNothing(frame) ? FREE_MISS_NOTE : BAND_OUTCOMES_NOTE;

	return frame.escrows === true ? `${lead} ${ESCROW_NOTE}` : lead;
};

export const bandOutcomesPropsFor = (
	frame: BandOutcomesFrame
): BandOutcomesProps => ({
	title: BAND_OUTCOMES_TITLE,
	meta: metaFor(frame),
	objectives: objectivesFor(frame),
	ladder: ladderFor(frame),
	standing: standingLineFor(frame),
	note: noteFor(frame),
});

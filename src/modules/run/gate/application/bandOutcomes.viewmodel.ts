import { gateOutputOf } from "~/modules/run/build/domain/coverageRatio.model";
import { GATE_WORD } from "~/modules/run/gate/application/swatchTrack.viewmodel";
import { bandAtLadder, clearsAt } from "~/modules/run/gate/domain/gate.model";
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
export const FREE_MISS_NOTE = "Received at the end of the gate.";
export const BAND_OUTCOMES_NOTE = `${FREE_MISS_NOTE} Miss it and you owe a peel, settled in KB or in configs.`;

export const ESCROW_NOTE =
	"An open transaction only pays on a clear: SHAKY or DANGER rolls back every KB this window held.";

const CLEAR_LEAD = "Finish at ";
const CLEAR_TRAIL = " or better";
const EARNS = "earns ";
const EARNS_THE = "earns the ";
const AND = " and ";
const ADVANCE = "advance to the next gate";
const OR_MORE = " or more";
const CLEAR_LINE_OPEN = " (";
const CLEAR_LINE_CLOSE = ")";
const REACH_LEAD = "Reach ";
const COVERAGE_TRAIL = " coverage";
const SWATCH_WORD = "swatch";
const META_JOIN = " · ";

const ENDS_THE_RUN = "the run ends";
const CAUGHT_INSTEAD = "caught · peel instead";
const PEEL_TRAIL = "peel";
const NO_PEEL = "no peel";
const GATE_HELD = "gate held · ";

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

const RIGHT_COUNTS: readonly number[] = Array.from(
	{ length: SLICE_WINDOW + 1 },
	(_, right) => right
);

const gainOfRight = (
	right: number,
	gainPercent: number,
	accuracyBonus: number
): number =>
	gateOutputOf(right * gainPercent, accuracyBonus, {
		earned: right,
		available: SLICE_WINDOW,
	});

export const answersOwedFor = (
	line: number,
	held: number,
	gainPercent: number,
	accuracyBonus: number
): number | undefined => {
	const owed = roundToOneDecimal(Math.max(0, line - held));

	if (owed === 0) return 0;
	if (gainPercent <= 0) return undefined;

	return RIGHT_COUNTS.find(
		(right) => gainOfRight(right, gainPercent, accuracyBonus) >= owed
	);
};

const answersToLand = (
	line: number,
	gainPercent: number,
	accuracyBonus: number
): number =>
	answersOwedFor(line, 0, gainPercent, accuracyBonus) ?? SLICE_WINDOW;

export type BandOutcomesFrame = {
	swatch: GateSwatch;
	gate: number;
	held: number;
	ladder: CoverageLadder;
	coverageGainPercent: number;
	accuracyBonus?: number;
	peelKb: number;
	escrows?: boolean;
	catchesFatal?: boolean;
	payout: (correct: number, band: CoverageBandId) => number;
};

const peelsNothing = (frame: BandOutcomesFrame) => frame.peelKb === 0;

const paysOf = (rung: CoverageRung, frame: BandOutcomesFrame) => {
	if (rung.band === "perfect")
		return signedKbLabel(frame.payout(SLICE_WINDOW, rung.band));
	if (rung.band === "danger")
		return frame.catchesFatal === true ? CAUGHT_INSTEAD : ENDS_THE_RUN;
	if (!clearsAt(rung.band, frame.gate))
		return peelsNothing(frame)
			? `${GATE_HELD}${NO_PEEL}`
			: `${GATE_HELD}${signedKbLabel(-frame.peelKb)} ${PEEL_TRAIL}`;

	return signedKbLabel(
		frame.payout(
			answersToLand(
				rung.from,
				frame.coverageGainPercent,
				frame.accuracyBonus ?? 0
			),
			rung.band
		)
	);
};

const advancePartsFor = (gate: number): readonly LeadPart[] => {
	if (swatchForGate(gate + 1) === undefined) return [EARNS];
	return [EARNS_THE, { figure: ADVANCE }, AND];
};

const clearObjectiveFor = (
	rung: CoverageRung,
	frame: BandOutcomesFrame
): Objective => {
	const earns: LeadLine = [
		...advancePartsFor(frame.gate),
		{ figure: paysOf(rung, frame), band: rung.band },
		OR_MORE,
	];

	return {
		statement: [
			CLEAR_LEAD,
			{ band: rung.band },
			CLEAR_LINE_OPEN,
			{ figure: `${rung.from}%`, band: rung.band },
			CLEAR_LINE_CLOSE,
			CLEAR_TRAIL,
		],
		earns,
	};
};

const swatchObjectiveFor = (frame: BandOutcomesFrame): Objective => ({
	statement: [
		REACH_LEAD,
		{ figure: `${AS_PERCENT}%`, band: PERFECT_RUNG.band },
		COVERAGE_TRAIL,
	],
	earns: [
		EARNS,
		{ swatch: frame.swatch, label: `${frame.swatch.gateName} ${SWATCH_WORD}` },
		AND,
		{ figure: paysOf(PERFECT_RUNG, frame), band: PERFECT_RUNG.band },
	],
});

export const objectivesFor = (frame: BandOutcomesFrame): ObjectivesProps => ({
	objectives: [
		clearObjectiveFor(clearingRungFor(frame.ladder, frame.gate), frame),
		swatchObjectiveFor(frame),
	],
});

export const metaFor = ({ swatch, gate }: BandOutcomesFrame): LeadLine => [
	`${swatch.gateName}${META_JOIN}${GATE_WORD} `,
	{ figure: `${gate}` },
];

export const ladderFor = (frame: BandOutcomesFrame): BandLadderProps => ({
	held: frame.held,
	band: bandAtLadder(frame.held, frame.ladder).id,
	lines: frame.ladder,
	rungs: [...coverageRungsFor(frame.ladder)]
		.reverse()
		.map((rung): LadderRung => ({ ...rung, pays: paysOf(rung, frame) })),
});

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
	note: noteFor(frame),
});

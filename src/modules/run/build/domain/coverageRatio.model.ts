import {
	SLICE_WINDOW,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

export const BASE_UNIT = 1;
export const SINGLE_CREDIT = 1;
export const MULTIPLE_CREDIT = 2;
export const KB_PER_PROVEN_SLOT = 32;
export const PAYOUT_RATIO_CAP = 1.5;
export const PERFECT_BONUS = 1.5;

const FLOAT_TOLERANCE = 1e-9;

export const creditFor = (answerType: AnswerType): number =>
	answerType === "multiple" ? MULTIPLE_CREDIT : SINGLE_CREDIT;

export const AS_PERCENT = 100;

export const percentOf = (ratio: number): number => ratio * AS_PERCENT;

export const ratioOf = (percent: number): number => percent / AS_PERCENT;

export type GateRung = {
	/** Units the run must hold at this close to read HEALTHY. */
	readonly healthy: number;
	/** Answers under the line where OK ends. */
	readonly okDrop: number;
};

/**
 * One row per gate, in answers. The step between rows is what a run sitting
 * on yesterday's line must earn today, and it grows with the climb; OK widens
 * from one answer under the line to three (ADR-094). Percent is derived.
 */
export const GATE_RUNGS: readonly GateRung[] = [
	{ healthy: 3, okDrop: 1 },
	{ healthy: 6, okDrop: 1 },
	{ healthy: 9, okDrop: 1 },
	{ healthy: 12, okDrop: 1.5 },
	{ healthy: 15.5, okDrop: 1.5 },
	{ healthy: 19.5, okDrop: 2 },
	{ healthy: 24, okDrop: 2 },
	{ healthy: 29, okDrop: 2 },
	{ healthy: 34.5, okDrop: 2.5 },
	{ healthy: 40, okDrop: 2.5 },
	{ healthy: 46, okDrop: 3 },
	{ healthy: 52, okDrop: 3 },
	{ healthy: 58.5, okDrop: 3 },
];

export const rungAt = (gate: number): GateRung =>
	GATE_RUNGS[Math.min(Math.max(0, gate), GATE_RUNGS.length - 1)];

export const healthyUnitsAt = (gate: number): number => rungAt(gate).healthy;

export const okDropAt = (gate: number): number => rungAt(gate).okDrop;

/**
 * The floor is where HEALTHY stood the day before, so a run that closed
 * HEALTHY never opens the next gate in DANGER, and Pallet has no floor at all
 * (ADR-057: the calibration gate can hold a run, never kill it).
 */
export const floorUnitsAt = (gate: number): number =>
	gate <= 0 ? 0 : healthyUnitsAt(gate - 1);

const asRatio = (value: number): number => Math.min(1, Math.max(0, value));

export const scoringSlotsAt = (gate: number): number =>
	SLICE_WINDOW * (Math.max(0, gate) + 1);

export const unitsToRatio = (units: number, gate: number): number =>
	units / scoringSlotsAt(gate);

export const runCoverageOf = (units: number, gate: number): number =>
	asRatio(unitsToRatio(units, gate));

/**
 * What units move the run-coverage bar by, at this gate. Units are flat, the bar
 * is a share of every slot the run has opened, so the same right answer is worth
 * less the deeper the climb goes. Reading `percentOf` off the units directly
 * reports a hundred times the truth at gate 0 and sixty-five at the summit.
 */
export const coverageGainPercentFor = (units: number, gate: number): number =>
	percentOf(unitsToRatio(units, gate));

export const bankableUnits = (units: number, gate: number): number =>
	Math.min(Math.max(0, units), scoringSlotsAt(gate));

export const surplusUnits = (units: number, gate: number): number =>
	Math.max(0, units - scoringSlotsAt(gate));

export const surplusPayoutKb = (units: number, gate: number): number =>
	Math.round(surplusUnits(units, gate) * KB_PER_PROVEN_SLOT);

export const healthyAt = (gate: number): number =>
	unitsToRatio(healthyUnitsAt(gate), gate);

/** Units the run must hold at this close to read OK: HEALTHY, less the drop. */
export const okUnitsAt = (gate: number): number =>
	healthyUnitsAt(gate) - okDropAt(gate);

export const okAt = (gate: number): number =>
	unitsToRatio(okUnitsAt(gate), gate);

export const floorAt = (gate: number): number =>
	unitsToRatio(floorUnitsAt(gate), gate);

export type CoverageConfigBonus = {
	readonly configId: string;
	readonly value: number;
	/** Present only when the config multiplied, so a row can pick its native form. */
	readonly factor?: number;
};

/** What one answer paid, split so the reveal can name each contributor. */
export type CoverageBreakdown = {
	readonly base: number;
	readonly streakBonus: number;
	readonly configBonuses: readonly CoverageConfigBonus[];
};

export type CoverageFactors = {
	readonly correct: number;
	readonly build: number;
};

export type CoverageBandId = "perfect" | "healthy" | "ok" | "shaky" | "danger";

const BAND = {
	perfect: { id: "perfect", label: "PERFECT", colour: "cerulean" },
	healthy: { id: "healthy", label: "HEALTHY", colour: "viridian" },
	ok: { id: "ok", label: "OK", colour: "saffron" },
	shaky: { id: "shaky", label: "SHAKY", colour: "vermillion" },
	danger: { id: "danger", label: "DANGER", colour: "cinnabar" },
} as const satisfies Record<
	CoverageBandId,
	{ id: CoverageBandId; label: string; colour: string }
>;

export type CoverageBand = (typeof BAND)[CoverageBandId];

export const bandOf = (id: CoverageBandId): CoverageBand => BAND[id];

const isPerfect = (ratio: number): boolean => ratio + FLOAT_TOLERANCE >= 1;

export const perfectBonusFor = (ratio: number): number =>
	isPerfect(ratio) ? PERFECT_BONUS : 1;

export const bandFor = (ratio: number, gate: number): CoverageBand => {
	if (isPerfect(ratio)) return BAND.perfect;
	if (ratio + FLOAT_TOLERANCE >= healthyAt(gate)) return BAND.healthy;
	if (ratio + FLOAT_TOLERANCE >= okAt(gate)) return BAND.ok;
	if (ratio + FLOAT_TOLERANCE >= floorAt(gate)) return BAND.shaky;
	return BAND.danger;
};

const BAND_ORDER: readonly CoverageBandId[] = [
	"danger",
	"shaky",
	"ok",
	"healthy",
	"perfect",
];

/** The bands a player may promise. Holding to SHAKY or DANGER is not a promise. */
export type CommittableBand = Extract<
	CoverageBandId,
	"ok" | "healthy" | "perfect"
>;

/**
 * What SLA pays for holding to the band it promised. Read off the band the
 * player COMMITTED to, never the one they landed in: paying for the landing
 * would make the promise free and every promise would be OK.
 */
export const SLA_UPLIFT: Readonly<Record<CommittableBand, number>> = {
	ok: 0.1,
	healthy: 0.25,
	perfect: 0.5,
};

export const meetsBand = (
	band: CoverageBand,
	least: CoverageBandId
): boolean => BAND_ORDER.indexOf(band.id) >= BAND_ORDER.indexOf(least);

export const atLeastBand = (
	band: CoverageBand,
	least: CoverageBandId
): CoverageBand => (meetsBand(band, least) ? band : BAND[least]);

export const payoutRatioFor = (ratio: number, gate: number): number =>
	Math.min(PAYOUT_RATIO_CAP, asRatio(ratio) / healthyAt(gate));

export const gatePayoutKb = (
	ratio: number,
	gate: number,
	weight: number,
	streak: number
): number =>
	Math.round(
		payoutRatioFor(ratio, gate) *
			perfectBonusFor(ratio) *
			weight *
			KB_PER_PROVEN_SLOT *
			streakMultiplier(streak)
	);


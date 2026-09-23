import {
	type Config,
	focusMultiplierOf,
} from "~/modules/run/config/domain/config.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";

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

export const okAt = (gate: number): number =>
	unitsToRatio(healthyUnitsAt(gate) - okDropAt(gate), gate);

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

const focusesOn = (
	config: Config,
	category: CategoryCode | undefined
): boolean => category !== undefined && config.focusCategory === category;

export const coverageMultiplierFor = (
	configs: readonly Config[],
	category?: CategoryCode
): number =>
	configs.reduce(
		(multiplier, config) =>
			multiplier *
			(config.coverageMultiplier ?? 1) *
			(focusesOn(config, category) ? focusMultiplierOf(config) : 1),
		1
	);

export const coverageMultiplierOf = (configs: readonly Config[]): number =>
	coverageMultiplierFor(configs);

export const focusBonusFor = (
	configs: readonly Config[],
	category?: CategoryCode
): number =>
	coverageMultiplierFor(configs, category) / coverageMultiplierFor(configs);

export const gainPerCorrectFor = (
	configs: readonly Config[],
	category?: CategoryCode,
	answerType: AnswerType = "single"
): number =>
	BASE_UNIT * creditFor(answerType) * coverageMultiplierFor(configs, category);

export const coverageAfter = (
	rights: number,
	gate: number,
	configs: readonly Config[],
	banked = 0,
	category?: CategoryCode
): number =>
	runCoverageOf(banked + rights * gainPerCorrectFor(configs, category), gate);

const multiplierToReach = (
	line: number,
	gate: number,
	rights: number,
	banked: number
): number | undefined => {
	const owed = line * scoringSlotsAt(gate) - banked;

	if (owed <= 0) return 0;
	if (rights <= 0) return undefined;

	return owed / (rights * BASE_UNIT);
};

export const multiplierToSurvive = (
	gate: number,
	rights: number,
	banked = 0
): number | undefined => multiplierToReach(floorAt(gate), gate, rights, banked);

export const multiplierToClear = (
	gate: number,
	rights: number,
	banked = 0
): number | undefined =>
	multiplierToReach(healthyAt(gate), gate, rights, banked);

export const coveredSlotsOf = (ratio: number, weight: number): number =>
	asRatio(ratio) * weight;

export const clearsBar = (ratio: number, gate: number): boolean =>
	ratio + FLOAT_TOLERANCE >= healthyAt(gate);

export const survivesGate = (ratio: number, gate: number): boolean =>
	ratio + FLOAT_TOLERANCE >= floorAt(gate);

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

/**
 * The best run coverage still reachable if every remaining poll lands. A run
 * whose ceiling sits under the summit's floor is over, and the model says so
 * rather than letting the player walk out three more days.
 */
export const maxReachableFrom = (
	banked: number,
	gate: number,
	unitsPerCorrect: number
): number => {
	const gatesLeft = Math.max(0, VICTORY_GATE - gate + 1);

	return runCoverageOf(
		banked + gatesLeft * SLICE_WINDOW * unitsPerCorrect,
		VICTORY_GATE
	);
};

export const isRunUnwinnable = (
	banked: number,
	gate: number,
	unitsPerCorrect: number
): boolean =>
	maxReachableFrom(banked, gate, unitsPerCorrect) + FLOAT_TOLERANCE <
	floorAt(VICTORY_GATE);

const rightsUpTo = (polls: number): readonly number[] =>
	Array.from({ length: polls + 1 }, (_, rights) => rights);

export const rightsToFill = (
	gate: number,
	polls: number,
	configs: readonly Config[],
	banked = 0
): number | undefined =>
	rightsUpTo(polls).find(
		(rights) => coverageAfter(rights, gate, configs, banked) >= 1
	);

export const rightsToSurvive = (
	gate: number,
	polls: number,
	configs: readonly Config[],
	banked = 0
): number | undefined =>
	rightsUpTo(polls).find((rights) =>
		survivesGate(coverageAfter(rights, gate, configs, banked), gate)
	);

export const rightsToClear = (
	gate: number,
	polls: number,
	configs: readonly Config[],
	banked = 0
): number | undefined =>
	rightsUpTo(polls).find((rights) =>
		clearsBar(coverageAfter(rights, gate, configs, banked), gate)
	);

export type CoveragePeril = "fatal" | "safe";

export const PERIL_COLOUR = {
	fatal: "cinnabar",
	safe: "viridian",
} as const satisfies Record<CoveragePeril, string>;

export type CoverageReading = {
	readonly weight: number;
	readonly ratio: number;
	readonly coveredSlots: number;
	readonly band: CoverageBand;
	readonly floor: number;
	readonly healthyLine: number;
	readonly healthyOwed: number;
	readonly survivalOwed: number;
	readonly meetsBar: boolean;
	readonly survives: boolean;
	readonly peril: CoveragePeril;
};

export const readCoverage = (
	weight: number,
	ratio: number,
	gate: number
): CoverageReading => {
	const held = asRatio(ratio);
	const survives = survivesGate(held, gate);

	return {
		weight,
		ratio: held,
		coveredSlots: coveredSlotsOf(held, weight),
		band: bandFor(held, gate),
		floor: floorAt(gate),
		healthyLine: healthyAt(gate),
		healthyOwed: Math.max(0, healthyAt(gate) - held),
		survivalOwed: Math.max(0, floorAt(gate) - held),
		meetsBar: clearsBar(held, gate),
		survives,
		peril: survives ? "safe" : "fatal",
	};
};

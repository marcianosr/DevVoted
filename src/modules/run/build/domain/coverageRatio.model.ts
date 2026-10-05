import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

export const BASE_UNIT = 1;
export const SINGLE_CREDIT = 1;
export const MULTIPLE_CREDIT = 2;
export const KB_PER_EXTRA_BAR = 16;

const FLOAT_TOLERANCE = 1e-9;

export const creditFor = (answerType: AnswerType): number =>
	answerType === "multiple" ? MULTIPLE_CREDIT : SINGLE_CREDIT;

export const AS_PERCENT = 100;

export const percentOf = (ratio: number): number => ratio * AS_PERCENT;

export const ratioOf = (percent: number): number => percent / AS_PERCENT;

export type GateRung = {
	readonly slots: number;
	readonly floor: number;
	readonly ok: number;
	readonly healthy: number;
};

export const GATE_RUNGS: readonly GateRung[] = [
	{ slots: 5, floor: 0, ok: 52, healthy: 64 },
	{ slots: 5, floor: 43, ok: 55, healthy: 66 },
	{ slots: 6, floor: 47, ok: 57, healthy: 68 },
	{ slots: 6, floor: 50, ok: 60, healthy: 71 },
	{ slots: 7, floor: 53, ok: 63, healthy: 73 },
	{ slots: 7, floor: 56, ok: 66, healthy: 75 },
	{ slots: 7, floor: 60, ok: 68, healthy: 77 },
	{ slots: 8, floor: 63, ok: 71, healthy: 79 },
	{ slots: 8, floor: 66, ok: 74, healthy: 81 },
	{ slots: 9, floor: 69, ok: 77, healthy: 84 },
	{ slots: 9, floor: 73, ok: 79, healthy: 86 },
	{ slots: 9, floor: 76, ok: 82, healthy: 88 },
	{ slots: 10, floor: 79, ok: 84, healthy: 90 },
];

export const HEAD_START_SHARE = 0.1;

export const rungAt = (gate: number): GateRung =>
	GATE_RUNGS[Math.min(Math.max(0, gate), GATE_RUNGS.length - 1)];

const asRatio = (value: number): number => Math.min(1, Math.max(0, value));

export type AccuracyTally = {
	readonly earned: number;
	readonly available: number;
};

export const ACCURACY_GAIN_PER_GATE = 0.08;
export const ACCURACY_LOSS_PER_GATE = 0.04;

export const accuracyBonusAfter = (
	bonus: number,
	{ earned, available }: AccuracyTally
): number => {
	if (available <= 0) return bonus;
	const share = asRatio(earned / available);
	const delta =
		ACCURACY_GAIN_PER_GATE * share - ACCURACY_LOSS_PER_GATE * (1 - share);
	return Math.max(0, bonus + delta);
};

export const accuracyMultiplierFor = (
	bonus: number,
	accuracy: AccuracyTally
): number => 1 + accuracyBonusAfter(bonus, accuracy);

export const gateOutputOf = (
	pollOutput: number,
	bonus: number,
	accuracy: AccuracyTally
): number => pollOutput * accuracyMultiplierFor(bonus, accuracy);

export const scoringSlotsAt = (gate: number): number => rungAt(gate).slots;

export const unitsToRatio = (units: number, gate: number): number =>
	units / scoringSlotsAt(gate);

export const runCoverageOf = (units: number, gate: number): number =>
	asRatio(unitsToRatio(units, gate));

const codebaseThrough = (gate: number): number =>
	GATE_RUNGS.slice(0, Math.max(0, gate) + 1).reduce(
		(sum, rung) => sum + rung.slots,
		0
	);

export const runShareOf = (lifetimeUnits: number, gate: number): number =>
	asRatio(lifetimeUnits / codebaseThrough(gate));

export const coverageGainPercentFor = (units: number, gate: number): number =>
	percentOf(unitsToRatio(units, gate));

export const surplusUnits = (units: number, gate: number): number =>
	Math.max(0, units - scoringSlotsAt(gate));

export const surplusPayoutKb = (units: number, gate: number): number =>
	Math.round(unitsToRatio(surplusUnits(units, gate), gate) * KB_PER_EXTRA_BAR);

export const headStartFor = (units: number, gate: number): number =>
	Math.min(
		surplusUnits(units, gate) * HEAD_START_SHARE,
		floorAt(gate + 1) * scoringSlotsAt(gate + 1)
	);

export const healthyAt = (gate: number): number => ratioOf(rungAt(gate).healthy);

export const okAt = (gate: number): number => ratioOf(rungAt(gate).ok);

export const floorAt = (gate: number): number => ratioOf(rungAt(gate).floor);

export const healthyUnitsAt = (gate: number): number =>
	healthyAt(gate) * scoringSlotsAt(gate);

export type CoverageConfigBonus = {
	readonly configId: string;
	readonly value: number;
	readonly factor?: number;
};

export type CoverageBreakdown = {
	readonly base: number;
	readonly streakBonus?: number;
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

export type CommittableBand = Extract<
	CoverageBandId,
	"ok" | "healthy" | "perfect"
>;

export const BAND_BONUS: Readonly<Record<CommittableBand, number>> = {
	ok: 1,
	healthy: 1.25,
	perfect: 1.5,
};

export const isCommittableBand = (band: string): band is CommittableBand =>
	Object.hasOwn(BAND_BONUS, band);

export const bandBonusKbFor = (band: CoverageBand, clearKb: number): number =>
	isCommittableBand(band.id)
		? Math.round(clearKb * (BAND_BONUS[band.id] - 1))
		: 0;

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

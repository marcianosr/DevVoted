import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";

export const BASE_UNIT = 1;
export const SINGLE_CREDIT = 1;
export const MULTIPLE_CREDIT = 2;
export const KB_PER_PROVEN_SLOT = 32;
export const PAYOUT_RATIO_CAP = 1.5;
export const PERFECT_BONUS = 1.5;
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
	{ slots: 9, floor: 0, ok: 20, healthy: 40 },
	{ slots: 9, floor: 5, ok: 25, healthy: 44 },
	{ slots: 9, floor: 11, ok: 29, healthy: 47 },
	{ slots: 9, floor: 16, ok: 34, healthy: 51 },
	{ slots: 9, floor: 22, ok: 38, healthy: 55 },
	{ slots: 10, floor: 27, ok: 43, healthy: 58 },
	{ slots: 10, floor: 33, ok: 47, healthy: 62 },
	{ slots: 10, floor: 38, ok: 52, healthy: 65 },
	{ slots: 10, floor: 44, ok: 56, healthy: 69 },
	{ slots: 11, floor: 49, ok: 61, healthy: 73 },
	{ slots: 11, floor: 55, ok: 65, healthy: 76 },
	{ slots: 11, floor: 60, ok: 70, healthy: 80 },
	{ slots: 11, floor: 65, ok: 74, healthy: 84 },
];

export const HEAD_START_SHARE = 0.1;

export const rungAt = (gate: number): GateRung =>
	GATE_RUNGS[Math.min(Math.max(0, gate), GATE_RUNGS.length - 1)];

const asRatio = (value: number): number => Math.min(1, Math.max(0, value));

export type AccuracyTally = {
	readonly earned: number;
	readonly available: number;
};

export const accuracyMultiplierFor = ({
	earned,
	available,
}: AccuracyTally): number =>
	available <= 0 ? 1 : 2 ** (Math.max(0, earned) / available);

export const gateOutputOf = (
	pollOutput: number,
	accuracy: AccuracyTally
): number => pollOutput * accuracyMultiplierFor(accuracy);

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

export const perfectBonusFor = (ratio: number): number =>
	isPerfect(ratio) ? PERFECT_BONUS : 1;

export const perfectBonusKbFor = (band: CoverageBand, clearKb: number): number =>
	band.id === "perfect" ? Math.round(clearKb * (PERFECT_BONUS - 1)) : 0;

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
	weight: number
): number =>
	Math.round(
		payoutRatioFor(ratio, gate) *
			perfectBonusFor(ratio) *
			weight *
			KB_PER_PROVEN_SLOT
	);


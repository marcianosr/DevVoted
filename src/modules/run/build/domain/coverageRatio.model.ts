import {
	type Config,
	focusMultiplierOf,
} from "~/modules/run/config/domain/config.model";
import {
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import type { AnswerType } from "~/modules/run/run/domain/runPoll.model";
import type { CategoryCode } from "~/shared/lib/categories";

export const SINGLE_GAIN = 0.05;
export const MULTIPLE_GAIN = 0.08;
export const KB_PER_PROVEN_SLOT = 32;
export const PAYOUT_RATIO_CAP = 1.5;
export const PERFECT_BONUS = 1.5;

const FLOAT_TOLERANCE = 1e-9;

export const HEALTHY_LADDER: readonly number[] = [
	0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
];

export const LOSS_LADDER: readonly number[] = [
	0, 0, 0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.5,
];

export const OK_DROP = 0.15;
export const SHAKY_DROP = 0.25;

const atGate = (ladder: readonly number[], gate: number): number =>
	ladder[Math.min(Math.max(0, gate), ladder.length - 1)];

const asRatio = (value: number): number => Math.min(1, Math.max(0, value));

export const healthyAt = (gate: number): number =>
	atGate(HEALTHY_LADDER, gate);

export const okAt = (gate: number): number =>
	Math.max(0, healthyAt(gate) - OK_DROP);

export const floorAt = (gate: number): number =>
	Math.max(0, healthyAt(gate) - SHAKY_DROP);

export const lossShareAt = (gate: number): number => atGate(LOSS_LADDER, gate);

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

const focusesOn = (config: Config, category: CategoryCode | undefined): boolean =>
	category !== undefined && config.focusCategory === category;

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

export const baseGainFor = (answerType: AnswerType = "single"): number =>
	answerType === "multiple" ? MULTIPLE_GAIN : SINGLE_GAIN;

export const gainPerCorrectFor = (
	configs: readonly Config[],
	category?: CategoryCode,
	answerType: AnswerType = "single"
): number => baseGainFor(answerType) * coverageMultiplierFor(configs, category);

export const gainPerMissFor = (
	gate: number,
	configs: readonly Config[],
	category?: CategoryCode,
	answerType: AnswerType = "single"
): number =>
	gainPerCorrectFor(configs, category, answerType) * lossShareAt(gate);

export const coverageDeltaFor = (
	share: number,
	gate: number,
	configs: readonly Config[],
	category?: CategoryCode,
	answerType: AnswerType = "single"
): number => {
	const earned = asRatio(share);

	return (
		gainPerCorrectFor(configs, category, answerType) *
		(earned - (1 - earned) * lossShareAt(gate))
	);
};

export const netAnswersFor = (
	rights: number,
	wrongs: number,
	gate: number
): number => rights - wrongs * lossShareAt(gate);

export const coverageAfter = (
	rights: number,
	wrongs: number,
	gate: number,
	configs: readonly Config[],
	category?: CategoryCode
): number =>
	asRatio(
		netAnswersFor(rights, wrongs, gate) * gainPerCorrectFor(configs, category)
	);

const multiplierToReach = (
	line: number,
	gate: number,
	rights: number,
	polls: number
): number | undefined => {
	const net = netAnswersFor(rights, polls - rights, gate);

	if (line <= 0) return 0;
	if (net <= 0) return undefined;

	return line / (net * SINGLE_GAIN);
};

export const multiplierToSurvive = (
	gate: number,
	rights: number,
	polls: number
): number | undefined => multiplierToReach(floorAt(gate), gate, rights, polls);

export const multiplierToClear = (
	gate: number,
	rights: number,
	polls: number
): number | undefined => multiplierToReach(healthyAt(gate), gate, rights, polls);

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

const rightsUpTo = (polls: number): readonly number[] =>
	Array.from({ length: polls + 1 }, (_, rights) => rights);

export const rightsToFill = (
	gate: number,
	polls: number,
	configs: readonly Config[]
): number | undefined =>
	rightsUpTo(polls).find(
		(rights) => coverageAfter(rights, polls - rights, gate, configs) >= 1
	);

export const rightsToSurvive = (
	gate: number,
	polls: number,
	configs: readonly Config[]
): number | undefined =>
	rightsUpTo(polls).find((rights) =>
		survivesGate(coverageAfter(rights, polls - rights, gate, configs), gate)
	);

export const rightsToClear = (
	gate: number,
	polls: number,
	configs: readonly Config[]
): number | undefined =>
	rightsUpTo(polls).find((rights) =>
		clearsBar(coverageAfter(rights, polls - rights, gate, configs), gate)
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

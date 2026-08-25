import type { CategoryCode } from "~/shared/lib/categories";
import {
	kb,
	type Kb,
	nothing,
	type Nothing,
	percent,
	type Percent,
} from "~/shared/lib/displayValue";
import type { AnsweredPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	Config,
	faucetKbPerCorrect,
	interestPctOf,
} from "~/modules/run/config/domain/config.model";
import {
	effectOf,
	touchesCoverage,
} from "~/modules/run/config/domain/effect.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";
import type { GateRowReason } from "~/modules/run/gate/domain/configRole.model";

/**
 * The gate screen reads like a CI run: one row per pipeline config, each with
 * its roster description and the coverage or storage it produced this gate —
 * attributed from the run's own data. Configs demand nothing (ADR-035), so a
 * row is passed when its effect fired and skipped when the window gave it
 * nothing to fire on.
 */
export type GateRewardKind = "coverage" | "storage";
export type GateRewardStatus = "passed" | "skipped" | "failed";

export type GateRewardValue = Percent | Kb | Nothing;

export type GateRewardRow = {
	readonly key: string;
	readonly config: Config;
	readonly reason: GateRowReason;
	readonly value: GateRewardValue;
	readonly kind: GateRewardKind;
	readonly status: GateRewardStatus;
};

/** How many of a window's answers were fully right — the gate's score line. */
export const correctCount = (answered: readonly AnsweredPoll[]): number =>
	answered.filter((poll) => poll.outcome === "correct").length;

const inCategory = (
	category: CategoryCode,
	answered: readonly AnsweredPoll[]
): readonly AnsweredPoll[] =>
	answered.filter((poll) => poll.category === category);

const coverageContribution = (
	config: Config,
	answered: readonly AnsweredPoll[]
): number =>
	roundToOneDecimal(
		answered.reduce((sum, poll) => {
			const bonus = poll.coverageBreakdown?.configBonuses.find(
				(entry) => entry.configId === config.id
			);
			return sum + (bonus?.value ?? 0);
		}, 0)
	);

const focusRow = (
	config: Config,
	category: CategoryCode,
	answered: readonly AnsweredPoll[]
): GateRewardRow => {
	const matched = inCategory(category, answered);
	const base = { key: config.id, config, kind: "coverage" as const };

	if (matched.length === 0)
		return {
			...base,
			status: "skipped",
			reason: { kind: "noPollInCategory", category },
			value: nothing,
		};

	return {
		...base,
		status: "passed",
		reason: { kind: "config" },
		value: percent(coverageContribution(config, answered)),
	};
};

/**
 * A row's VALUE and kind come from the config's effect; its status is passed
 * unless the window never woke it (dormant Focus). Focus rows keep their
 * richer per-category copy.
 */
const rowFor = (
	config: Config,
	answered: readonly AnsweredPoll[],
	faucetThisGateKb?: number,
	interestThisGateKb?: number
): GateRewardRow => {
	if (config.focusCategory !== undefined)
		return focusRow(config, config.focusCategory, answered);

	const base = {
		key: config.id,
		config,
		status: "passed" as const,
		reason: { kind: "config" } as const,
	};

	if (touchesCoverage(config))
		return {
			...base,
			kind: "coverage",
			value: percent(coverageContribution(config, answered)),
		};
	if (config.storagePerCorrect !== undefined)
		return {
			...base,
			kind: "storage",
			// The exact capped faucet income when the engine provides it; the
			// uncapped estimate otherwise (pre-cap snapshots). Attributing the
			// whole gate faucet to this row is safe while one faucet config ships.
			value: kb(
				faucetThisGateKb ??
					(config.storagePerCorrect ?? 0) * correctCount(answered)
			),
		};
	if (config.storageInterestPct !== undefined)
		return {
			...base,
			kind: "storage",
			value: kb(interestThisGateKb ?? 0),
		};
	if (config.storageOnClear !== undefined)
		return {
			...base,
			kind: "storage",
			value: kb(effectOf(config).storageOnClear ?? 0),
		};
	return { ...base, kind: "coverage", value: nothing };
};

const KIND_ORDER: Record<GateRewardKind, number> = {
	coverage: 0,
	storage: 1,
};

type GateRewardInput = {
	readonly answered: readonly AnsweredPoll[];
	readonly configs: readonly Config[];
	/** Exact faucet income this gate (capped) — omitted by pre-cap callers. */
	readonly faucetThisGateKb?: number;
	/** Interest paid this gate — omitted by callers with no balance in hand. */
	readonly interestThisGateKb?: number;
};

export const gateRewardRows = ({
	answered,
	configs,
	faucetThisGateKb,
	interestThisGateKb,
}: GateRewardInput): readonly GateRewardRow[] =>
	configs
		.map((config) =>
			rowFor(config, answered, faucetThisGateKb, interestThisGateKb)
		)
		.sort((left, right) => KIND_ORDER[left.kind] - KIND_ORDER[right.kind]);

export type GateStepsSummary = {
	readonly passed: number;
	readonly failed: number;
	readonly skipped: number;
};

export const gateStepsSummary = (
	rows: readonly GateRewardRow[]
): GateStepsSummary => ({
	passed: rows.filter((row) => row.status === "passed").length,
	failed: rows.filter((row) => row.status === "failed").length,
	skipped: rows.filter((row) => row.status === "skipped").length,
});

/** Total storage this gate added: the clear payout plus every per-correct payout. */
export const gateStorageGained = (
	configs: readonly Config[],
	answered: readonly AnsweredPoll[],
	gateReward: number,
	faucetThisGateKb?: number
): number =>
	gateReward +
	(faucetThisGateKb ?? faucetKbPerCorrect(configs) * correctCount(answered));

export type StorageBreakdownRow = {
	readonly key: string;
	/** The config itself, not its label — the ledger renders it as a `ConfigChip`,
	 * so the row needs its rarity and description too. */
	readonly config: Config;
	readonly kb: number;
};

export type StorageBreakdown = {
	readonly baseKb: number;
	readonly rows: readonly StorageBreakdownRow[];
	readonly totalKb: number;
};

/** The pots a cleared gate pays from, each already priced by the reducer. */
type StoragePots = {
	readonly faucetKb: number;
	readonly interestKb: number;
	readonly extraPickKb: number;
};

type ConfigWeight = (config: Config) => number;

const perCorrectWeight: ConfigWeight = (config) =>
	config.storagePerCorrect ?? 0;
const perExtraPickWeight: ConfigWeight = (config) =>
	config.storagePerExtraPick ?? 0;

/**
 * One config's cut of a pot the reducer paid as a lump sum. The pots are capped
 * and rounded upstream (the faucet stops at its per-run cap, interest floors),
 * so they cannot be recomputed here without disagreeing with the balance — each
 * config takes the share its own rate earned instead. With one config drawing on
 * a pot, which is today's roster everywhere, the share is the whole pot.
 */
const shareOf = (
	config: Config,
	configs: readonly Config[],
	weight: ConfigWeight,
	potKb: number
): number => {
	const total = configs.reduce((sum, entry) => sum + weight(entry), 0);
	return total === 0 ? 0 : Math.round((potKb * weight(config)) / total);
};

/**
 * Every KB this config put on the board this gate, across all four sources it
 * could pay from. Summed into one figure because the ledger gives a config one
 * row: the player asks "what did IndexedDB earn me", not "what did IndexedDB
 * earn me per mechanism".
 */
const configStorageKb = (
	config: Config,
	configs: readonly Config[],
	pots: StoragePots
): number =>
	(effectOf(config).storageOnClear ?? 0) +
	shareOf(config, configs, perCorrectWeight, pots.faucetKb) +
	shareOf(config, configs, interestPctOf, pots.interestKb) +
	shareOf(config, configs, perExtraPickWeight, pots.extraPickKb);

type StorageBreakdownInput = {
	readonly configs: readonly Config[];
	readonly answered: readonly AnsweredPoll[];
	readonly gateReward: number;
	readonly faucetThisGateKb?: number;
	readonly interestThisGateKb?: number;
	readonly extraPickThisGateKb?: number;
};

/**
 * The clear's storage ledger: what the gate paid on its own, what each config
 * added, and the total — which is by construction the headline figure above it.
 *
 * The base is derived by subtraction rather than recomputed from
 * `gateClearPayout`. Recomputing would put a second implementation of the payout
 * math on screen, free to disagree with the KB actually banked; subtracting
 * guarantees the column adds up, and any source not itemized here lands in the
 * base instead of vanishing from a total the player can check against the number
 * above it.
 */
export const gateStorageBreakdown = ({
	configs,
	answered,
	gateReward,
	faucetThisGateKb,
	interestThisGateKb = 0,
	extraPickThisGateKb = 0,
}: StorageBreakdownInput): StorageBreakdown => {
	const totalKb = gateStorageGained(
		configs,
		answered,
		gateReward,
		faucetThisGateKb
	);
	const pots: StoragePots = {
		faucetKb:
			faucetThisGateKb ?? faucetKbPerCorrect(configs) * correctCount(answered),
		interestKb: interestThisGateKb,
		extraPickKb: extraPickThisGateKb,
	};
	const rows = configs
		.map((config) => ({
			key: config.id,
			config,
			kb: configStorageKb(config, configs, pots),
		}))
		.filter((row) => row.kb > 0);

	return {
		baseKb: totalKb - rows.reduce((sum, row) => sum + row.kb, 0),
		rows,
		totalKb,
	};
};

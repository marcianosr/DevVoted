import type { CategoryCode } from "~/shared/lib/categories";
import type { AnsweredPoll } from "~/modules/run/run/domain/run.model";
import {
	Config,
	describeConfig,
	faucetKbPerCorrect,
} from "~/modules/run/config/domain/config.model";
import {
	type CheckStatus,
	touchesCoverage,
} from "~/modules/run/config/domain/effect.model";
import { roundToOneDecimal } from "~/modules/run/run/domain/rules.model";
import {
	gateRowDescription,
	roleOf,
} from "~/modules/run/gate/domain/configRole.model";

/**
 * The gate screen reads like a CI run: one row per pipeline config, each with a
 * passed/skipped/failed status, its roster description, and the coverage or
 * storage it produced this gate — attributed from the run's own data. Shared by
 * the cleared screen and the failed screen; this model owns the attribution.
 */
export type GateRewardKind = "coverage" | "storage" | "check";
export type GateRewardStatus = "passed" | "skipped" | "failed";

export type GateRewardRow = {
	readonly key: string;
	readonly config: Config;
	readonly description: string;
	readonly value: string;
	readonly kind: GateRewardKind;
	readonly status: GateRewardStatus;
};

const signedPercent = (value: number): string =>
	`${value < 0 ? "" : "+"}${value}%`;

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

/** Net coverage a category swung this gate — negative when its polls were missed. */
const netCategoryCoverage = (
	category: CategoryCode,
	answered: readonly AnsweredPoll[]
): number =>
	roundToOneDecimal(
		inCategory(category, answered).reduce((sum, poll) => {
			const parts = poll.coverageBreakdown;
			if (!parts) return sum;
			const bonuses = parts.configBonuses.reduce((a, b) => a + b.value, 0);
			return sum + parts.base + parts.streakBonus + bonuses;
		}, 0)
	);

const focusRow = (
	config: Config,
	category: CategoryCode,
	answered: readonly AnsweredPoll[]
): GateRewardRow => {
	const level = config.level ?? 1;
	const matched = inCategory(category, answered);
	const correct = matched.filter((poll) => poll.outcome === "correct").length;
	const base = { key: config.id, config, kind: "coverage" as const };

	if (matched.length === 0)
		return {
			...base,
			status: "skipped",
			description: `no ${category} poll in this gate`,
			value: "—",
		};

	if (correct >= level)
		return {
			...base,
			status: "passed",
			description: describeConfig(config),
			value: signedPercent(coverageContribution(config, answered)),
		};

	return {
		...base,
		status: "failed",
		description: `needs ${level} correct ${category}, got ${correct}`,
		value: signedPercent(netCategoryCoverage(category, answered)),
	};
};

const statusFrom = (check: CheckStatus | undefined): GateRewardStatus => {
	if (check?.state === "failed") return "failed";
	if (check?.state === "skipped") return "skipped";
	// No check at all (AGENTS.md) counts as passed — nothing was demanded.
	return "passed";
};

/**
 * The Config Rule splits every row the same way the engine splits a config:
 * the STATUS comes from its check (found via sourceConfigId), the VALUE and
 * kind come from its benefit. Focus rows keep their richer per-category copy.
 */
const rowFor = (
	config: Config,
	answered: readonly AnsweredPoll[],
	checks: readonly CheckStatus[],
	faucetThisGateKb?: number
): GateRewardRow => {
	if (config.focusCategory !== undefined)
		return focusRow(config, config.focusCategory, answered);

	const check = checks.find((entry) => entry.sourceConfigId === config.id);
	const base = {
		key: config.id,
		config,
		status: statusFrom(check),
		description: gateRowDescription(config, roleOf(config, checks), check),
	};

	if (touchesCoverage(config))
		return {
			...base,
			kind: "coverage",
			value: signedPercent(coverageContribution(config, answered)),
		};
	if (config.storagePerCorrect !== undefined)
		return {
			...base,
			kind: "storage",
			// The exact capped faucet income when the engine provides it; the
			// uncapped estimate otherwise (pre-cap snapshots). Attributing the
			// whole gate faucet to this row is safe while one faucet config ships.
			value: `+${faucetThisGateKb ?? (config.storagePerCorrect ?? 0) * correctCount(answered)}KB`,
		};
	// The clear payout only lands on a pass; a failed row shows the unmet
	// progress instead, so the report says what fell short.
	if (config.storageOnClear !== undefined)
		return {
			...base,
			kind: "storage",
			value:
				base.status === "passed"
					? `+${config.storageOnClear}KB`
					: (check?.progress ?? "—"),
		};
	if (check) return { ...base, kind: "check", value: check.progress ?? "" };
	return { ...base, kind: "coverage", value: "" };
};

const KIND_ORDER: Record<GateRewardKind, number> = {
	coverage: 0,
	storage: 1,
	check: 2,
};

type GateRewardInput = {
	readonly answered: readonly AnsweredPoll[];
	readonly configs: readonly Config[];
	readonly checks: readonly CheckStatus[];
	/** Exact faucet income this gate (capped) — omitted by pre-cap callers. */
	readonly faucetThisGateKb?: number;
};

export const gateRewardRows = ({
	answered,
	configs,
	checks,
	faucetThisGateKb,
}: GateRewardInput): readonly GateRewardRow[] =>
	configs
		.map((config) => rowFor(config, answered, checks, faucetThisGateKb))
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

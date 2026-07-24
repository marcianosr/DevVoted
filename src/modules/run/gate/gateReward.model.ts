import type { CategoryCode } from "~/domains/shared/categories";
import type { AnsweredPoll } from "../climb/run.model";
import { Config } from "../configs/config.model";
import type { CheckStatus } from "../configs/effect.model";
import { roundToOneDecimal } from "../rules.model";

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

const isCoverageConfig = (config: Config): boolean =>
	config.focusCategory !== undefined ||
	config.coverageMultiplier !== undefined ||
	config.coverageAdd !== undefined;

const signedPercent = (value: number): string =>
	`${value < 0 ? "" : "+"}${value}%`;

const correctCount = (answered: readonly AnsweredPoll[]): number =>
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
			description: config.description,
			value: signedPercent(coverageContribution(config, answered)),
		};

	return {
		...base,
		status: "failed",
		description: `needs ${level} correct ${category}, got ${correct}`,
		value: signedPercent(netCategoryCoverage(category, answered)),
	};
};

const coverageRow = (
	config: Config,
	answered: readonly AnsweredPoll[]
): GateRewardRow => ({
	key: config.id,
	config,
	kind: "coverage",
	status: "passed",
	description: config.description,
	value: signedPercent(coverageContribution(config, answered)),
});

const storageRow = (
	config: Config,
	answered: readonly AnsweredPoll[]
): GateRewardRow => ({
	key: config.id,
	config,
	kind: "storage",
	status: "passed",
	description: config.description,
	value: `+${(config.storagePerCorrect ?? 0) * correctCount(answered)}KB`,
});

const checkRow = (
	config: Config,
	check: CheckStatus | undefined
): GateRewardRow => ({
	key: config.id,
	config,
	kind: "check",
	status:
		check?.state === "failed"
			? "failed"
			: check?.state === "skipped"
				? "skipped"
				: "passed",
	description: config.description,
	value: check?.progress ?? "—",
});

const rowFor = (
	config: Config,
	answered: readonly AnsweredPoll[],
	checks: readonly CheckStatus[]
): GateRewardRow => {
	if (config.focusCategory !== undefined)
		return focusRow(config, config.focusCategory, answered);
	if (isCoverageConfig(config)) return coverageRow(config, answered);
	if (config.storagePerCorrect !== undefined)
		return storageRow(config, answered);
	if (config.check !== undefined)
		return checkRow(
			config,
			checks.find((entry) => entry.sourceConfigId === config.id)
		);
	return {
		key: config.id,
		config,
		kind: "coverage",
		status: "passed",
		description: config.description,
		value: "",
	};
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
};

export const gateRewardRows = ({
	answered,
	configs,
	checks,
}: GateRewardInput): readonly GateRewardRow[] =>
	configs
		.map((config) => rowFor(config, answered, checks))
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

/** Total storage this gate added: the clear bonus plus every per-correct payout. */
export const gateStorageGained = (
	configs: readonly Config[],
	answered: readonly AnsweredPoll[],
	gateReward: number
): number =>
	gateReward +
	configs.reduce(
		(sum, config) =>
			sum + (config.storagePerCorrect ?? 0) * correctCount(answered),
		0
	);

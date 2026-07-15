import { Config, describeConfig } from "../configs/config.model";
import type { CheckState, CheckStatus } from "../configs/effect.model";

export type ConfigRole = "requirement" | "conditional" | "perk";

/**
 * A config's role in the build, driving the "Review your build" badges:
 * - conditional: a Focus config — its gate check only bites when its category shows.
 * - requirement: backs an always-on gate check (correct count, coverage, cold-start).
 * - perk: an always-on benefit that backs no gate check.
 */
export const roleOf = (
	config: Config,
	checks: readonly CheckStatus[]
): ConfigRole => {
	if (config.focusCategory) return "conditional";
	const backsCheck = checks.some((check) => check.sourceConfigId === config.id);
	return backsCheck ? "requirement" : "perk";
};

export type RoleRow = {
	readonly config: Config;
	readonly role: ConfigRole;
	readonly description: string;
	/** Progress ("0/1") or the muted "not triggered yet" for an unseen conditional. */
	readonly status?: string;
	/** The gate-check state that colors the status; undefined for perks (no check). */
	readonly state?: CheckState;
};

const ROLE_ORDER: Record<ConfigRole, number> = {
	requirement: 0,
	conditional: 1,
	perk: 2,
};

/** One badge row per config, ordered requirement → conditional → perk. */
export const roleRows = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly RoleRow[] =>
	configs
		.map((config): RoleRow => {
			const role = roleOf(config, checks);
			const check = checks.find(
				(candidate) => candidate.sourceConfigId === config.id
			);
			const dormant = role === "conditional" && check?.state === "skipped";
			return {
				config,
				role,
				description: describeConfig(config),
				status: dormant ? "not triggered yet" : check?.progress,
				state: check?.state,
			};
		})
		.sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);

export type StakesRequirement = {
	readonly count: number;
	readonly label: string;
};

/** The fixed correct-answer requirement every gate imposes, for the run-stakes summary. */
export const stakesRequirement = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): StakesRequirement => {
	const correctConfig = configs.find((config) => config.check === "correct");
	const correctCheck = checks.find((check) => check.label === "Correct");
	return {
		count: correctCheck?.target ?? 1,
		label: correctConfig?.label ?? "correct",
	};
};

/**
 * Extra always-on gate requirements beyond the fixed correct-answer one, for the
 * run-stakes summary. Conditional (Focus) checks are excluded — they only bite when
 * their category shows, so they aren't things "every gate needs".
 */
export const extraGateRequirements = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly string[] =>
	checks
		.filter((check) => {
			if (check.label === "Correct") return false;
			const source = configs.find(
				(config) => config.id === check.sourceConfigId
			);
			return !source?.focusCategory;
		})
		.map((check) => check.description ?? check.label);

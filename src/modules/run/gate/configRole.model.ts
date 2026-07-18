import { Config, describeConfig } from "../configs/config.model";
import type { CheckState, CheckStatus } from "../configs/effect.model";

export type ConfigRole = "requirement" | "conditional" | "perk";

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
	readonly status?: string;
	readonly state?: CheckState;
};

const ROLE_ORDER: Record<ConfigRole, number> = {
	requirement: 0,
	conditional: 1,
	perk: 2,
};

/**
 * Requirement rows must state the *escalated* demand the gate actually judges
 * (the check's dynamic description), not the config's static base text —
 * gate 5 requires 3 correct, not the roster's "1 correct answer" (DVTD-7wy6).
 */
const rowDescription = (
	config: Config,
	role: ConfigRole,
	check: CheckStatus | undefined
): string =>
	role === "requirement" && check?.description
		? `Requires ${check.description} to pass the gate.`
		: describeConfig(config);

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
				description: rowDescription(config, role, check),
				status: dormant ? "not triggered yet" : check?.progress,
				state: check?.state,
			};
		})
		.sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);

export type StakesRequirement = {
	readonly count: number;
	readonly label: string;
};

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

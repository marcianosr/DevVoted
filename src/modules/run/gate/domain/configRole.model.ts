import {
	Config,
	describeConfig,
	givesOf,
	needsOf,
} from "~/modules/run/config/domain/config.model";
import type {
	CheckState,
	CheckStatus,
} from "~/modules/run/config/domain/effect.model";

export type ConfigRole = "requirement" | "conditional" | "passive";

export const roleOf = (
	config: Config,
	checks: readonly CheckStatus[]
): ConfigRole => {
	// Conditional, not a requirement: the defeat device demands nothing of the
	// player, it only wakes up once another check has already failed.
	if (
		config.focusCategory ||
		config.eliminatesWrongOptionsFor?.length ||
		config.check === "defeat-device"
	)
		return "conditional";
	const backsCheck = checks.some((check) => check.sourceConfigId === config.id);
	return backsCheck ? "requirement" : "passive";
};

export type RoleRow = {
	readonly config: Config;
	readonly role: ConfigRole;
	readonly description: string;
	readonly gives?: string;
	readonly needs?: string;
	readonly costs?: string;
	readonly status?: string;
	readonly note?: string;
	readonly state?: CheckState;
};

const ROLE_ORDER: Record<ConfigRole, number> = {
	requirement: 0,
	conditional: 1,
	passive: 2,
};

export const gateRowDescription = (
	config: Config,
	role: ConfigRole,
	check: CheckStatus | undefined
): string =>
	role === "requirement" && check?.description
		? `Requires ${check.description} to pass the gate.`
		: describeConfig(config);

// A counter ("0/2", "5%/1%") reads at a glance and sits right as the value;
// prose ("0/2 categories", "steady") is a remark and drops under the description.
const isCounter = (progress: string): boolean => /^[\d/%.]+$/.test(progress);

const progressPlacement = (
	check: CheckStatus | undefined,
	dormant: boolean
): Pick<RoleRow, "status" | "note"> => {
	// The gray dot already says a dormant conditional is skipped — no note,
	// and its "not seen" progress text stays hidden too.
	if (dormant) return {};
	if (!check?.progress) return {};
	if (isCounter(check.progress)) return { status: check.progress };
	return { note: check.progress };
};

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
				description: gateRowDescription(config, role, check),
				gives: givesOf(config),
				needs:
					needsOf(config) ??
					(config.check === "correct" ? check?.description : undefined),
				costs: config.costs,
				...progressPlacement(check, dormant),
				state: check?.state,
			};
		})
		.sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);

export const preRunRoleRows = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly RoleRow[] =>
	roleRows(configs, checks).map((row) => ({
		...row,
		status: undefined,
		note: undefined,
	}));

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
			if (!source) return true;
			// Conditionals (focus mastery, lint pledges) list with their config,
			// not as standing gate demands.
			return roleOf(source, checks) === "requirement";
		})
		.map((check) => check.description ?? check.label);

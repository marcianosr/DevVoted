import type { CategoryCode } from "~/shared/lib/categories";
import {
	Config,
	givesOf,
	needsOf,
} from "~/modules/run/config/domain/config.model";
import type {
	CheckProgress,
	CheckState,
	CheckStatus,
} from "~/modules/run/config/domain/effect.model";

type ConfigRole = "requirement" | "conditional" | "passive";

/**
 * Why a config row reads the way it does. `config` means "show the config's own
 * roster text" and carries no copy of its own; the rest are the screens'
 * sentences, reduced to the facts they are built from.
 */
export type GateRowReason =
	| { readonly kind: "config" }
	| { readonly kind: "gateRequirement"; readonly requirement: string }
	| { readonly kind: "noPollInCategory"; readonly category: CategoryCode }
	| {
			readonly kind: "focusMissed";
			readonly category: CategoryCode;
			readonly needed: number;
			readonly got: number;
	  };

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
	readonly reason: GateRowReason;
	readonly gives?: string;
	readonly needs?: string;
	readonly costs?: string;
	/** Absent when there is nothing to report, or when the row is dormant. */
	readonly progress?: CheckProgress;
	readonly state?: CheckState;
};

const ROLE_ORDER: Record<ConfigRole, number> = {
	requirement: 0,
	conditional: 1,
	passive: 2,
};

/**
 * A requirement row leads with the check it owes the gate; everything else
 * leads with the config's own roster text. Returns which of the two, not the
 * sentence — the screens write that.
 */
export const gateRowReason = (
	role: ConfigRole,
	check: CheckStatus | undefined
): GateRowReason =>
	role === "requirement" && check?.description
		? { kind: "gateRequirement", requirement: check.description }
		: { kind: "config" };

// The gray dot already says a dormant conditional is skipped — no note, and its
// "not seen" progress stays hidden too. Which column the rest reads in is the
// screen's call (`isCounterProgress`), not this model's.
const liveProgress = (
	check: CheckStatus | undefined,
	dormant: boolean
): CheckProgress | undefined => (dormant ? undefined : check?.progress);

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
				reason: gateRowReason(role, check),
				gives: givesOf(config),
				needs:
					needsOf(config) ??
					(config.check === "correct" ? check?.description : undefined),
				costs: config.costs,
				progress: liveProgress(check, dormant),
				state: check?.state,
			};
		})
		.sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);

export const preRunRoleRows = (
	configs: readonly Config[],
	checks: readonly CheckStatus[]
): readonly RoleRow[] =>
	roleRows(configs, checks).map((row) => ({ ...row, progress: undefined }));

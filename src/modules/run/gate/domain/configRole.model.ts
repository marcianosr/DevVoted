import type { CategoryCode } from "~/shared/lib/categories";
import { Config, givesOf } from "~/modules/run/config/domain/config.model";

type ConfigRole = "conditional" | "passive";

/**
 * Why a config row reads the way it does. `config` means "show the config's own
 * roster text" and carries no copy of its own; `noPollInCategory` is the gate
 * report's dormant-Focus sentence, reduced to the fact it is built from.
 */
export type GateRowReason =
	| { readonly kind: "config" }
	| { readonly kind: "noPollInCategory"; readonly category: CategoryCode };

/** Conditional means the effect only fires on matching polls (Focus, linters);
 * everything else is always on. Nothing is a requirement anymore (ADR-035). */
export const roleOf = (config: Config): ConfigRole =>
	config.focusCategory || config.eliminatesWrongOptionsFor?.length
		? "conditional"
		: "passive";

export type RoleRow = {
	readonly config: Config;
	readonly role: ConfigRole;
	readonly reason: GateRowReason;
	readonly gives?: string;
	readonly costs?: string;
};

const ROLE_ORDER: Record<ConfigRole, number> = {
	conditional: 0,
	passive: 1,
};

export const roleRows = (configs: readonly Config[]): readonly RoleRow[] =>
	configs
		.map((config): RoleRow => ({
			config,
			role: roleOf(config),
			reason: { kind: "config" },
			gives: givesOf(config),
			costs: config.costs,
		}))
		.sort((left, right) => ROLE_ORDER[left.role] - ROLE_ORDER[right.role]);

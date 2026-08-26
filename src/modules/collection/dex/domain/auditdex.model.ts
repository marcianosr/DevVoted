import {
	type Audit,
	auditsForGate,
} from "~/modules/run/gate/domain/audit.model";

import type {
	GatedexEntry,
	GatedexState,
} from "~/modules/collection/dex/domain/gatedex.model";

/**
 * The audit roster read as a collection: eleven rules, each with the gates it
 * sits on and how much of it the player has earned the right to read.
 *
 * Deduped on name, never on id — the run model emits `timeout-3/4/5` and
 * `strip-1/2` because the figures differ per gate, and counting ids would tell
 * a player their catalogue holds fourteen entries when it holds eleven.
 */
export type AuditdexTier = "faced" | "unlocked" | "unseen";

export type AuditdexEntry = {
	/** The model's id at the audit's first appearance — `timeout-3`, not
	 * `timeout`. The kit collapses the suffix to pick an icon; the domain keeps
	 * it so a row can be traced back to the gate it was read off. */
	readonly id: string;
	readonly name: string;
	readonly rule: string;
	readonly gates: readonly number[];
	readonly tier: AuditdexTier;
};

type AuditFacts = Omit<AuditdexEntry, "tier">;

const factsOf = (gate: number, audit: Audit): AuditFacts => ({
	id: audit.id,
	name: audit.name,
	rule: audit.dexRule ?? audit.description,
	gates: [gate],
});

const withAppearance = (
	roster: readonly AuditFacts[],
	gate: number,
	audit: Audit
): readonly AuditFacts[] => {
	const known = roster.find((entry) => entry.name === audit.name);
	if (!known) return [...roster, factsOf(gate, audit)];

	return roster.map((entry) =>
		entry === known ? { ...entry, gates: [...entry.gates, gate] } : entry
	);
};

/** Roster order is the ladder's: an audit sits where it is first met. */
const rosterFor = (gates: readonly GatedexEntry[]): readonly AuditFacts[] =>
	gates
		.flatMap((entry) =>
			auditsForGate(entry.gate).map((audit) => ({ gate: entry.gate, audit }))
		)
		.reduce<readonly AuditFacts[]>(
			(roster, { gate, audit }) => withAppearance(roster, gate, audit),
			[]
		);

/**
 * Faced means the gate carrying it has fallen; unlocked means that gate is the
 * one in front of you, so its stake receipt has named the rule. Nothing is
 * spoiled that the player has not already stood in front of, which is why an
 * audit on two gates reads off whichever of them they have reached.
 */
const tierFor = (
	gates: readonly number[],
	stateByGate: ReadonlyMap<number, GatedexState>
): AuditdexTier => {
	if (gates.some((gate) => stateByGate.get(gate) === "cleared")) return "faced";
	return gates.some((gate) => stateByGate.get(gate) === "next")
		? "unlocked"
		: "unseen";
};

export const auditdex = (
	gates: readonly GatedexEntry[]
): readonly AuditdexEntry[] => {
	const stateByGate = new Map(gates.map((entry) => [entry.gate, entry.state]));

	return rosterFor(gates).map((facts) => ({
		...facts,
		tier: tierFor(facts.gates, stateByGate),
	}));
};

export const auditsFacedIn = (entries: readonly AuditdexEntry[]): number =>
	entries.filter((entry) => entry.tier === "faced").length;

/**
 * The audits a player may read the name of anywhere in the Dex. Keyed on name
 * rather than on gate, which is what keeps the two tabs from disagreeing: an
 * audit met at gate 7 stays named on gate 11's row, even though that gate is
 * still locked.
 */
export const revealedAuditNames = (
	entries: readonly AuditdexEntry[]
): ReadonlySet<string> =>
	new Set(
		entries
			.filter((entry) => entry.tier !== "unseen")
			.map((entry) => entry.name)
	);

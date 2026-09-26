import {
	type AuditId,
	auditAt,
	auditLabel,
} from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_RANK,
	appearsAtGates,
} from "~/modules/run/gate/domain/auditSchedule.model";

import type {
	GatedexEntry,
	GatedexState,
} from "~/modules/collection/dex/domain/gatedex.model";

export type AuditdexTier = "faced" | "unlocked" | "unseen";

export type AuditdexEntry = {
	readonly id: AuditId;
	readonly code: number;
	readonly title: string;
	readonly name: string;
	readonly rule: string;
	readonly gates: readonly number[];
	readonly tier: AuditdexTier;
};

type AuditFacts = Omit<AuditdexEntry, "tier">;

const factsOf = (id: AuditId): AuditFacts => {
	const gates = appearsAtGates(id);
	const audit = auditAt(id, gates[0]);
	return {
		id,
		code: audit.code,
		title: audit.name,
		name: auditLabel(audit),
		rule: audit.dexRule ?? audit.description,
		gates,
	};
};

const firstGateOf = (facts: AuditFacts): number => facts.gates[0];

const ROSTER: readonly AuditFacts[] = AUDIT_RANK.map(factsOf)
	.map((facts, rank) => ({ facts, rank }))
	.sort(
		(a, b) => firstGateOf(a.facts) - firstGateOf(b.facts) || a.rank - b.rank
	)
	.map((ranked) => ranked.facts);

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

	return ROSTER.map((facts) => ({
		...facts,
		tier: tierFor(facts.gates, stateByGate),
	}));
};

export const auditsFacedIn = (entries: readonly AuditdexEntry[]): number =>
	entries.filter((entry) => entry.tier === "faced").length;

export const revealedAuditNames = (
	entries: readonly AuditdexEntry[]
): ReadonlySet<string> =>
	new Set(
		entries
			.filter((entry) => entry.tier !== "unseen")
			.map((entry) => entry.name)
	);

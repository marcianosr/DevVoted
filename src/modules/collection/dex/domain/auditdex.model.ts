import {
	type AuditId,
	auditAt,
	auditLabel,
} from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_RANK,
	appearsAtGates,
	certainGatesOf,
} from "~/modules/run/gate/domain/auditSchedule.model";

import type {
	GatedexEntry,
	GatedexState,
} from "~/modules/collection/dex/domain/gatedex.model";

/**
 * The audit roster read as a collection: fifteen rules, each with the gates it
 * sits on and how much of it the player has earned the right to read.
 *
 * One row per audit id (ADR-056 made ids canonical, so there is nothing to
 * dedupe). `gates` names where an audit *can* land, not where it did: the
 * roster is drawn per run, so the catalogue teaches the pools. `runsFaced` and
 * `runsBeaten` therefore count only the gates an audit is certain to appear at,
 * and read 0 for a drawn one until something records what a draw dealt
 * (DVTD-gvc9).
 */
export type AuditdexTier = "faced" | "unlocked" | "unseen";

export type AuditdexEntry = {
	readonly id: AuditId;
	readonly name: string;
	readonly rule: string;
	readonly gates: readonly number[];
	readonly tier: AuditdexTier;
	readonly runsFaced: number;
	readonly runsBeaten: number;
};

/** One climb, as far as this tally needs to read it. */
export type AuditdexRun = {
	readonly gatesCleared: number;
	readonly finished: boolean;
};

type AuditFacts = Omit<AuditdexEntry, "tier" | "runsFaced" | "runsBeaten">;

const factsOf = (id: AuditId): AuditFacts => {
	const gates = appearsAtGates(id);
	const audit = auditAt(id, gates[0]);
	return {
		id,
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

/**
 * Gates below this number were played in that climb. A finished climb played
 * the gate it stopped at; a live one is still in front of it.
 */
const facedThrough = (run: AuditdexRun): number =>
	run.finished ? run.gatesCleared + 1 : run.gatesCleared;

const countRuns = (
	runs: readonly AuditdexRun[],
	reached: (run: AuditdexRun) => number,
	gates: readonly number[]
): number =>
	runs.filter((run) => gates.some((gate) => gate < reached(run))).length;

export const auditdex = (
	gates: readonly GatedexEntry[],
	runs: readonly AuditdexRun[] = []
): readonly AuditdexEntry[] => {
	const stateByGate = new Map(gates.map((entry) => [entry.gate, entry.state]));

	return ROSTER.map((facts) => {
		const certain = certainGatesOf(facts.id);
		return {
			...facts,
			tier: tierFor(facts.gates, stateByGate),
			runsFaced: countRuns(runs, facedThrough, certain),
			runsBeaten: countRuns(runs, (run) => run.gatesCleared, certain),
		};
	});
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

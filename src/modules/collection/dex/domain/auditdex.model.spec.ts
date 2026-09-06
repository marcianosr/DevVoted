import { describe, expect, it } from "vitest";

import {
	auditdex,
	auditsFacedIn,
} from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const ROSTER_SIZE = 16;

const clearedUpTo = (gate: number) =>
	gatedex(
		ALL_SWATCHES.filter((swatch) => swatch.gate <= gate).map(
			(swatch) => swatch.id
		)
	);

const auditNamed = (name: string, gate: number) => {
	const entry = auditdex(clearedUpTo(gate)).find(
		(audit) => audit.name === name
	);
	if (!entry) throw new Error(`no auditdex row named ${name}`);
	return entry;
};

// Tallies count only where an audit is certain (ADR-056): 402 at gate 3, 410
// at gates 11-12, and the Champion's three. Gates count from 0, so a climb with
// gatesCleared 4 beat gate 3 and stopped at gate 4.
const climb = (gatesCleared: number, finished = true) => ({
	gatesCleared,
	finished,
});

const tallyOf = (name: string, runs: readonly ReturnType<typeof climb>[]) => {
	const entry = auditdex(gatedex([]), runs).find(
		(audit) => audit.name === name
	);
	if (!entry) throw new Error(`no auditdex row named ${name}`);
	return { faced: entry.runsFaced, beaten: entry.runsBeaten };
};

describe("auditdex tallies", () => {
	it("counts a climb that stopped at the audit's gate as faced but not beaten", () => {
		expect(tallyOf("402 Payment Required", [climb(3)])).toEqual({
			faced: 1,
			beaten: 0,
		});
	});

	it("counts a climb that got past the gate as both faced and beaten", () => {
		expect(tallyOf("402 Payment Required", [climb(4)])).toEqual({
			faced: 1,
			beaten: 1,
		});
	});

	// A live climb standing in front of the gate has not played it yet: the
	// stake receipt names the rule, which is what the "unlocked" tier is for.
	it("leaves a live climb's current gate out of the faced count", () => {
		expect(tallyOf("402 Payment Required", [climb(3, false)])).toEqual({
			faced: 0,
			beaten: 0,
		});
	});

	it("never counts a gate the climb never reached", () => {
		expect(tallyOf("410 Gone", [climb(4), climb(5)])).toEqual({
			faced: 0,
			beaten: 0,
		});
	});

	// 410 is certain at gates 11 and 12; one climb past gate 11 is one climb.
	it("counts a climb once for an audit certain on two gates", () => {
		expect(tallyOf("410 Gone", [climb(12)])).toEqual({
			faced: 1,
			beaten: 1,
		});
	});

	// Nothing records what a draw dealt, so a tally would be a guess.
	it("tallies nothing for a drawn audit, so the panel prints no record", () => {
		expect(tallyOf("404 Not Found", [climb(9), climb(12)])).toEqual({
			faced: 0,
			beaten: 0,
		});
	});

	it("sums across climbs", () => {
		expect(
			tallyOf("402 Payment Required", [climb(3), climb(3), climb(6)])
		).toEqual({ faced: 3, beaten: 1 });
	});

	it("reads zero when no run history is handed over", () => {
		expect(tallyOf("402 Payment Required", [])).toEqual({
			faced: 0,
			beaten: 0,
		});
	});
});

describe("auditdex", () => {
	it("holds one row per audit id", () => {
		expect(auditdex(gatedex([]))).toHaveLength(ROSTER_SIZE);
	});

	it("names every gate an audit can land on, not where it landed", () => {
		expect(auditNamed("410 Gone", 12).gates).toEqual([11, 12]);
		expect(auditNamed("404 Not Found", 12).gates).toEqual([
			4, 5, 6, 7, 8, 9, 10,
		]);
	});

	it("orders the roster by the earliest gate each audit can reach", () => {
		const firstGates = auditdex(gatedex([])).map((audit) => audit.gates[0]);
		expect(firstGates).toEqual([...firstGates].sort((a, b) => a - b));
		expect(auditdex(gatedex([]))[0]?.name).toBe("402 Payment Required");
	});

	it("calls an audit faced once the gate carrying it is cleared", () => {
		expect(auditNamed("402 Payment Required", 3).tier).toBe("faced");
	});

	it("calls the next gate's audit unlocked, so its rule can be read before it bites", () => {
		expect(auditNamed("424 Failed Dependency", 3).tier).toBe("unlocked");
	});

	it("leaves a pool the climb cannot reach yet unseen", () => {
		expect(auditNamed("403 Forbidden", 3).tier).toBe("unseen");
	});

	// Reaching gate 4 puts every pool-A rule on the receipt's shortlist, so the
	// Dex opens the whole pool rather than one row at a time.
	it("opens a band's whole pool once its first gate is in front of you", () => {
		for (const name of [
			"405 Method Not Allowed",
			"507 Insufficient Storage",
			"502 Bad Gateway",
		])
			expect(auditNamed(name, 3).tier).toBe("unlocked");
	});

	it("redacts the whole roster for an account that has cleared nothing", () => {
		expect(
			auditdex(gatedex([])).every((audit) => audit.tier === "unseen")
		).toBe(true);
	});

	it("faces an audit on two bands as soon as the earlier one falls", () => {
		expect(auditNamed("300 Multiple Choices", 9).tier).toBe("faced");
	});

	it("states a varying rule without this gate's own figures", () => {
		// The clock's own description names one gate's seconds, which is a lie on
		// a row covering every gate the audit can be drawn at.
		expect(auditNamed("408 Request Timeout", 12).rule).not.toMatch(/\d/);
		expect(auditNamed("410 Gone", 12).rule).not.toMatch(/\d/);
	});

	it("keeps the gate's own wording where the rule never varies", () => {
		expect(auditNamed("405 Method Not Allowed", 12).rule).toContain("shop");
	});
});

describe("auditsFacedIn", () => {
	it("counts only faced rows, which is the tab's numerator", () => {
		const entries = auditdex(clearedUpTo(4));
		expect(auditsFacedIn(entries)).toBe(
			entries.filter((entry) => entry.tier === "faced").length
		);
		expect(auditsFacedIn(auditdex(gatedex([])))).toBe(0);
	});
});

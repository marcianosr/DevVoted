import { describe, expect, it } from "vitest";

import {
	auditdex,
	auditsFacedIn,
} from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const ROSTER_SIZE = 15;

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

// 402 sits at gate 3, 429 at gate 10. Gates count from 0, so a climb with
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
		expect(tallyOf("429 Too Many Requests", [climb(4), climb(5)])).toEqual({
			faced: 0,
			beaten: 0,
		});
	});

	// 408 sits on gates 8 and 12; one climb past gate 8 is one climb, not two.
	it("counts a climb once for an audit that sits on two gates", () => {
		expect(tallyOf("408 Request Timeout", [climb(9)])).toEqual({
			faced: 1,
			beaten: 1,
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
	it("holds fifteen audits, deduped on name rather than on id", () => {
		// Timeout emits timeout-3/5 and Strip emits strip-10/15; counting ids
		// would report seventeen.
		expect(auditdex(gatedex([]))).toHaveLength(ROSTER_SIZE);
	});

	it("gathers every gate an audit sits on into one row", () => {
		expect(auditNamed("410 Gone", 12).gates).toEqual([11, 12]);
		expect(auditNamed("408 Request Timeout", 12).gates).toEqual([8, 12]);
	});

	it("orders the roster by the gate each audit is first met at", () => {
		expect(auditdex(gatedex([])).map((audit) => audit.name)).toEqual([
			"402 Payment Required",
			"424 Failed Dependency",
			"404 Not Found",
			"405 Method Not Allowed",
			"300 Multiple Choices",
			"408 Request Timeout",
			"502 Bad Gateway",
			"503 Service Unavailable",
			"507 Insufficient Storage",
			"409 Conflict",
			"429 Too Many Requests",
			"410 Gone",
			"426 Upgrade Required",
			"403 Forbidden",
			"413 Payload Too Large",
		]);
	});

	it("calls an audit faced once the gate carrying it is cleared", () => {
		expect(auditNamed("402 Payment Required", 3).tier).toBe("faced");
	});

	it("calls the next gate's audit unlocked, so its rule can be read before it bites", () => {
		expect(auditNamed("424 Failed Dependency", 3).tier).toBe("unlocked");
	});

	it("leaves everything past the next gate unseen", () => {
		expect(auditNamed("405 Method Not Allowed", 3).tier).toBe("unseen");
	});

	it("redacts the whole roster for an account that has cleared nothing", () => {
		expect(
			auditdex(gatedex([])).every((audit) => audit.tier === "unseen")
		).toBe(true);
	});

	it("faces an audit on two gates as soon as the earlier one falls", () => {
		expect(auditNamed("300 Multiple Choices", 7).tier).toBe("faced");
	});

	it("states a varying rule without this gate's own figures", () => {
		// timeout-3's own description says "the first 3 polls on a 30s clock",
		// which is a lie on a row that also covers gates 10 and 12.
		expect(auditNamed("408 Request Timeout", 12).rule).not.toMatch(/\d/);
		expect(auditNamed("410 Gone", 12).rule).not.toMatch(/\d/);
	});

	it("keeps the gate's own wording where the rule never varies", () => {
		expect(auditNamed("405 Method Not Allowed", 12).rule).toContain("shop");
	});
});

describe("auditsFacedIn", () => {
	it("counts only faced rows, which is the tab's numerator", () => {
		expect(auditsFacedIn(auditdex(clearedUpTo(4)))).toBe(2);
	});
});

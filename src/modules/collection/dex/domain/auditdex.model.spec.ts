import { describe, expect, it } from "vitest";

import {
	auditdex,
	auditsFacedIn,
} from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const ROSTER_SIZE = 17;

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

describe("auditdex", () => {
	it("holds one row per audit id", () => {
		expect(auditdex(gatedex([]))).toHaveLength(ROSTER_SIZE);
	});

	it("names every gate an audit can land on, not where it landed", () => {
		expect(auditNamed("410 Gone", 12).gates).toEqual([11, 12]);
		expect(auditNamed("404 Not Found", 12).gates).toEqual([
			3, 4, 5, 6, 7, 8, 9, 10,
		]);
	});

	it("orders the roster by the earliest gate each audit can reach", () => {
		const firstGates = auditdex(gatedex([])).map((audit) => audit.gates[0]);
		expect(firstGates).toEqual([...firstGates].sort((a, b) => a - b));
		expect(auditdex(gatedex([]))[0]?.name).toBe("207 Multi-Status");
	});

	it("calls an audit faced once a gate that can carry it is cleared", () => {
		expect(auditNamed("207 Multi-Status", 3).tier).toBe("faced");
	});

	it("calls the next gate's pool unlocked, so its rules can be read before they bite", () => {
		expect(auditNamed("424 Failed Dependency", 2).tier).toBe("unlocked");
	});

	it("leaves a pool the climb cannot reach yet unseen", () => {
		expect(auditNamed("403 Forbidden", 3).tier).toBe("unseen");
	});

	// Standing in front of gate 3 puts every pool-A rule within a rival's reach,
	// so the Dex opens the whole pool rather than one row at a time.
	it("opens a tier's whole pool once its first gate is in front of you", () => {
		for (const name of [
			"405 Method Not Allowed",
			"507 Insufficient Storage",
			"502 Bad Gateway",
		])
			expect(auditNamed(name, 2).tier).toBe("unlocked");
	});

	it("redacts the whole roster for an account that has cleared nothing", () => {
		expect(
			auditdex(gatedex([])).every((audit) => audit.tier === "unseen")
		).toBe(true);
	});

	it("faces an audit on two tiers as soon as the earlier one falls", () => {
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

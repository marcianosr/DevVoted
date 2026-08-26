import { describe, expect, it } from "vitest";

import {
	auditdex,
	auditsFacedIn,
} from "~/modules/collection/dex/domain/auditdex.model";
import { gatedex } from "~/modules/collection/dex/domain/gatedex.model";
import { ALL_SWATCHES } from "~/modules/run/gate/domain/swatch.model";

const ROSTER_SIZE = 11;

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
	it("holds eleven audits, deduped on name rather than on id", () => {
		// Timeout emits timeout-3/4/5 and Strip emits strip-1/2; counting ids
		// would report fourteen.
		expect(auditdex(gatedex([]))).toHaveLength(ROSTER_SIZE);
	});

	it("gathers every gate an audit sits on into one row", () => {
		expect(auditNamed("Mirror", 12).gates).toEqual([7, 11]);
		expect(auditNamed("Timeout", 12).gates).toEqual([8, 10, 12]);
	});

	it("orders the roster by the gate each audit is first met at", () => {
		expect(auditdex(gatedex([])).map((audit) => audit.name)).toEqual([
			"Cost Overrun",
			"Dependency Outage",
			"Read-only",
			"Feature Freeze",
			"Mirror",
			"Timeout",
			"Flaky Build",
			"Memory Leak",
			"Rolling Outage",
			"Breaking Change",
			"Strip",
		]);
	});

	it("calls an audit faced once the gate carrying it is cleared", () => {
		expect(auditNamed("Cost Overrun", 3).tier).toBe("faced");
	});

	it("calls the next gate's audit unlocked, so its rule can be read before it bites", () => {
		expect(auditNamed("Dependency Outage", 3).tier).toBe("unlocked");
	});

	it("leaves everything past the next gate unseen", () => {
		expect(auditNamed("Read-only", 3).tier).toBe("unseen");
	});

	it("redacts the whole roster for an account that has cleared nothing", () => {
		expect(
			auditdex(gatedex([])).every((audit) => audit.tier === "unseen")
		).toBe(true);
	});

	it("faces an audit on two gates as soon as the earlier one falls", () => {
		expect(auditNamed("Mirror", 7).tier).toBe("faced");
	});

	it("states a varying rule without this gate's own figures", () => {
		// timeout-3's own description says "the first 3 polls on a 30s clock",
		// which is a lie on a row that also covers gates 10 and 12.
		expect(auditNamed("Timeout", 12).rule).not.toMatch(/\d/);
		expect(auditNamed("Strip", 12).rule).not.toMatch(/\d/);
	});

	it("keeps the gate's own wording where the rule never varies", () => {
		expect(auditNamed("Read-only", 12).rule).toContain("shop");
	});
});

describe("auditsFacedIn", () => {
	it("counts only faced rows, which is the tab's numerator", () => {
		expect(auditsFacedIn(auditdex(clearedUpTo(4)))).toBe(2);
	});
});

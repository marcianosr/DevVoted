import { describe, expect, it } from "vitest";

import { AUDIT, AUDIT_ORDER, toAuditId } from "./audits";

describe("toAuditId", () => {
	it("passes through an id the roster already holds", () => {
		expect(toAuditId("cost-overrun")).toBe("cost-overrun");
	});

	// ADR-056 moved the per-gate dial off the id, so the suffixed forms the model
	// used to emit are no longer ids at all.
	it("refuses the suffixed forms the roster no longer emits", () => {
		expect(toAuditId("timeout-3")).toBeNull();
		expect(toAuditId("strip-10")).toBeNull();
		expect(toAuditId("timeout")).toBe("timeout");
		expect(toAuditId("strip")).toBe("strip");
	});

	it("refuses an id the kit cannot draw, rather than guessing one", () => {
		expect(toAuditId("chaos-monkey")).toBeNull();
		expect(toAuditId("")).toBeNull();
	});

	it("resolves every id in the roster to itself", () => {
		for (const id of AUDIT_ORDER) expect(toAuditId(id)).toBe(id);
	});
});

describe("AUDIT", () => {
	it("holds an entry for every id the order lists, and no more", () => {
		expect(Object.keys(AUDIT).sort()).toEqual([...AUDIT_ORDER].sort());
	});
});

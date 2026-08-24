import { describe, expect, it } from "vitest";

import { AUDIT, AUDIT_ORDER, toAuditId } from "./audits";

describe("toAuditId", () => {
	it("passes through an id the roster already holds", () => {
		expect(toAuditId("cost-overrun")).toBe("cost-overrun");
	});

	// The model needs the number (timeout-3 and timeout-5 are different clocks);
	// the player sees one Timeout.
	it("collapses the per-gate variants onto their one player-facing entry", () => {
		expect(toAuditId("timeout-3")).toBe("timeout");
		expect(toAuditId("timeout-5")).toBe("timeout");
		expect(toAuditId("strip-1")).toBe("strip");
		expect(toAuditId("strip-2")).toBe("strip");
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

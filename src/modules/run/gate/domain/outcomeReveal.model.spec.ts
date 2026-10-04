import { describe, expect, it } from "vitest";

import { revealKindOf } from "~/modules/run/gate/domain/outcomeReveal.model";

describe("revealKindOf", () => {
	it("plays a clear for a gate cleared on HEALTHY", () => {
		expect(revealKindOf({ closing: "cleared", band: "healthy" })).toBe(
			"cleared"
		);
	});

	it("plays a clear for a gate cleared on OK", () => {
		expect(revealKindOf({ closing: "cleared", band: "ok" })).toBe("cleared");
	});

	it("plays perfect for a gate cleared on PERFECT", () => {
		expect(revealKindOf({ closing: "cleared", band: "perfect" })).toBe(
			"perfect"
		);
	});

	it("plays shaky for a gate held by the meter", () => {
		expect(
			revealKindOf({ closing: "held", band: "shaky", heldBy: "band" })
		).toBe("shaky");
	});

	it("plays shaky for a gate held because the window went unscored", () => {
		expect(
			revealKindOf({ closing: "held", band: "ok", heldBy: "unscored" })
		).toBe("shaky");
	});

	it("plays the catch for a run-ending gate a catcher held", () => {
		expect(
			revealKindOf({ closing: "held", band: "danger", heldBy: "catch" })
		).toBe("caught");
	});

	it("plays the end for a fatal close", () => {
		expect(revealKindOf({ closing: "fatal", band: "danger" })).toBe("ended");
	});
});

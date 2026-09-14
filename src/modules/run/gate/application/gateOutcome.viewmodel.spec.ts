import { describe, expect, it } from "vitest";

import { closedBarFor } from "~/modules/run/gate/application/gateOutcome.viewmodel";

const GATE_0_LADDER = { floor: 0, ok: 20, healthy: 20 };
const GATE_4_LADDER = { floor: 5, ok: 15, healthy: 25 };

describe("closedBarFor", () => {
	it("leaves a genuine clear's reading untouched", () => {
		expect(closedBarFor("cleared", GATE_4_LADDER, 30).held).toBe(30);
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).toBe(100);
	});

	it("never lifts a flawless opening gate onto its healthy line", () => {
		expect(closedBarFor("cleared", GATE_0_LADDER, 100).held).not.toBe(
			GATE_0_LADDER.healthy
		);
	});

	it("holds a missed gate inside the band its verdict names", () => {
		expect(closedBarFor("held", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.ok
		);
		expect(closedBarFor("fatal", GATE_4_LADDER, 30).held).toBeLessThan(
			GATE_4_LADDER.floor
		);
	});
});

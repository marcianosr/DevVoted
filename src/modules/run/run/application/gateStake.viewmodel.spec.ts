import { describe, expect, it } from "vitest";

import { upcomingAuditFor } from "~/modules/run/run/application/gateStake.viewmodel";

describe("upcomingAuditFor", () => {
	it("foreshadows gate 3's Cost Overrun on every clean opening gate", () => {
		for (const gate of [0, 1, 2]) {
			expect(upcomingAuditFor(gate)).toEqual({
				gateNumber: 3,
				name: "Cost Overrun",
				description: expect.stringContaining("paid action"),
			});
		}
	});

	it("stays silent on a gate that runs its own audits", () => {
		expect(upcomingAuditFor(3)).toBeUndefined();
		expect(upcomingAuditFor(12)).toBeUndefined();
	});
});

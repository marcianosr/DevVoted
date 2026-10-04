import { describe, expect, it } from "vitest";

import { unlockLinesFor } from "~/modules/run/run/application/unlockNotes.viewmodel";

describe(unlockLinesFor, () => {
	it("maps a grant to its config and authored provenance", () => {
		const lines = unlockLinesFor([
			{ configId: "telemetry", viaMetric: "community-peeks" },
		]);
		expect(lines).toHaveLength(1);
		expect(lines[0].config.label).toBe("Telemetry");
		expect(lines[0].detail).toBe("Earned: peeked the community split 5 times");
	});

	it("drops an unknown config id instead of throwing", () => {
		expect(
			unlockLinesFor([{ configId: "missingno", viaMetric: null }])
		).toEqual([]);
	});
});

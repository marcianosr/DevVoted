import { describe, expect, it } from "vitest";

import { navRunFor } from "~/modules/run/run/application/navRun.viewmodel";
import { createMockRunView } from "~/test/runView.factory";

describe("navRunFor", () => {
	it("hands the nav nothing while there is no run", () => {
		expect(navRunFor(null)).toBeUndefined();
		expect(navRunFor(undefined)).toBeUndefined();
	});

	it("reads the run's balance and marks the gate underway on the track", () => {
		const view = createMockRunView({ storage: 662 });

		const reading = navRunFor(view);

		expect(reading?.funds?.kb).toBe(662);
		expect(reading?.swatches).toHaveLength(13);
		expect(reading?.swatches[view.gateStake.gateNumber].state).toBe("current");
	});
});

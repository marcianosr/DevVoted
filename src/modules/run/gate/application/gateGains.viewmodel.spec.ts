import { describe, expect, it } from "vitest";

import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { gainsOfGate } from "~/modules/run/gate/application/gateGains.viewmodel";
import { createMockRunView } from "~/test/runView.factory";

const PEWTER = 1;

describe("gainsOfGate", () => {
	it("lists the configs and titles recorded on the gate's close, a title with how it was earned", () => {
		const view = createMockRunView({
			unlockedThisRun: [{ configId: CONFIGS.coldStart.id, viaMetric: null }],
			closes: [
				{
					gate: PEWTER,
					band: "healthy",
					cleared: true,
					kb: 19,
					unlockedConfigIds: [CONFIGS.coldStart.id],
					earnedTitleIds: ["title-answered-css"],
				},
			],
		});

		const { unlocked, titles } = gainsOfGate(view, PEWTER);

		expect(unlocked.map((row) => row.config.id)).toEqual([
			CONFIGS.coldStart.id,
		]);
		expect(titles).toEqual([
			{ name: "CSS Carrier", detail: "50 distinct CSS polls answered" },
		]);
	});

	it("reads the last close of a retried gate", () => {
		const view = createMockRunView({
			closes: [
				{ gate: PEWTER, band: "shaky", cleared: false, kb: 0 },
				{
					gate: PEWTER,
					band: "healthy",
					cleared: true,
					kb: 19,
					earnedTitleIds: ["title-answered-css"],
				},
			],
		});

		expect(gainsOfGate(view, PEWTER).titles).toHaveLength(1);
	});

	it("finds nothing for a gate whose close recorded no gains", () => {
		const view = createMockRunView({
			closes: [{ gate: PEWTER, band: "healthy", cleared: true, kb: 19 }],
		});

		expect(gainsOfGate(view, PEWTER)).toEqual({ unlocked: [], titles: [] });
	});
});

import { describe, expect, it } from "vitest";

import { Build } from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import {
	EMPTY_WINDOW,
	GateWindow,
} from "~/modules/run/config/domain/effect.model";
import { coverageDemandFor } from "~/modules/run/run/domain/rules.model";
import { gatePassed } from "~/modules/run/gate/domain/gate.model";

const buildWith = (configs: Config[]): Build => ({
	id: "build",
	slots: 5,
	configs,
});
const win = (partial: Partial<GateWindow>): GateWindow => ({
	...EMPTY_WINDOW,
	...partial,
});

describe("gatePassed (ADR-035)", () => {
	it("passes when the window meter meets the gate's own demand", () => {
		const demand = coverageDemandFor(0);
		expect(
			gatePassed(
				buildWith([CONFIGS.js]),
				win({ answered: 5, coverageGained: demand }),
				0
			)
		).toBe(true);
	});

	it("fails when the meter falls short, whatever the run's career total was", () => {
		const demand = coverageDemandFor(2);
		expect(
			gatePassed(
				buildWith([CONFIGS.js]),
				win({ answered: 5, coverageGained: demand - 0.1 }),
				2
			)
		).toBe(false);
	});

	it("grades every gate against its own row of the table", () => {
		const meter = coverageDemandFor(1);
		const build = buildWith([CONFIGS.js]);
		expect(
			gatePassed(build, win({ answered: 5, coverageGained: meter }), 1)
		).toBe(true);
		expect(
			gatePassed(build, win({ answered: 5, coverageGained: meter }), 2)
		).toBe(false);
	});

	it("never clears a bare build — free redo would soft-lock it forever", () => {
		expect(
			gatePassed(buildWith([]), win({ answered: 5, coverageGained: 999 }), 0)
		).toBe(false);
	});
});

describe("the roster owes the gate nothing (ADR-035 inverts ADR-022)", () => {
	it("no config carries a demand — the friction is the gate's", () => {
		CONFIG_LIST.forEach((config) => {
			expect(config).not.toHaveProperty("check");
			expect(config).not.toHaveProperty("checkAmount");
			expect(config).not.toHaveProperty("needs");
		});
	});
});

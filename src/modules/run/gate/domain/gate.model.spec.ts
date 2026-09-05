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
import { DEFAULT_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gatePassed,
	peelConfigRangeFor,
} from "~/modules/run/gate/domain/gate.model";

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
				0,
				DEFAULT_AUDIT_SCHEDULE
			)
		).toBe(true);
	});

	it("fails when the meter falls short, whatever the run's career total was", () => {
		const demand = coverageDemandFor(2);
		expect(
			gatePassed(
				buildWith([CONFIGS.js]),
				win({ answered: 5, coverageGained: demand - 0.1 }),
				2,
				DEFAULT_AUDIT_SCHEDULE
			)
		).toBe(false);
	});

	it("grades every gate against its own row of the table", () => {
		const meter = coverageDemandFor(1);
		const build = buildWith([CONFIGS.js]);
		expect(
			gatePassed(
				build,
				win({ answered: 5, coverageGained: meter }),
				1,
				DEFAULT_AUDIT_SCHEDULE
			)
		).toBe(true);
		expect(
			gatePassed(
				build,
				win({ answered: 5, coverageGained: meter }),
				2,
				DEFAULT_AUDIT_SCHEDULE
			)
		).toBe(false);
	});

	it("never clears a bare build — free redo would soft-lock it forever", () => {
		expect(
			gatePassed(
				buildWith([]),
				win({ answered: 5, coverageGained: 999 }),
				0,
				DEFAULT_AUDIT_SCHEDULE
			)
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

describe("the peel quota read as a number of configs", () => {
	it("names one config when the build is all ones", () => {
		expect(peelConfigRangeFor([CONFIGS.yarnLock, CONFIGS.yarnLock], 1)).toEqual(
			{ fewest: 1, most: 1 }
		);
	});

	it("spreads when the sizes differ, because the player picks which go", () => {
		expect(
			peelConfigRangeFor(
				[CONFIGS.agentsMd, CONFIGS.coldStart, CONFIGS.yarnLock],
				4
			)
		).toEqual({ fewest: 1, most: 3 });
	});

	it("counts one config for a quota smaller than that config", () => {
		expect(peelConfigRangeFor([CONFIGS.agentsMd], 2)).toEqual({
			fewest: 1,
			most: 1,
		});
	});

	it("takes nothing when nothing is owed", () => {
		expect(peelConfigRangeFor([CONFIGS.agentsMd], 0)).toEqual({
			fewest: 0,
			most: 0,
		});
	});

	it("stops at the build when the quota outruns it — the fatal miss", () => {
		expect(peelConfigRangeFor([CONFIGS.yarnLock], 4)).toEqual({
			fewest: 1,
			most: 1,
		});
	});
});

import { describe, expect, it } from "vitest";

import {
	Build,
	type PerAnswerPreview,
	projectorFor,
} from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import {
	EMPTY_WINDOW,
	GateWindow,
	touchesCoverage,
} from "~/modules/run/config/domain/effect.model";
import { coverageDemandFor } from "~/modules/run/run/domain/rules.model";
import { DEFAULT_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/auditSchedule.model";
import {
	gatePassed,
	gateProjectionFor,
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

const previewOf = (
	partial: Partial<PerAnswerPreview> = {}
): PerAnswerPreview => ({
	coveragePerCorrect: 12,
	coveragePerWrong: -6,
	storageKbPerCorrect: 0,
	streakStepMultiplier: 1,
	streakCapMultiplier: 1,
	...partial,
});

describe("gateProjectionFor (Dry Run)", () => {
	it("lands a right answer above where the run stands", () => {
		const projection = gateProjectionFor(50, previewOf(), 60);

		expect(projection.pass).toBe(62);
		expect(projection.passClears).toBe(true);
	});

	it("lands a wrong answer below it, since the loss is already signed", () => {
		const projection = gateProjectionFor(50, previewOf(), 60);

		expect(projection.miss).toBe(44);
		expect(projection.missClears).toBe(false);
	});

	it("floors a miss at zero, the way closing the window does", () => {
		const projection = gateProjectionFor(
			2,
			previewOf({ coveragePerWrong: -9 }),
			60
		);

		expect(projection.miss).toBe(0);
	});

	it("says a miss still clears when the meter is already past the demand", () => {
		const projection = gateProjectionFor(70, previewOf(), 60);

		expect(projection.missClears).toBe(true);
		expect(projection.passClears).toBe(true);
	});

	it("clears on meeting the demand exactly, not only on beating it", () => {
		const projection = gateProjectionFor(48, previewOf(), 60);

		expect(projection.pass).toBe(60);
		expect(projection.passClears).toBe(true);
	});

	it("rounds both marks to one decimal, as the meter does", () => {
		const projection = gateProjectionFor(
			10.05,
			previewOf({ coveragePerCorrect: 0.1, coveragePerWrong: -0.1 }),
			60
		);

		expect(projection.pass).toBe(10.2);
		expect(projection.miss).toBe(10);
	});

	it("carries the demand and the standing meter through untouched", () => {
		const projection = gateProjectionFor(33.3, previewOf(), 60);

		expect(projection.held).toBe(33.3);
		expect(projection.demand).toBe(60);
	});
});

describe("Dry Run in the roster", () => {
	it("is found by projectorFor when installed, and only then", () => {
		expect(projectorFor([CONFIGS.dryRun])).toBe(CONFIGS.dryRun);
		expect(projectorFor([CONFIGS.js, CONFIGS.indexedDb])).toBeUndefined();
	});

	it("is the roster's only projector, so the reading can never double", () => {
		const projectors = CONFIG_LIST.filter(
			(config) => config.projectsGateOutcome === true
		);

		expect(projectors).toHaveLength(1);
	});

	it("sits last in the roster, since fixtures slice it positionally", () => {
		expect(CONFIG_LIST.at(-1)).toBe(CONFIGS.dryRun);
	});

	it("sells information rather than coverage, so it stacks with anything", () => {
		expect(CONFIGS.dryRun.rewardMultiplier).toBe(1);
		expect(touchesCoverage(CONFIGS.dryRun)).toBe(false);
	});
});

import { describe, expect, it } from "vitest";

import type { PerAnswerPreview } from "~/modules/run/build/domain/answerPayout.model";
import { Build, projectorFor } from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";
import {
	floorAt,
	healthyAt,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	FLOOR_CORRECT,
	SLICE_WINDOW,
} from "~/modules/run/run/domain/rules.model";
import { EMPTY_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/audit.model";
import {
	type GateClose,
	gateClosingFor,
	gatePassed,
	gateRulingFor,
	gateProjectionFor,
	peelConfigRangeFor,
} from "~/modules/run/gate/domain/gate.model";

const buildWith = (configs: Config[]): Build => ({
	id: "build",
	configs,
});
/** Units that land the run exactly on `ratio` when this gate shuts. */
const unitsFor = (ratio: number, gate: number): number =>
	ratio * scoringSlotsAt(gate);

const closing = (partial: Partial<GateClose>): GateClose => ({
	build: buildWith([CONFIGS.js]),
	bankedUnits: 0,
	unitsThisGate: 0,
	correctThisGate: SLICE_WINDOW,
	gatesCleared: 0,
	schedule: EMPTY_AUDIT_SCHEDULE,
	...partial,
});

describe("the gate closes on the run, not on its own five answers", () => {
	it("clears when the run score meets the gate's demand", () => {
		expect(
			gatePassed(
				closing({ gatesCleared: 4, unitsThisGate: unitsFor(healthyAt(4), 4) })
			)
		).toBe(true);
	});

	it("holds when the run score falls short", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 4,
					unitsThisGate: unitsFor(floorAt(4), 4),
					correctThisGate: 3,
				})
			)
		).toBe("held");
	});

	it("ends the run under the floor", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 4,
					unitsThisGate: unitsFor(floorAt(4) - 0.05, 4),
					correctThisGate: 3,
				})
			)
		).toBe("fatal");
	});

	it("counts the gates behind it, so history carries the close", () => {
		const banked = unitsFor(healthyAt(9), 9) - SLICE_WINDOW;

		expect(gatePassed(closing({ gatesCleared: 9, bankedUnits: banked }))).toBe(
			false
		);
		expect(
			gatePassed(
				closing({
					gatesCleared: 9,
					bankedUnits: banked,
					unitsThisGate: SLICE_WINDOW,
				})
			)
		).toBe(true);
	});

	it("grades every gate against its own row of the table", () => {
		const units = unitsFor(healthyAt(1), 1);

		expect(gatePassed(closing({ gatesCleared: 1, unitsThisGate: units }))).toBe(
			true
		);
		expect(gatePassed(closing({ gatesCleared: 2, unitsThisGate: units }))).toBe(
			false
		);
	});

	it("never clears a bare build — free redo would soft-lock it forever", () => {
		expect(
			gatePassed(closing({ build: buildWith([]), unitsThisGate: 999 }))
		).toBe(false);
	});
});

describe("a flawless gate is never fatal", () => {
	it("holds instead of killing when the run score sits under the floor", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 9,
					bankedUnits: 27,
					unitsThisGate: SLICE_WINDOW,
					correctThisGate: SLICE_WINDOW,
				})
			)
		).toBe("held");
	});

	it("still kills a gate that was not flawless from the same position", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 9,
					bankedUnits: 27,
					unitsThisGate: 4,
					correctThisGate: 4,
				})
			)
		).toBe("fatal");
	});
});

describe("the floor rule", () => {
	it("holds a gate that answered fewer than the floor, however good the run reads", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 5,
					bankedUnits: unitsFor(1, 4),
					unitsThisGate: 0,
					correctThisGate: 0,
				})
			)
		).toBe("held");
	});

	it("clears the same gate once the floor is met", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 5,
					bankedUnits: unitsFor(1, 4),
					unitsThisGate: FLOOR_CORRECT,
					correctThisGate: FLOOR_CORRECT,
				})
			)
		).toBe("cleared");
	});

	it("counts right answers before multipliers, so a big build cannot buy past it", () => {
		expect(
			gateClosingFor(
				closing({
					build: buildWith([CONFIGS.agentsMd]),
					gatesCleared: 5,
					bankedUnits: unitsFor(1, 4),
					unitsThisGate: 2 * (FLOOR_CORRECT - 1),
					correctThisGate: FLOOR_CORRECT - 1,
				})
			)
		).toBe("held");
	});

	it("names the floor as the reason, so the debrief can say it", () => {
		expect(
			gateRulingFor(
				closing({
					gatesCleared: 5,
					bankedUnits: unitsFor(1, 4),
					unitsThisGate: 0,
					correctThisGate: 0,
				})
			)
		).toEqual({ closing: "held", heldBy: "floor" });
	});

	it("names the band when the meter itself fell short", () => {
		expect(
			gateRulingFor(
				closing({
					gatesCleared: 4,
					unitsThisGate: unitsFor(floorAt(4), 4),
					correctThisGate: 4,
				})
			)
		).toEqual({ closing: "held", heldBy: "band" });
	});

	it("names a bare build, which never clears", () => {
		expect(
			gateRulingFor(
				closing({ build: buildWith([]), unitsThisGate: unitsFor(1, 0) })
			)
		).toEqual({ closing: "held", heldBy: "bare" });
	});

	it("never saves a DANGER close: under the floor with too few right is still fatal", () => {
		expect(
			gateRulingFor(
				closing({
					gatesCleared: 4,
					unitsThisGate: unitsFor(floorAt(4), 4) - 1,
					correctThisGate: 0,
				})
			)
		).toEqual({ closing: "fatal" });
	});

	it("carries a clear with nothing more to say", () => {
		expect(
			gateRulingFor(
				closing({ gatesCleared: 4, unitsThisGate: unitsFor(healthyAt(4), 4) })
			)
		).toEqual({ closing: "cleared" });
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
	...partial,
});

describe("gateProjectionFor (Dry Run)", () => {
	const GATE = 4;

	const PAYS_TWO = previewOf({ coveragePerCorrect: 2 });

	it("lands a right answer above where the run stands", () => {
		const projection = gateProjectionFor(10, PAYS_TWO, GATE, 50);

		expect(projection.held).toBe(40);
		expect(projection.pass).toBe(48);
		expect(projection.passClears).toBe(false);
	});

	/**
	 * The gate's slot count is already fixed, so a miss earns nothing and
	 * subtracts nothing. Its cost is the gain it forfeits.
	 */
	it("leaves a wrong answer exactly where the run already stands", () => {
		const projection = gateProjectionFor(10, PAYS_TWO, GATE, 50);

		expect(projection.miss).toBe(projection.held);
		expect(projection.missClears).toBe(false);
	});

	it("says a miss still clears when the run is already past the demand", () => {
		const projection = gateProjectionFor(14, PAYS_TWO, GATE, 50);

		expect(projection.missClears).toBe(true);
		expect(projection.passClears).toBe(true);
	});

	it("clears on meeting the demand exactly, not only on beating it", () => {
		const projection = gateProjectionFor(
			11.5,
			previewOf({ coveragePerCorrect: 1 }),
			GATE,
			50
		);

		expect(projection.pass).toBe(50);
		expect(projection.passClears).toBe(true);
	});

	it("never reads past a full bar", () => {
		const projection = gateProjectionFor(
			24,
			previewOf({ coveragePerCorrect: 8 }),
			GATE,
			50
		);

		expect(projection.pass).toBe(100);
	});

	it("carries the demand through untouched", () => {
		expect(gateProjectionFor(10, PAYS_TWO, GATE, 50).demand).toBe(50);
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
		expect(touchesCoverage(CONFIGS.dryRun)).toBe(false);
	});
});

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
	okAt,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	MIN_WINDOW_UNITS,
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { EMPTY_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/audit.model";
import {
	baseGateLadderAt,
	clearsAt,
	type GateClose,
	gateClosingFor,
	gateLadderFor,
	gatePassed,
	gateRulingFor,
	gateProjectionFor,
	peelConfigRangeFor,
} from "~/modules/run/gate/domain/gate.model";

const buildWith = (configs: Config[]): Build => ({
	id: "build",
	configs,
});
const unitsFor = (ratio: number, gate: number): number =>
	ratio * scoringSlotsAt(gate);

const closing = (partial: Partial<GateClose>): GateClose => ({
	build: buildWith([CONFIGS.js]),
	bankedUnits: 0,
	unitsThisGate: 0,
	baseUnitsThisGate: SLICE_WINDOW,
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

describe("the window's own minimum", () => {
	const onAFullBank = (partial: Partial<GateClose>): GateClose =>
		closing({ gatesCleared: 5, bankedUnits: unitsFor(1, 4), ...partial });

	it("holds a gate the bank alone would clear, since yesterday cannot clear today", () => {
		expect(
			gateClosingFor(
				onAFullBank({
					unitsThisGate: 0,
					baseUnitsThisGate: 0,
					correctThisGate: 0,
				})
			)
		).toBe("held");
	});

	it("holds on one right answer, which is under the minimum", () => {
		expect(
			gateClosingFor(
				onAFullBank({
					unitsThisGate: 1,
					baseUnitsThisGate: 1,
					correctThisGate: 1,
				})
			)
		).toBe("held");
	});

	it("clears on two right answers, the bands deciding the rest", () => {
		expect(
			gateClosingFor(
				onAFullBank({
					unitsThisGate: MIN_WINDOW_UNITS,
					baseUnitsThisGate: MIN_WINDOW_UNITS,
					correctThisGate: MIN_WINDOW_UNITS,
				})
			)
		).toBe("cleared");
	});

	it("counts partials toward it, which the old right-answer floor never did", () => {
		expect(
			gateClosingFor(
				onAFullBank({
					unitsThisGate: 1.5,
					baseUnitsThisGate: 0.75 * 3,
					correctThisGate: 0,
				})
			)
		).toBe("cleared");
	});

	it("counts the answers before multipliers, so a big build cannot buy past it", () => {
		expect(
			gateClosingFor(
				onAFullBank({
					build: buildWith([CONFIGS.agentsMd]),
					unitsThisGate: 2 * MIN_WINDOW_UNITS,
					baseUnitsThisGate: 1,
					correctThisGate: 1,
				})
			)
		).toBe("held");
	});

	it("names the window as the reason, so the debrief can say it", () => {
		expect(
			gateRulingFor(
				onAFullBank({
					unitsThisGate: 0,
					baseUnitsThisGate: 0,
					correctThisGate: 0,
				})
			)
		).toEqual({ closing: "held", heldBy: "unscored" });
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

describe("the Champion takes no thin clear", () => {
	const onTheOkLine = (gate: number): GateClose =>
		closing({ gatesCleared: gate, unitsThisGate: unitsFor(okAt(gate), gate) });

	it("clears an OK close at every gate before the Champion", () => {
		expect(gateRulingFor(onTheOkLine(VICTORY_GATE - 1))).toEqual({
			closing: "cleared",
		});
	});

	it("holds an OK close at the Champion on the band", () => {
		expect(gateRulingFor(onTheOkLine(VICTORY_GATE))).toEqual({
			closing: "held",
			heldBy: "band",
		});
	});

	it("wins the Champion on the HEALTHY line", () => {
		expect(
			gatePassed(
				closing({
					gatesCleared: VICTORY_GATE,
					unitsThisGate: unitsFor(healthyAt(VICTORY_GATE), VICTORY_GATE),
				})
			)
		).toBe(true);
	});

	it.each([
		["ok", VICTORY_GATE - 1, true],
		["ok", VICTORY_GATE, false],
		["healthy", VICTORY_GATE, true],
		["perfect", VICTORY_GATE, true],
		["shaky", 0, false],
	] as const)("reads %s at gate %i as clearing: %s", (band, gate, clears) => {
		expect(clearsAt(band, gate)).toBe(clears);
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
	const SCORED = MIN_WINDOW_UNITS;
	const UNDER = MIN_WINDOW_UNITS - 1;

	it("lands a right answer above where the run stands", () => {
		const projection = gateProjectionFor(10, SCORED, PAYS_TWO, GATE, 50);

		expect(projection.held).toBe(40);
		expect(projection.pass).toBe(48);
		expect(projection.passClears).toBe(false);
	});

	it("leaves a wrong answer exactly where the run already stands", () => {
		const projection = gateProjectionFor(10, SCORED, PAYS_TWO, GATE, 50);

		expect(projection.miss).toBe(projection.held);
		expect(projection.missClears).toBe(false);
	});

	it("says a miss still clears when the run is already past the demand", () => {
		const projection = gateProjectionFor(14, SCORED, PAYS_TWO, GATE, 50);

		expect(projection.missClears).toBe(true);
		expect(projection.passClears).toBe(true);
	});

	it("clears on meeting the demand exactly, not only on beating it", () => {
		const projection = gateProjectionFor(
			11.5,
			SCORED,
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
			SCORED,
			previewOf({ coveragePerCorrect: 8 }),
			GATE,
			50
		);

		expect(projection.pass).toBe(100);
	});

	it("carries the demand through untouched", () => {
		expect(gateProjectionFor(10, SCORED, PAYS_TWO, GATE, 50).demand).toBe(50);
	});

	it("refuses a miss under the window's minimum, however good the meter", () => {
		const projection = gateProjectionFor(14, UNDER, PAYS_TWO, GATE, 50);

		expect(projection.missClears).toBe(false);
		expect(projection.passClears).toBe(true);
	});

	it("refuses both when even the right answer leaves the window short", () => {
		const projection = gateProjectionFor(14, 0, PAYS_TWO, GATE, 50);

		expect(projection.missClears).toBe(false);
		expect(projection.passClears).toBe(false);
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
		expect(CONFIG_LIST.at(-1)).toBe(CONFIGS.npmAudit);
	});

	it("sells information rather than coverage, so it stacks with anything", () => {
		expect(touchesCoverage(CONFIGS.dryRun)).toBe(false);
	});
});

describe("baseGateLadderAt", () => {
	it.each([0, 1, 6, 12])(
		"reads gate %i as the ladder a build with no live audit faces",
		(gate) => {
			expect(baseGateLadderAt(gate)).toEqual(
				gateLadderFor([], gate, EMPTY_AUDIT_SCHEDULE)
			);
		}
	);

	it("climbs from floor to ok to healthy in percent", () => {
		const { floor, ok, healthy } = baseGateLadderAt(6);

		expect(floor).toBeLessThanOrEqual(ok);
		expect(ok).toBeLessThanOrEqual(healthy);
		expect(healthy).toBeLessThanOrEqual(100);
	});
});

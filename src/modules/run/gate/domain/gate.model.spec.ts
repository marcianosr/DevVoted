import { describe, expect, it } from "vitest";

import { Build } from "~/modules/run/build/domain/build.model";
import { Config } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import {
	bandFor,
	floorAt,
	healthyAt,
	okAt,
	ratioOf,
	scoringSlotsAt,
} from "~/modules/run/build/domain/coverageRatio.model";
import {
	SLICE_WINDOW,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";
import { EMPTY_AUDIT_SCHEDULE } from "~/modules/run/gate/domain/audit.model";
import {
	bandAtLadder,
	baseGateLadderAt,
	clearsAt,
	coversEveryChange,
	type GateClose,
	gateClosingFor,
	gateLadderFor,
	gatePassed,
	gateRulingFor,
	heldAtClose,
	peelConfigRangeFor,
	reachedAtClose,
} from "~/modules/run/gate/domain/gate.model";

const buildWith = (configs: Config[]): Build => ({
	id: "build",
	configs,
});
const unitsFor = (ratio: number, gate: number): number =>
	ratio * scoringSlotsAt(gate);

const closing = (partial: Partial<GateClose>): GateClose => ({
	build: buildWith([CONFIGS.js]),
	headStartUnits: 0,
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

		expect(
			gatePassed(closing({ gatesCleared: 9, headStartUnits: banked }))
		).toBe(false);
		expect(
			gatePassed(
				closing({
					gatesCleared: 9,
					headStartUnits: banked,
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
		expect(gatePassed(closing({ gatesCleared: 6, unitsThisGate: units }))).toBe(
			false
		);
	});

	it("never clears a bare build — free redo would soft-lock it forever", () => {
		expect(
			gatePassed(closing({ build: buildWith([]), unitsThisGate: 999 }))
		).toBe(false);
	});
});

describe("how far past the full bar a close reached", () => {
	it("reads past 100% where the held figure stops at the full bar", () => {
		const close = closing({
			gatesCleared: 2,
			unitsThisGate: unitsFor(1.12, 2),
		});

		expect(heldAtClose(close)).toBe(100);
		expect(reachedAtClose(close)).toBe(112);
	});

	it("agrees with the held figure short of the full bar", () => {
		const close = closing({
			gatesCleared: 2,
			unitsThisGate: unitsFor(0.64, 2),
		});

		expect(reachedAtClose(close)).toBe(heldAtClose(close));
	});
});

describe("a flawless gate is never fatal", () => {
	it("holds instead of killing when the run score sits under the floor", () => {
		expect(
			gateClosingFor(
				closing({
					gatesCleared: 9,
					headStartUnits: 0,
					unitsThisGate: 4,
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
					headStartUnits: 0,
					unitsThisGate: 4,
					correctThisGate: 4,
				})
			)
		).toBe("fatal");
	});
});

describe("the swatch asks for every change covered", () => {
	const PEWTER = 1;

	it("earns on a full bar carrying a miss", () => {
		expect(
			coversEveryChange(
				closing({
					gatesCleared: PEWTER,
					unitsThisGate: scoringSlotsAt(PEWTER),
					correctThisGate: SLICE_WINDOW - 1,
				})
			)
		).toBe(true);
	});

	it("counts the head start toward the full bar", () => {
		expect(
			coversEveryChange(
				closing({
					gatesCleared: PEWTER,
					headStartUnits: 1,
					unitsThisGate: scoringSlotsAt(PEWTER) - 1,
				})
			)
		).toBe(true);
	});

	it("refuses five right that leave a change uncovered", () => {
		expect(
			coversEveryChange(
				closing({
					gatesCleared: PEWTER,
					unitsThisGate: scoringSlotsAt(PEWTER) - 1,
					correctThisGate: SLICE_WINDOW,
				})
			)
		).toBe(false);
	});
});

describe("coverage alone decides the gate", () => {
	it("clears on one right answer when the build's output reaches the band", () => {
		expect(
			gateClosingFor(
				closing({
					build: buildWith([CONFIGS.agentsMd]),
					gatesCleared: 4,
					unitsThisGate: unitsFor(healthyAt(4), 4),
					correctThisGate: 1,
				})
			)
		).toBe("cleared");
	});

	it("holds a blank window on its band, never on a count of right answers", () => {
		expect(
			gateRulingFor(
				closing({
					gatesCleared: 5,
					headStartUnits: unitsFor(floorAt(5), 5),
					unitsThisGate: 0,
					correctThisGate: 0,
				})
			)
		).toEqual({ closing: "held", heldBy: "band" });
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

describe("the roster's order", () => {
	it("ends on Vite, since fixtures slice it positionally", () => {
		expect(CONFIG_LIST.at(-1)).toBe(CONFIGS.vite);
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

describe("bandAtLadder", () => {
	it("cuts the same bands as the ratio classifier on every unaudited gate", () => {
		for (let gate = 0; gate <= VICTORY_GATE; gate++) {
			const ladder = baseGateLadderAt(gate);
			const readings = [
				0,
				ladder.floor / 2,
				(ladder.floor + ladder.ok) / 2,
				(ladder.ok + ladder.healthy) / 2,
				(ladder.healthy + 100) / 2,
				100,
				140,
			];
			for (const held of readings) {
				expect(bandAtLadder(held, ladder).id).toBe(
					bandFor(ratioOf(held), gate).id
				);
			}
		}
	});

	it("reads each rung from its own line up", () => {
		const ladder = { floor: 55, ok: 65, healthy: 80 };

		expect(bandAtLadder(54.9, ladder).id).toBe("danger");
		expect(bandAtLadder(55, ladder).id).toBe("shaky");
		expect(bandAtLadder(65, ladder).id).toBe("ok");
		expect(bandAtLadder(80, ladder).id).toBe("healthy");
		expect(bandAtLadder(99.9, ladder).id).toBe("healthy");
		expect(bandAtLadder(100, ladder).id).toBe("perfect");
	});

	it("cannot read danger at a gate with no floor to fall through", () => {
		expect(bandAtLadder(0, baseGateLadderAt(0)).id).not.toBe("danger");
	});
});

import { describe, expect, it } from "vitest";

import {
	type AuditId,
	AUDIT_ROSTER_SIZE,
} from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_RANK,
	AUDIT_TIERS,
	appearsAtGates,
	auditCapacityFor,
	drawPayloads,
	eligibleFor,
	familyOf,
	poolForGate,
	rankAudits,
	tierForGate,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

const EARLY_GATES = [3, 4, 5, 6, 7];
const EXPECTED_CAPACITY = [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3];

const capacities = (): readonly number[] =>
	Array.from({ length: GATE_COUNT }, (_, gate) => auditCapacityFor(gate));

const earlyPool = (): ReadonlySet<AuditId> =>
	new Set(EARLY_GATES.flatMap((gate) => poolForGate(gate)));

describe("the count curve is the capacity, never a dealt count (ADR-099)", () => {
	it("leaves the first three gates clean and steps at 3, 8 and 11", () => {
		expect(capacities()).toEqual(EXPECTED_CAPACITY);
	});

	it("never eases off deeper into the climb", () => {
		const curve = capacities();
		expect(curve).toEqual([...curve].sort((a, b) => a - b));
	});

	it("has pool room for a full gate plus a second payload to choose from", () => {
		for (const tier of AUDIT_TIERS)
			expect(tier.pool.length).toBeGreaterThan(tier.capacity);
	});

	it("tiers every gate from 3 and leaves the clean gates untiered", () => {
		for (let gate = 3; gate <= VICTORY_GATE; gate++)
			expect(tierForGate(gate)).toBeDefined();
		for (const gate of [0, 1, 2]) expect(tierForGate(gate)).toBeUndefined();
	});
});

describe("the pools stage what a rival can throw at you", () => {
	it("draws from nothing at the clean gates", () => {
		for (const gate of [0, 1, 2]) expect(poolForGate(gate)).toEqual([]);
	});

	it("keeps the level-reading audits out of gates 3-7, where nothing is upgraded", () => {
		expect(earlyPool().has("breaking-change")).toBe(false);
		expect(earlyPool().has("upgrade-required")).toBe(false);
	});

	it("keeps the Elite-tier rules out of the early gates", () => {
		expect(earlyPool().has("feature-freeze")).toBe(false);
		expect(earlyPool().has("strip")).toBe(false);
	});

	it("keeps 413 Payload Too Large out of gates too narrow to trigger it", () => {
		expect(earlyPool().has("payload-too-large")).toBe(false);
	});

	it("lets 410 Gone reach the summit tier now that nothing pins it", () => {
		expect(poolForGate(11)).toContain("strip");
		expect(poolForGate(VICTORY_GATE)).toContain("strip");
	});
});

describe("eligibleFor keeps a gate's audits compatible", () => {
	it("offers the whole pool to an empty gate", () => {
		expect(eligibleFor(poolForGate(9), [])).toEqual(poolForGate(9));
	});

	it("never offers a second audit of one family", () => {
		const offered = eligibleFor(poolForGate(9), ["dependency-outage"]);
		expect(offered.map(familyOf)).not.toContain("offline-config");
	});

	it("never clocks a mirrored gate — the timeout would void the mirror", () => {
		expect(eligibleFor(poolForGate(9), ["mirrored"])).not.toContain("timeout");
		expect(eligibleFor(poolForGate(9), ["timeout"])).not.toContain("mirrored");
	});

	it("never offers what the gate already carries", () => {
		expect(eligibleFor(poolForGate(9), ["not-found"])).not.toContain(
			"not-found"
		);
	});
});

describe("rankAudits", () => {
	it("orders a gate by roster rank, so the defeat device is predictable", () => {
		expect(rankAudits(["cost-overrun", "strip", "timeout"])).toEqual([
			"strip",
			"timeout",
			"cost-overrun",
		]);
	});
});

describe("drawPayloads", () => {
	const pool = poolForGate(9);

	it("is a function of its seed — a refresh is not a re-roll", () => {
		expect(drawPayloads(pool, [], "run-1:run-2:9:2026-09-22", 2)).toEqual(
			drawPayloads(pool, [], "run-1:run-2:9:2026-09-22", 2)
		);
	});

	it("draws two distinct alternatives for a PERFECT close", () => {
		const [first, second] = drawPayloads(pool, [], "seed", 2);
		expect(first).toBeDefined();
		expect(second).toBeDefined();
		expect(first).not.toBe(second);
	});

	it("draws only what the gate could still carry", () => {
		const drawn = drawPayloads(pool, ["dependency-outage", "mirrored"], "s", 5);
		expect(drawn.map(familyOf)).not.toContain("offline-config");
		expect(drawn).not.toContain("timeout");
	});

	it("draws nothing once the gate can take nothing more", () => {
		const full = pool.filter((id) => familyOf(id) !== "clock");
		expect(drawPayloads(pool, full, "s", 1)).toEqual([]);
	});

	it("varies with the seed across enough rivals", () => {
		const draws = Array.from({ length: 50 }, (_, day) =>
			JSON.stringify(drawPayloads(pool, [], `2026-09-${day}`, 1))
		);
		expect(new Set(draws).size).toBeGreaterThan(1);
	});
});

describe("what the Dex can state without a run", () => {
	it("places every audit in the roster somewhere on the ladder", () => {
		expect(AUDIT_RANK).toHaveLength(AUDIT_ROSTER_SIZE);
		for (const id of AUDIT_RANK)
			expect(appearsAtGates(id).length).toBeGreaterThan(0);
	});

	it("reports an audit's gates in ladder order, without repeats", () => {
		for (const id of AUDIT_RANK) {
			const gates = appearsAtGates(id);
			expect(gates).toEqual([...gates].sort((a, b) => a - b));
			expect(new Set(gates).size).toBe(gates.length);
		}
	});

	it("reads an audit's reach off the tiers whose pool holds it", () => {
		expect(appearsAtGates("feature-freeze")).toEqual([11, VICTORY_GATE]);
		expect(appearsAtGates("not-found")).toEqual([3, 4, 5, 6, 7, 8, 9, 10]);
	});
});

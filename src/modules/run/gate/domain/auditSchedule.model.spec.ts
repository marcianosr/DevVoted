import { describe, expect, it } from "vitest";

import {
	type AuditId,
	AUDIT_ROSTER_SIZE,
	auditAt,
} from "~/modules/run/gate/domain/audit.model";
import {
	AUDIT_BANDS,
	AUDIT_RANK,
	appearsAtGates,
	bandForGate,
	certainAuditsFor,
	DEFAULT_AUDIT_SCHEDULE,
	drawAuditSchedule,
	familyOf,
	INTRO_AUDITS,
	INTRO_GATE,
} from "~/modules/run/gate/domain/auditSchedule.model";
import { GATE_COUNT, VICTORY_GATE } from "~/modules/run/run/domain/rules.model";

const SEEDS = Array.from({ length: 500 }, (_, day) => `2026-09-${day}`);

const countsIn = (seed: string): readonly number[] => {
	const schedule = drawAuditSchedule(seed);
	return Array.from(
		{ length: GATE_COUNT },
		(_, gate) => (schedule[gate] ?? []).length
	);
};

const EXPECTED_COUNTS = [0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3];

describe("the count curve is the escalation (ADR-038, kept by ADR-056)", () => {
	it("keeps the first three gates clean and steps at 3, 8 and 11", () => {
		for (const seed of SEEDS) expect(countsIn(seed)).toEqual(EXPECTED_COUNTS);
	});

	it("never eases off deeper into the climb", () => {
		for (const seed of SEEDS) {
			const counts = countsIn(seed);
			expect(counts).toEqual([...counts].sort((a, b) => a - b));
		}
	});

	it("fills every gate it promises — no draw is left short", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			for (const band of AUDIT_BANDS)
				for (const gate of band.gates)
					expect(schedule[gate]).toHaveLength(
						band.perGate + band.pinned.length
					);
		}
	});
});

describe("the authored gates are not drawn", () => {
	it("opens the audited climb on the same introduction every run", () => {
		for (const seed of SEEDS)
			expect(drawAuditSchedule(seed)[INTRO_GATE]).toEqual(INTRO_AUDITS);
	});

	it("keeps the Champion's handcrafted combination, in its authored order", () => {
		for (const seed of SEEDS)
			expect(drawAuditSchedule(seed)[VICTORY_GATE]).toEqual([
				"timeout",
				"strip",
				"payload-too-large",
			]);
	});

	it("always strips at Elite, so the peel share stays a stated number", () => {
		for (const seed of SEEDS)
			expect(drawAuditSchedule(seed)[11]).toContain("strip");
	});
});

describe("a drawn gate only stacks compatible audits", () => {
	it("never puts two audits of one family on a gate", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			for (let gate = 0; gate < GATE_COUNT; gate++) {
				const families = (schedule[gate] ?? []).map(familyOf);
				expect(new Set(families).size).toBe(families.length);
			}
		}
	});

	it("never clocks a mirrored gate — the timeout would void the mirror", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			for (let gate = 0; gate < GATE_COUNT; gate++) {
				const ids = schedule[gate] ?? [];
				expect(ids.includes("mirrored") && ids.includes("timeout")).toBe(false);
			}
		}
	});

	it("orders a drawn gate by roster rank, so the defeat device is predictable", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			for (const band of AUDIT_BANDS)
				for (const gate of band.gates) {
					const ranks = (schedule[gate] ?? []).map((id) =>
						AUDIT_RANK.indexOf(id)
					);
					expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
				}
		}
	});
});

describe("uniqueness is band-local for now (ADR-056 step 1)", () => {
	it("gives no band the same audit twice", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			for (const band of AUDIT_BANDS) {
				const drawn = band.gates.flatMap((gate) => schedule[gate] ?? []);
				expect(new Set(drawn).size).toBe(drawn.length);
			}
		}
	});

	it("has pool room to spare in every band, so step 2 cannot strand a gate", () => {
		for (const band of AUDIT_BANDS)
			expect(band.pool.length).toBeGreaterThanOrEqual(
				band.gates.length * band.perGate
			);
	});
});

describe("the pools stage what a gate can throw at you", () => {
	const drawnIn = (gates: readonly number[]): ReadonlySet<AuditId> =>
		new Set(
			SEEDS.flatMap((seed) => {
				const schedule = drawAuditSchedule(seed);
				return gates.flatMap((gate) => schedule[gate] ?? []);
			})
		);

	it("keeps the level-reading audits out of gates 4-7, where nothing is upgraded", () => {
		const early = drawnIn([4, 5, 6, 7]);
		expect(early.has("breaking-change")).toBe(false);
		expect(early.has("upgrade-required")).toBe(false);
	});

	it("keeps the Elite-tier rules out of the early gates", () => {
		const early = drawnIn([4, 5, 6, 7]);
		expect(early.has("feature-freeze")).toBe(false);
		expect(early.has("strip")).toBe(false);
	});

	it("keeps 413 Payload Too Large out of gates too narrow to trigger it", () => {
		expect(drawnIn([4, 5, 6, 7]).has("payload-too-large")).toBe(false);
	});

	it("never repeats the introduction in the band right after it", () => {
		for (const id of INTRO_AUDITS)
			expect(drawnIn([4, 5, 6, 7]).has(id)).toBe(false);
	});

	it("teaches five distinct rules across the first five audited gates", () => {
		for (const seed of SEEDS) {
			const schedule = drawAuditSchedule(seed);
			const opening = [3, 4, 5, 6, 7].flatMap((gate) => schedule[gate] ?? []);
			expect(new Set(opening).size).toBe(5);
		}
	});

	it("reaches every audit in a band's pool across enough days", () => {
		for (const band of AUDIT_BANDS) {
			const drawn = drawnIn(band.gates);
			for (const id of band.pool) expect(drawn.has(id)).toBe(true);
		}
	});
});

describe("a draw is a function of its seed", () => {
	it("gives the same day the same gauntlet — a reload is not a re-roll", () => {
		expect(drawAuditSchedule("2026-09-04")).toEqual(
			drawAuditSchedule("2026-09-04")
		);
	});

	it("gives two days different gauntlets", () => {
		const days = SEEDS.slice(0, 50).map((seed) =>
			JSON.stringify(drawAuditSchedule(seed))
		);
		expect(new Set(days).size).toBeGreaterThan(1);
	});

	it("keeps a gate's audits across its retry, since the gate number is the key", () => {
		const schedule = drawAuditSchedule("2026-09-04");
		expect(schedule[9]).toEqual(drawAuditSchedule("2026-09-04")[9]);
	});
});

describe("what the Dex can state without a run", () => {
	it("names the audits a gate is certain to carry", () => {
		expect(certainAuditsFor(INTRO_GATE)).toEqual(["cost-overrun"]);
		expect(certainAuditsFor(11)).toEqual(["strip"]);
		expect(certainAuditsFor(VICTORY_GATE)).toHaveLength(3);
		expect(certainAuditsFor(5)).toEqual([]);
	});

	it("bands every drawn gate and leaves the authored ones unbanded", () => {
		for (const gate of [4, 5, 6, 7, 8, 9, 10, 11])
			expect(bandForGate(gate)).toBeDefined();
		for (const gate of [0, 1, 2, 3, VICTORY_GATE])
			expect(bandForGate(gate)).toBeUndefined();
	});

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
});

describe("the fallback schedule", () => {
	it("is a legal gauntlet, so a snapshot without one still plays", () => {
		expect(
			Array.from(
				{ length: GATE_COUNT },
				(_, gate) => (DEFAULT_AUDIT_SCHEDULE[gate] ?? []).length
			)
		).toEqual(EXPECTED_COUNTS);
	});

	it("dials its audits for the gate they landed on", () => {
		const champion = DEFAULT_AUDIT_SCHEDULE[VICTORY_GATE] ?? [];
		expect(
			champion.map((id) => auditAt(id, VICTORY_GATE).peelShareOnFail)
		).toContain(0.15);
	});
});

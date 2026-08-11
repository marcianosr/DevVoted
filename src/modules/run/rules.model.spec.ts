import { describe, expect, it } from "vitest";

import {
	dropCount,
	gateStake,
	minConfigsForGate,
	pollDifficultyMultiplier,
	storageCreditRate,
	GATE_COUNT,
	VICTORY_GATE,
} from "./rules.model";

describe("storageCreditRate", () => {
	it("banks everything on a victory", () => {
		expect(storageCreditRate("victory", VICTORY_GATE)).toBe(1);
	});

	it("banks nothing on an abandon, however far the climb got", () => {
		expect(storageCreditRate("abandoned", 0)).toBe(0);
		expect(storageCreditRate("abandoned", VICTORY_GATE - 1)).toBe(0);
	});

	it("scales a death linearly with gates cleared", () => {
		// gatesCleared is a count, so the share divides by how many gates a run has.
		expect(storageCreditRate("dead", 0)).toBe(0);
		expect(storageCreditRate("dead", GATE_COUNT / 2)).toBeCloseTo(0.5);
		expect(storageCreditRate("dead", GATE_COUNT - 1)).toBeCloseTo(
			(GATE_COUNT - 1) / GATE_COUNT
		);
	});

	it("never pays more than the full leftovers", () => {
		expect(storageCreditRate("dead", VICTORY_GATE + 3)).toBe(1);
	});
});

describe("pollDifficultyMultiplier", () => {
	it("pays the baseline ×1.0 for a 3-option single-choice poll", () => {
		expect(pollDifficultyMultiplier(3, false)).toBe(1);
	});

	it("never dips below ×1.0 for fewer-than-baseline options", () => {
		expect(pollDifficultyMultiplier(2, false)).toBe(1);
	});

	it("adds a step of coverage per option beyond the baseline", () => {
		expect(pollDifficultyMultiplier(5, false)).toBeCloseTo(1.2);
		expect(pollDifficultyMultiplier(8, false)).toBeCloseTo(1.5);
	});

	it("adds a flat bonus for multiple-choice on top of the option steps", () => {
		expect(pollDifficultyMultiplier(3, true)).toBeCloseTo(1.5);
		expect(pollDifficultyMultiplier(6, true)).toBeCloseTo(1.8);
		expect(pollDifficultyMultiplier(8, true)).toBeCloseTo(2);
	});
});

describe("minConfigsForGate", () => {
	it("ramps with the early gates so the opening climb farms freely", () => {
		expect(minConfigsForGate(0)).toBe(0); // Pallet demands nothing
		expect(minConfigsForGate(1)).toBe(1); // Boulder
		expect(minConfigsForGate(2)).toBe(2); // Cascade
		expect(minConfigsForGate(3)).toBe(3); // Thunder
	});

	it("follows one-over-the-strip-quota from gate 4 to the summit's 8", () => {
		for (let gate = 4; gate < GATE_COUNT; gate++)
			expect(minConfigsForGate(gate)).toBe(dropCount(gate) + 1);
		expect(minConfigsForGate(4)).toBe(4);
		expect(minConfigsForGate(VICTORY_GATE)).toBe(8);
	});

	it("admits only stake-survivable builds from Thunder on — meeting the demand is never fatal there", () => {
		// Before gate 3 the demand sits under the quota on purpose: the early
		// glass cannon is farmable, and ADR-021's fatal rule prices it honestly.
		for (let gate = 3; gate < GATE_COUNT; gate++)
			expect(gateStake(dropCount(gate), minConfigsForGate(gate)).fatal).toBe(
				false
			);
	});
});

describe("gateStake", () => {
	it("is not fatal when the peel quota is smaller than the build", () => {
		expect(gateStake(1, 3)).toEqual({ strips: 1, configs: 3, fatal: false });
	});

	it("is fatal once the peel quota matches the whole build", () => {
		expect(gateStake(3, 3).fatal).toBe(true);
	});

	it("is fatal when the peel quota exceeds the build", () => {
		expect(gateStake(4, 3).fatal).toBe(true);
	});
});

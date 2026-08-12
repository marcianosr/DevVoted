import { describe, expect, it } from "vitest";

import {
	dropCount,
	gateBaseMultiplier,
	gateStake,
	isStoragePlanUnlocked,
	minConfigsForGate,
	pollDifficultyMultiplier,
	storageCreditRate,
	storagePlanLadder,
	GATE_COUNT,
	GATE_REWARD_KB,
	STORAGE_PLANS,
	VICTORY_GATE,
} from "./rules.model";

describe("the storage-plan ladder (ADR-030)", () => {
	it("climbs to a 3MB cap", () => {
		expect(STORAGE_PLANS.at(-1)?.capKb).toBe(3072);
	});

	it("never sells a bigger cap for a smaller bill", () => {
		const rungs = [...STORAGE_PLANS];
		rungs.forEach((rung, index) => {
			const previous = rungs[index - 1];
			if (!previous) return;
			expect(rung.capKb).toBeGreaterThan(previous.capKb);
			expect(rung.billKb).toBeGreaterThan(previous.billKb);
			expect(rung.fromGate).toBeGreaterThanOrEqual(previous.fromGate);
		});
	});

	// A cap is only worth its bill once a clear can fill it, and the bill lands
	// pass or fail — so no rung may cost more than the gate that unlocks it pays.
	it("prices every rung under a perfect clear at the gate that opens it", () => {
		STORAGE_PLANS.filter((plan) => plan.billKb > 0).forEach((plan) => {
			const clearAtUnlock =
				GATE_REWARD_KB * gateBaseMultiplier(Math.max(1, plan.fromGate));
			expect(plan.billKb).toBeLessThan(clearAtUnlock / 2);
		});
	});

	it("opens the free tier and one paid rung from the very first shop", () => {
		expect(
			storagePlanLadder(0).filter((plan) => isStoragePlanUnlocked(plan, 0))
		).toEqual([STORAGE_PLANS[0], STORAGE_PLANS[1]]);
	});

	// Showing the whole tail would turn a three-row section into seven rows of
	// things the run cannot buy.
	it("draws the unlocked rungs plus exactly one still out of reach", () => {
		const ladder = storagePlanLadder(0);
		expect(
			ladder.filter((plan) => !isStoragePlanUnlocked(plan, 0))
		).toHaveLength(1);
		expect(ladder).toHaveLength(3);
	});

	it("widens as the run climbs, and stops adding a locked rung at the top", () => {
		expect(storagePlanLadder(4).length).toBeGreaterThan(
			storagePlanLadder(0).length
		);
		const summit = storagePlanLadder(STORAGE_PLANS.at(-1)?.fromGate ?? 0);
		expect(summit).toHaveLength(STORAGE_PLANS.length);
	});
});

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

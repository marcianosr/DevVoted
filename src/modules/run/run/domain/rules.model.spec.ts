import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	configFloorForGate,
	coverageDemandFor,
	dropCount,
	gateBaseMultiplier,
	isStakeFatal,
	isStoragePlanUnlocked,
	minConfigsForGate,
	pollDifficultyMultiplier,
	storageCreditRate,
	storagePlanLadder,
	GATE_COUNT,
	GATE_REWARD_KB,
	SLICE_WINDOW,
	STORAGE_PLANS,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";

describe("the gate's coverage demand (ADR-034)", () => {
	it("prices every gate near 80% of a perfect base pace", () => {
		for (let gate = 0; gate <= VICTORY_GATE; gate++) {
			const perfectPace = (SLICE_WINDOW * (gate + 1) * (gate + 2)) / 2;
			expect(coverageDemandFor(gate)).toBeLessThanOrEqual(
				0.8 * perfectPace + 5
			);
			expect(coverageDemandFor(gate)).toBeGreaterThanOrEqual(0.6 * perfectPace);
		}
	});

	it("rises with every gate and holds past the summit", () => {
		for (let gate = 1; gate <= VICTORY_GATE; gate++)
			expect(coverageDemandFor(gate)).toBeGreaterThan(
				coverageDemandFor(gate - 1)
			);
		expect(coverageDemandFor(VICTORY_GATE + 5)).toBe(
			coverageDemandFor(VICTORY_GATE)
		);
	});

	it("keeps the wrong-answer bleed at a quarter of the base gain", () => {
		// Break-even base accuracy 20% at every depth (ADR-034).
		expect(WRONG_COVERAGE_LOSS).toBe(0.25);
	});
});

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
			expect(isStakeFatal(dropCount(gate), minConfigsForGate(gate))).toBe(
				false
			);
	});
});

describe("atMinimumWidth", () => {
	it("refuses the removal that would sink the build under the demand", () => {
		expect(atMinimumWidth(3, 2)).toBe(false); // one to spare
		expect(atMinimumWidth(2, 2)).toBe(true); // removing one breaches it
		expect(atMinimumWidth(1, 2)).toBe(true); // already under
	});

	it("keeps a floor of one even where the gate demands none", () => {
		// Pallet asks for nothing, but emptying the pipeline would make a
		// stripped-bare run unkillable (ADR-021), so the last config never goes.
		expect(minConfigsForGate(0)).toBe(0);
		expect(atMinimumWidth(1, 0)).toBe(true);
		expect(atMinimumWidth(2, 0)).toBe(false);
	});
});

describe("isStakeFatal", () => {
	it("is not fatal when the peel quota is smaller than the build", () => {
		expect(isStakeFatal(1, 3)).toBe(false);
	});

	it("is fatal once the peel quota matches the whole build", () => {
		expect(isStakeFatal(3, 3)).toBe(true);
	});

	it("is fatal when the peel quota exceeds the build", () => {
		expect(isStakeFatal(4, 3)).toBe(true);
	});
});

describe("configFloorForGate", () => {
	it("sits one config above the gate's strip quota", () => {
		expect(configFloorForGate(0)).toBe(2);
		expect(configFloorForGate(4)).toBe(4);
		expect(configFloorForGate(VICTORY_GATE)).toBe(8);
	});

	it("names the exact count below which a failed gate kills the run", () => {
		for (let gate = 0; gate < GATE_COUNT; gate++) {
			const floor = configFloorForGate(gate);
			expect(isStakeFatal(dropCount(gate), floor)).toBe(false);
			expect(isStakeFatal(dropCount(gate), floor - 1)).toBe(true);
		}
	});
});

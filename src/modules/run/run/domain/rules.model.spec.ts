import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	coverageDemandFor,
	failStripsFor,
	gateBaseMultiplier,
	isStakeFatal,
	isStoragePlanUnlocked,
	pollDifficultyMultiplier,
	storageCreditRate,
	storagePlanLadder,
	streakMultiplier,
	GATE_COUNT,
	GATE_REWARD_KB,
	SLICE_WINDOW,
	STORAGE_PLANS,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";

describe("the gate's per-window coverage demand (ADR-035)", () => {
	it("anchors the opening gates at 3, 10 and 25", () => {
		expect(coverageDemandFor(0)).toBe(3);
		expect(coverageDemandFor(1)).toBe(10);
		expect(coverageDemandFor(2)).toBe(25);
	});

	it("ramps the demand-to-base-pace ratio — the (g+1) earn scaling is free, the ratio is the difficulty", () => {
		// Strict base pace: 5 perfect answers at gateBaseMultiplier, no configs.
		const ratioAt = (gate: number): number =>
			coverageDemandFor(gate) / (SLICE_WINDOW * gateBaseMultiplier(gate));
		for (let gate = 1; gate < VICTORY_GATE; gate++)
			expect(ratioAt(gate + 1)).toBeGreaterThan(ratioAt(gate));
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

	// Priced in answers, not points: a miss costs the answer you did not get plus
	// half of one on top, so it is 1.5 answers at every gate and on every build.
	it("prices a miss at one and a half answers", () => {
		expect(WRONG_COVERAGE_LOSS).toBe(0.5);
	});

	// The streak survives a gate clear, so uncapped it reached ×7.5 on a flawless
	// run — free, and larger than anything the shop sells. Both starting stacks
	// then cleared all 13 gates without buying a single config.
	it("stops the streak bonus compounding past ×2", () => {
		expect(streakMultiplier(5)).toBe(1.5);
		expect(streakMultiplier(10)).toBe(2);
		expect(streakMultiplier(11)).toBe(2);
		expect(streakMultiplier(65)).toBe(2);
	});

	// Capped, never reset: a player who never misses keeps the bonus for the whole
	// run. Taking it back at a gate would punish the perfect play it rewards.
	it("never takes the bonus back once it is earned", () => {
		const steps = Array.from({ length: 40 }, (_, i) => streakMultiplier(i));

		steps.forEach((step, index) => {
			if (index > 0) expect(step).toBeGreaterThanOrEqual(steps[index - 1]);
		});
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

// The peel tracks the slot ladder (3 slots at the start, 14 at the summit), so a
// miss keeps costing roughly the same fraction of a build all the way up.
describe("the peel a missed gate takes (ADR-037)", () => {
	it("takes one config while the pipeline is still narrow", () => {
		expect(failStripsFor(0)).toBe(1);
		expect(failStripsFor(2)).toBe(1);
	});

	it("escalates with depth", () => {
		expect(failStripsFor(5)).toBe(2);
		expect(failStripsFor(8)).toBe(3);
		expect(failStripsFor(12)).toBe(4);
	});

	it("never eases off deeper into the climb", () => {
		const rows = Array.from({ length: GATE_COUNT }, (_, gate) =>
			failStripsFor(gate)
		);
		expect(rows).toEqual([...rows].sort((a, b) => a - b));
	});

	it("holds the summit row past the last gate — endless runs keep a rule", () => {
		expect(failStripsFor(VICTORY_GATE + 5)).toBe(failStripsFor(VICTORY_GATE));
	});
});

describe("atMinimumWidth", () => {
	it("refuses removing the last config — a pipeline never goes bare", () => {
		// Only a missed gate may take the last config, and that ends the run.
		expect(atMinimumWidth(1)).toBe(true);
		expect(atMinimumWidth(2)).toBe(false);
		expect(atMinimumWidth(3)).toBe(false);
	});
});

describe("isStakeFatal", () => {
	it("is not fatal when the peel is smaller than the build", () => {
		expect(isStakeFatal(1, 3)).toBe(false);
	});

	it("is fatal once the peel matches or exceeds the whole build", () => {
		expect(isStakeFatal(3, 3)).toBe(true);
		expect(isStakeFatal(4, 3)).toBe(true);
	});
});

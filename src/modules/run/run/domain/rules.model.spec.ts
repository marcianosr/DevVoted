import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	coverageDemandFor,
	failPeelShareFor,
	peelQuotaSpotsFor,
	gateBaseMultiplier,
	isPeelFatal,
	pollDifficultyMultiplier,
	extraRentKb,
	extraSpotsUnlocked,
	scheduledRung,
	spotLadderTo,
	spotsHeldWith,
	storageCreditRate,
	streakCapMultiplier,
	streakMultiplier,
	EXTRA_SPOT_RENT_KB,
	EXTRA_SPOT_TIERS,
	GATE_COUNT,
	GATE_REWARD_KB,
	MAX_EXTRA_SPOTS,
	SLICE_WINDOW,
	SPOT_RUNGS,
	TOP_RUNG,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";
import { BASE_SPOTS } from "~/modules/run/pipeline/domain/pipeline.model";

describe("the gate's per-window coverage demand (ADR-035)", () => {
	it("anchors the opening gates at 3, 10 and 25", () => {
		expect(coverageDemandFor(0)).toBe(3);
		expect(coverageDemandFor(1)).toBe(10);
		expect(coverageDemandFor(2)).toBe(25);
	});

	it("ramps the demand-to-base-pace ratio — the (g+1) earn scaling is free, the ratio is the difficulty", () => {
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

	it("prices a miss at one and a half answers", () => {
		expect(WRONG_COVERAGE_LOSS).toBe(0.5);
	});

	it("stops the streak bonus compounding past ×2", () => {
		expect(streakMultiplier(5)).toBe(1.5);
		expect(streakMultiplier(10)).toBe(2);
		expect(streakMultiplier(11)).toBe(2);
		expect(streakMultiplier(65)).toBe(2);
	});

	it("lifts the ceiling when the build is paid for more steps", () => {
		expect(streakMultiplier(15, 20)).toBe(2.5);
		expect(streakMultiplier(25, 20)).toBe(3);
		expect(streakCapMultiplier(20)).toBe(3);
	});

	it("never takes the bonus back once it is earned", () => {
		const steps = Array.from({ length: 40 }, (_, i) => streakMultiplier(i));

		steps.forEach((step, index) => {
			if (index > 0) expect(step).toBeGreaterThanOrEqual(steps[index - 1]);
		});
	});
});

describe("the width ladder (ADR-045)", () => {
	it("gives every run four spots before it clears anything", () => {
		expect(SPOT_RUNGS[0].spots).toBe(BASE_SPOTS);
		expect(SPOT_RUNGS[0].fromGate).toBe(0);
	});

	it("climbs 4, 8, 12, 16, 24 and stops there", () => {
		expect(SPOT_RUNGS.map((rung) => rung.spots)).toEqual([4, 8, 12, 16, 24]);
		expect(TOP_RUNG.spots).toBe(24);
	});

	it("never hands over less room later", () => {
		SPOT_RUNGS.forEach((rung, index) => {
			const previous = SPOT_RUNGS[index - 1];
			if (!previous) return;
			expect(rung.spots).toBeGreaterThan(previous.spots);
			expect(rung.fromGate).toBeGreaterThan(previous.fromGate);
		});
	});

	it("keeps the whole ladder inside the run — every rung arrives by the last gate", () => {
		expect(TOP_RUNG.fromGate).toBeLessThan(VICTORY_GATE);
	});

	describe("scheduledRung", () => {
		it("hands a rung over the moment its gate falls", () => {
			expect(scheduledRung(1).spots).toBe(4);
			expect(scheduledRung(2).spots).toBe(8);
			expect(scheduledRung(5).spots).toBe(12);
			expect(scheduledRung(11).spots).toBe(24);
		});

		it("holds at the ceiling past the last rung's gate", () => {
			expect(scheduledRung(VICTORY_GATE + 5).spots).toBe(TOP_RUNG.spots);
		});
	});

	describe("spotLadderTo", () => {
		it("draws the rungs reached plus exactly one ahead", () => {
			expect(spotLadderTo(1).map((rung) => rung.spots)).toEqual([4, 8]);
			expect(spotLadderTo(3).map((rung) => rung.spots)).toEqual([4, 8, 12, 16]);
		});

		it("adds nothing ahead once the ceiling is scheduled", () => {
			expect(spotLadderTo(TOP_RUNG.tier)).toHaveLength(SPOT_RUNGS.length);
		});
	});
});

describe("extra spots (ADR-045)", () => {
	it("sells four steps, one spot apart", () => {
		expect(EXTRA_SPOT_TIERS.map((tier) => tier.spots)).toEqual([1, 2, 3, 4]);
		expect(MAX_EXTRA_SPOTS).toBe(4);
	});

	it("stages the deeper steps behind clears, so a lucky balance cannot buy the summit width at gate 1", () => {
		expect(extraSpotsUnlocked(0)).toBe(1);
		expect(extraSpotsUnlocked(3)).toBe(2);
		expect(extraSpotsUnlocked(6)).toBe(3);
		expect(extraSpotsUnlocked(9)).toBe(4);
		expect(extraSpotsUnlocked(VICTORY_GATE)).toBe(MAX_EXTRA_SPOTS);
	});

	it("never opens a step later than the run's last gate", () => {
		EXTRA_SPOT_TIERS.forEach((tier) =>
			expect(tier.fromGate).toBeLessThan(VICTORY_GATE)
		);
	});

	describe("the rent", () => {
		it("charges nothing while the run takes its width on schedule", () => {
			expect(extraRentKb(0)).toBe(0);
		});

		it("prices the first extra spot at a quarter of gate 0's perfect clear", () => {
			expect(extraRentKb(1)).toBe(EXTRA_SPOT_RENT_KB);
			expect(EXTRA_SPOT_RENT_KB * 4).toBe(GATE_REWARD_KB);
		});

		it("charges the same for every spot, so a step is its number times the rate", () => {
			expect(extraRentKb(2)).toBe(16);
			expect(extraRentKb(3)).toBe(24);
			expect(extraRentKb(4)).toBe(32);
		});
	});

	describe("spotsHeldWith", () => {
		it("adds the extra spots on top of the schedule", () => {
			expect(spotsHeldWith(0)).toBe(4);
			expect(spotsHeldWith(0, 3)).toBe(7);
			expect(spotsHeldWith(5, 2)).toBe(14);
		});

		it("never counts more extras than the ladder sells", () => {
			expect(spotsHeldWith(11, 40)).toBe(TOP_RUNG.spots + MAX_EXTRA_SPOTS);
		});
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

describe("the peel a missed gate takes (ADR-037/044)", () => {
	it("takes a fifth of the pipeline while the climb is shallow", () => {
		expect(failPeelShareFor(0)).toBe(0.2);
		expect(failPeelShareFor(2)).toBe(0.2);
	});

	it("escalates with depth", () => {
		expect(failPeelShareFor(5)).toBe(0.25);
		expect(failPeelShareFor(8)).toBe(0.3);
		expect(failPeelShareFor(12)).toBe(0.35);
	});

	it("never eases off deeper into the climb", () => {
		const rows = Array.from({ length: GATE_COUNT }, (_, gate) =>
			failPeelShareFor(gate)
		);
		expect(rows).toEqual([...rows].sort((a, b) => a - b));
	});

	it("holds the summit row past the last gate — endless runs keep a rule", () => {
		expect(failPeelShareFor(VICTORY_GATE + 5)).toBe(
			failPeelShareFor(VICTORY_GATE)
		);
	});

	it("rounds a quota up — a peel that rounds to nothing is a free miss", () => {
		expect(peelQuotaSpotsFor(4, 0.2, 0)).toBe(1);
		expect(peelQuotaSpotsFor(1, 0.2, 0)).toBe(1);
	});

	it("never takes more than half the build before gate 3", () => {
		for (const gate of [0, 1, 2])
			for (const occupied of [1, 2, 4, 8])
				expect(peelQuotaSpotsFor(occupied, 0.9, gate)).toBeLessThanOrEqual(
					Math.ceil(occupied / 2)
				);
	});

	it("lets a deep gate past the half-build cap", () => {
		expect(peelQuotaSpotsFor(8, 0.9, 8)).toBeGreaterThan(4);
	});
});

describe("atMinimumWidth", () => {
	it("refuses removing the last config — a pipeline never goes bare", () => {
		expect(atMinimumWidth(1)).toBe(true);
		expect(atMinimumWidth(2)).toBe(false);
		expect(atMinimumWidth(3)).toBe(false);
	});
});

describe("isPeelFatal", () => {
	it("is not fatal when the peel leaves spots behind", () => {
		expect(isPeelFatal(1, 4)).toBe(false);
	});

	it("is fatal once the peel takes every occupied spot", () => {
		expect(isPeelFatal(4, 4)).toBe(true);
		expect(isPeelFatal(5, 4)).toBe(true);
	});
});

import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	failPeelShareFor,
	peelQuotaSlotsFor,
	isPeelFatal,
	storageCreditRate,
	buildSpaceFor,
	highestAffordableSpace,
	rungIndexForSpace,
	upkeepForSpace,
	BUILD_SPACE_RUNGS,
	FREE_BUILD_SPACE_RUNG,
	streakMultiplier,
	streakUnitBonus,
	STREAK_UNIT_STEP,
	MAX_STREAK_UNIT_STEPS,
	GATE_COUNT,
	VICTORY_GATE,
} from "~/modules/run/run/domain/rules.model";

describe("the streak bonus", () => {
	it("stops the streak bonus compounding past ×2", () => {
		expect(streakMultiplier(5)).toBe(1.5);
		expect(streakMultiplier(10)).toBe(2);
		expect(streakMultiplier(11)).toBe(2);
		expect(streakMultiplier(65)).toBe(2);
	});

	it("never takes the bonus back once it is earned", () => {
		const steps = Array.from({ length: 40 }, (_, i) => streakMultiplier(i));

		steps.forEach((step, index) => {
			if (index > 0) expect(step).toBeGreaterThanOrEqual(steps[index - 1]);
		});
	});
});

describe("the streak unit step", () => {
	it("pays nothing on the window's opening answer, whatever the build bought", () => {
		expect(streakUnitBonus(0)).toBe(0);
		expect(streakUnitBonus(0, 0.25)).toBe(0);
	});

	it("stays flat at every streak length without a growth", () => {
		expect(streakUnitBonus(1)).toBe(STREAK_UNIT_STEP);
		expect(streakUnitBonus(4)).toBe(STREAK_UNIT_STEP);
		expect(streakUnitBonus(40)).toBe(STREAK_UNIT_STEP);
	});

	it("climbs by the growth on each further answer in a row", () => {
		expect(streakUnitBonus(1, 0.25)).toBeCloseTo(0.25);
		expect(streakUnitBonus(2, 0.25)).toBeCloseTo(0.5);
		expect(streakUnitBonus(3, 0.25)).toBeCloseTo(0.75);
		expect(streakUnitBonus(4, 0.25)).toBeCloseTo(1);
	});

	it("pays a clean window 2.5 units of step against the flat 0.4", () => {
		const window = [0, 1, 2, 3, 4];
		const flat = window.reduce(
			(sum, before) => sum + streakUnitBonus(before),
			0
		);
		const grown = window.reduce(
			(sum, before) => sum + streakUnitBonus(before, 0.25),
			0
		);

		expect(flat).toBeCloseTo(0.4);
		expect(grown).toBeCloseTo(2.5);
	});

	it("clamps a streak carried in from a failed gate to a clean window's climb", () => {
		expect(MAX_STREAK_UNIT_STEPS).toBe(4);
		expect(streakUnitBonus(5, 0.25)).toBeCloseTo(1);
		expect(streakUnitBonus(9, 0.25)).toBeCloseTo(1);
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

describe("the peel a missed gate takes (ADR-037/044)", () => {
	it("waives the peel at the Pallet gate — calibration costs nothing (ADR-057)", () => {
		expect(failPeelShareFor(0)).toBe(0);
	});

	it("takes a fifth of the build while the climb is shallow", () => {
		expect(failPeelShareFor(1)).toBe(0.2);
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
		expect(peelQuotaSlotsFor(4, 0.2, 0)).toBe(1);
		expect(peelQuotaSlotsFor(1, 0.2, 0)).toBe(1);
	});

	it("never takes more than half the build before gate 3", () => {
		for (const gate of [0, 1, 2])
			for (const occupied of [1, 2, 4, 8])
				expect(peelQuotaSlotsFor(occupied, 0.9, gate)).toBeLessThanOrEqual(
					Math.ceil(occupied / 2)
				);
	});

	it("lets a deep gate past the half-build cap", () => {
		expect(peelQuotaSlotsFor(8, 0.9, 8)).toBeGreaterThan(4);
	});
});

describe("atMinimumWidth", () => {
	it("refuses removing the last config — a build never goes bare", () => {
		expect(atMinimumWidth(1)).toBe(true);
		expect(atMinimumWidth(2)).toBe(false);
		expect(atMinimumWidth(3)).toBe(false);
	});
});

describe("isPeelFatal", () => {
	it("is not fatal when the peel leaves slots behind", () => {
		expect(isPeelFatal(1, 4)).toBe(false);
	});

	it("is fatal once the peel takes every occupied slot", () => {
		expect(isPeelFatal(4, 4)).toBe(true);
		expect(isPeelFatal(5, 4)).toBe(true);
	});
});

describe("the build space ladder (ADR-074)", () => {
	it("opens every run on four weight of free room", () => {
		expect(buildSpaceFor(FREE_BUILD_SPACE_RUNG)).toBe(4);
		expect(upkeepForSpace(4)).toBe(0);
	});

	it("bills the rung the space sits on, not the weight in use", () => {
		expect(upkeepForSpace(8)).toBe(32);
	});

	it("steps to the highest rung at or below the space rather than interpolating", () => {
		expect(upkeepForSpace(9)).toBe(32);
		expect(upkeepForSpace(11)).toBe(32);
		expect(upkeepForSpace(12)).toBe(64);
	});

	it("reads a legacy save whose bought slot count is not a rung weight", () => {
		expect(rungIndexForSpace(7)).toBe(1);
		expect(upkeepForSpace(7)).toBe(16);
	});

	it("charges nothing below the first rung", () => {
		expect(upkeepForSpace(0)).toBe(0);
		expect(upkeepForSpace(3)).toBe(0);
	});

	it("holds the top rung for a space heavier than the ladder", () => {
		expect(upkeepForSpace(64)).toBe(512);
	});

	it("clamps a rung index to the ladder at both ends", () => {
		expect(buildSpaceFor(-3)).toBe(4);
		expect(buildSpaceFor(99)).toBe(32);
	});

	it("doubles the bill at every billed rung, so room is never cheap twice", () => {
		const billed = BUILD_SPACE_RUNGS.filter((rung) => rung.kb > 0);

		billed.slice(1).forEach((rung, index) => {
			expect(rung.kb).toBe(billed[index].kb * 2);
		});
	});

	it("drops to the widest rung the balance covers when the bill outruns it", () => {
		expect(highestAffordableSpace(512)).toBe(32);
		expect(highestAffordableSpace(100)).toBe(12);
		expect(highestAffordableSpace(0)).toBe(4);
	});

	it("never falls below the free rung, so a spent run still carries a build", () => {
		expect(highestAffordableSpace(-50)).toBe(4);
	});
});

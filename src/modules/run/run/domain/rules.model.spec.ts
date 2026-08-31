import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	coverageDemandFor,
	failPeelShareFor,
	peelQuotaSlotsFor,
	gateBaseMultiplier,
	isPeelFatal,
	pollDifficultyMultiplier,
	cappedStorage,
	nextSlotPriceKb,
	planBillKb,
	slotCashOutKb,
	storageCapFor,
	storageCreditRate,
	streakCapMultiplier,
	streakMultiplier,
	BASE_SLOTS,
	FREE_PLAN,
	GATE_COUNT,
	GATE_REWARD_KB,
	MAX_SLOTS,
	SLICE_WINDOW,
	SLOT_PRICES_KB,
	STORAGE_PLANS,
	TOP_PLAN,
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

describe("the slot ladder (ADR-046)", () => {
	it("gives every run four slots before it buys anything", () => {
		expect(BASE_SLOTS).toBe(4);
	});

	it("sells one rung per slot up to the 24-slot ceiling", () => {
		expect(SLOT_PRICES_KB).toHaveLength(MAX_SLOTS - BASE_SLOTS);
		expect(MAX_SLOTS).toBe(24);
	});

	it("opens at 16 KB, half the cheapest config on the shelf", () => {
		expect(nextSlotPriceKb(0)).toBe(16);
	});

	it("never gets cheaper as the ladder climbs", () => {
		SLOT_PRICES_KB.forEach((price, rung) => {
			if (rung === 0) return;
			expect(price).toBeGreaterThan(SLOT_PRICES_KB[rung - 1]);
		});
	});

	it("doubles every rung while slots are cheap, so the fifth to eighth are quick", () => {
		expect(SLOT_PRICES_KB.slice(0, 4)).toEqual([16, 32, 64, 128]);
	});

	it("halves the pace to a doubling every second rung once past 128 KB", () => {
		SLOT_PRICES_KB.forEach((price, rung) => {
			if (rung < 5) return;
			expect(price).toBe(SLOT_PRICES_KB[rung - 2] * 2);
		});
	});

	it("prices the whole ladder past what a perfect climb earns, so 24 is endless-run territory", () => {
		const perfectRunKb = GATE_REWARD_KB * ((GATE_COUNT * (GATE_COUNT - 1)) / 2);
		const wholeLadderKb = SLOT_PRICES_KB.reduce((sum, kb) => sum + kb, 0);

		expect(wholeLadderKb).toBeGreaterThan(perfectRunKb);
	});

	it("sells nothing once the ceiling is reached", () => {
		expect(nextSlotPriceKb(SLOT_PRICES_KB.length)).toBeUndefined();
	});

	describe("cashing a slot out", () => {
		it("refunds what the most expensive slot still held cost", () => {
			expect(slotCashOutKb(BASE_SLOTS + 1)).toBe(SLOT_PRICES_KB[0]);
			expect(slotCashOutKb(BASE_SLOTS + 5)).toBe(SLOT_PRICES_KB[4]);
		});

		it("refuses to cash the free four", () => {
			expect(slotCashOutKb(BASE_SLOTS)).toBeUndefined();
		});

		it("never pays out more than buying the same slot back costs", () => {
			SLOT_PRICES_KB.forEach((_, rung) => {
				const slots = BASE_SLOTS + rung + 1;
				const refund = slotCashOutKb(slots) ?? 0;
				const rebuy = nextSlotPriceKb(rung + 1);
				if (rebuy === undefined) return;
				expect(refund).toBeLessThan(rebuy);
			});
		});
	});
});

describe("the storage plan (ADR-046)", () => {
	it("opens on a free 512 KB cap", () => {
		expect(FREE_PLAN.capKb).toBe(512);
		expect(FREE_PLAN.perGateKb).toBe(0);
	});

	it("climbs to 10 MB, and only the free rung bills nothing", () => {
		expect(TOP_PLAN.capKb).toBe(10240);
		expect(STORAGE_PLANS.filter((plan) => plan.perGateKb === 0)).toHaveLength(
			1
		);
	});

	it("raises both the cap and the bill on every rung", () => {
		STORAGE_PLANS.forEach((plan, tier) => {
			if (tier === 0) return;
			expect(plan.capKb).toBeGreaterThan(STORAGE_PLANS[tier - 1].capKb);
			expect(plan.perGateKb).toBeGreaterThan(STORAGE_PLANS[tier - 1].perGateKb);
		});
	});

	it("holds the free cap below the priciest slot, so the plan gates the ladder", () => {
		expect(FREE_PLAN.capKb).toBeLessThan(
			SLOT_PRICES_KB[SLOT_PRICES_KB.length - 1]
		);
	});

	it("reads an out-of-range tier as the nearest one it sells", () => {
		expect(storageCapFor(-1)).toBe(FREE_PLAN.capKb);
		expect(storageCapFor(STORAGE_PLANS.length)).toBe(TOP_PLAN.capKb);
		expect(planBillKb(-1)).toBe(0);
	});

	describe("the cap itself", () => {
		it("leaves a balance under the cap alone", () => {
			expect(cappedStorage(320, 0)).toBe(320);
		});

		it("burns everything above the cap", () => {
			expect(cappedStorage(900, 0)).toBe(FREE_PLAN.capKb);
		});

		it("holds more once a bigger plan is bought", () => {
			expect(cappedStorage(900, 1)).toBe(768);
			expect(cappedStorage(900, 2)).toBe(900);
		});

		it("never reads a balance below zero", () => {
			expect(cappedStorage(-40, 0)).toBe(0);
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
	it("takes a fifth of the build while the climb is shallow", () => {
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

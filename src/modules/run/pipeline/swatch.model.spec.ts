import { describe, expect, it } from "vitest";

import { GYM_LEADERS } from "~/test/kanto";

import { GATE_COUNT, VICTORY_GATE } from "../rules.model";

import {
	BASE_SLOTS,
	coverageToAddSlot,
	MAX_SLOTS,
	slotsRequiredForGate,
} from "./pipeline.model";
import {
	ALL_SWATCHES,
	gateOpenedBySlot,
	SLOT_SWATCHES,
	swatchesEarnedAt,
	swatchForSlot,
} from "./swatch.model";

describe("SLOT_SWATCHES", () => {
	it("covers every slot that opens a gate, the free base slot included", () => {
		const slots = Object.keys(SLOT_SWATCHES)
			.map(Number)
			.sort((a, b) => a - b);
		const gateOpening = Array.from(
			{ length: MAX_SLOTS - BASE_SLOTS + 1 },
			(_, index) => BASE_SLOTS + index
		);
		expect(slots).toEqual(gateOpening);
	});

	it("stays aligned with the coverage ladder — every bought swatch has a rung", () => {
		// Pallet comes with the run, so it is the one swatch with no rung.
		for (const { slot } of Object.values(SLOT_SWATCHES)) {
			if (slot <= BASE_SLOTS) continue;
			expect(Number.isFinite(coverageToAddSlot(slot - 1))).toBe(true);
		}
	});

	it("names slots 4–11 after the eight gym badges in canonical order", () => {
		const badgeRun = GYM_LEADERS.map(({ badge }) =>
			badge.replace(" Badge", " Swatch")
		);
		const gymSlots = Array.from(
			{ length: 8 },
			(_, index) => SLOT_SWATCHES[BASE_SLOTS + 1 + index].name
		);
		expect(gymSlots).toEqual(badgeRun);
	});

	it("crowns the final slot as the Elite Four — the only legendary swatch", () => {
		expect(SLOT_SWATCHES[MAX_SLOTS].name).toBe("Elite Four Swatch");
		const legendaries = Object.values(SLOT_SWATCHES).filter(
			({ legendary }) => legendary
		);
		expect(legendaries).toEqual([SLOT_SWATCHES[MAX_SLOTS]]);
	});

	it("fills the two gym-less rungs with Kanto landmarks", () => {
		// Eight gyms cover nine gates; these two stretch the ladder to all twelve.
		expect(SLOT_SWATCHES[12].name).toBe("Lavender Swatch");
		expect(SLOT_SWATCHES[13].name).toBe("Seafoam Swatch");
	});

	it("carries exactly one swatch per gate", () => {
		// Pallet opens gate 0 for free; the rest are bought, one per advance.
		expect(ALL_SWATCHES).toHaveLength(GATE_COUNT);
	});

	it("opens the run in Pallet — the free swatch of the starting pipeline", () => {
		expect(SLOT_SWATCHES[BASE_SLOTS].name).toBe("Pallet Swatch");
		expect(gateOpenedBySlot(BASE_SLOTS)).toBe(0); // gates count from 0
	});
});

describe(gateOpenedBySlot, () => {
	it("maps each slot onto the gate it opens, inverting the requirement", () => {
		expect(gateOpenedBySlot(BASE_SLOTS + 1)).toBe(1); // slot 4 → gate 1
		expect(gateOpenedBySlot(MAX_SLOTS)).toBe(VICTORY_GATE); // last slot → summit
		for (const { slot } of ALL_SWATCHES)
			expect(slotsRequiredForGate(gateOpenedBySlot(slot))).toBe(slot);
	});
});

describe(swatchForSlot, () => {
	it("returns nothing below the base build or beyond the cap", () => {
		expect(swatchForSlot(BASE_SLOTS - 1)).toBeUndefined();
		expect(swatchForSlot(MAX_SLOTS + 1)).toBeUndefined();
	});
});

describe("swatch ids", () => {
	it("gives every swatch a distinct stable id", () => {
		const ids = ALL_SWATCHES.map(({ id }) => id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(SLOT_SWATCHES[4].id).toBe("swatch-boulder");
		expect(SLOT_SWATCHES[MAX_SLOTS].id).toBe("swatch-elite-four");
	});
});

describe(swatchesEarnedAt, () => {
	it("holds only Pallet at the base width", () => {
		expect(swatchesEarnedAt(BASE_SLOTS)).toEqual([SLOT_SWATCHES[BASE_SLOTS]]);
	});

	it("earns every swatch up to the pipeline's width, in ladder order", () => {
		expect(swatchesEarnedAt(6).map(({ name }) => name)).toEqual([
			"Pallet Swatch",
			"Boulder Swatch",
			"Cascade Swatch",
			"Thunder Swatch",
		]);
	});

	it("earns the whole ladder at the slot cap", () => {
		expect(swatchesEarnedAt(MAX_SLOTS)).toEqual(ALL_SWATCHES);
	});
});

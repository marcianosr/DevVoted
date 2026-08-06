import { describe, expect, it } from "vitest";

import { GATE_COUNT, VICTORY_GATE } from "../rules.model";
import {
	ALL_SWATCHES,
	GATE_SWATCHES,
	hasThemeColor,
	swatchesEarnedAt,
	swatchForGate,
} from "./swatch.model";

describe("GATE_SWATCHES", () => {
	it("carries exactly one swatch per gate of the climb", () => {
		// The roster is the ladder: a missing entry would leave a gate with no
		// badge to award, an extra one a badge no gate can reach.
		expect(ALL_SWATCHES).toHaveLength(GATE_COUNT);
		for (let gate = 0; gate <= VICTORY_GATE; gate += 1) {
			expect(swatchForGate(gate)?.gate).toBe(gate);
		}
	});

	it("has no swatch beyond the summit or below gate 0", () => {
		expect(swatchForGate(VICTORY_GATE + 1)).toBeUndefined();
		expect(swatchForGate(-1)).toBeUndefined();
	});

	it("opens on Pallet and ends on the Champion", () => {
		expect(swatchForGate(0)?.name).toBe("Pallet Swatch");
		expect(swatchForGate(VICTORY_GATE)?.name).toBe("Champion Swatch");
	});

	it("names the Elite gate just below the summit", () => {
		expect(swatchForGate(VICTORY_GATE - 1)?.name).toBe("Elite Swatch");
	});

	it("draws only the summit pair off the flat palette", () => {
		// 13 gates against a 12-colour palette: the two specials are what keeps
		// every badge's colour its own.
		const special = ALL_SWATCHES.filter((swatch) => swatch.finish !== "flat");
		expect(special.map(({ name, finish }) => [name, finish])).toEqual([
			["Elite Swatch", "plate"],
			["Champion Swatch", "fill"],
		]);
		expect(ALL_SWATCHES.filter((s) => s.finish === "flat")).toHaveLength(
			GATE_COUNT - 2
		);
	});

	it("keeps a theme colour for everything but the gradient", () => {
		// The Elite plate is still indigo, so it themes its subtree; only the
		// Champion has no colour to hand down (`text-theme` would vanish).
		expect(
			ALL_SWATCHES.filter((s) => !hasThemeColor(s)).map((s) => s.name)
		).toEqual(["Champion Swatch"]);
	});

	it("gives every swatch a distinct persisted id and theme", () => {
		const ids = new Set(ALL_SWATCHES.map(({ id }) => id));
		const themes = new Set(ALL_SWATCHES.map(({ theme }) => theme));
		expect(ids.size).toBe(ALL_SWATCHES.length);
		expect(themes.size).toBe(ALL_SWATCHES.length);
	});

	it("keys the persisted id off the theme so a rename is a visible break", () => {
		expect(
			Object.values(GATE_SWATCHES).every((s) => s.id === `swatch-${s.theme}`)
		).toBe(true);
	});
});

describe("swatchesEarnedAt", () => {
	it("gives a fresh run nothing — Pallet is gate 0's reward, not a gift", () => {
		expect(swatchesEarnedAt(0)).toEqual([]);
	});

	it("awards a gate's swatch once that gate is behind you", () => {
		expect(swatchesEarnedAt(1).map(({ name }) => name)).toEqual([
			"Pallet Swatch",
		]);
		expect(swatchesEarnedAt(3).map(({ theme }) => theme)).toEqual([
			"pallet",
			"boulder",
			"cascade",
		]);
	});

	it("hands over the whole roster to a run that summited", () => {
		expect(swatchesEarnedAt(GATE_COUNT)).toHaveLength(GATE_COUNT);
	});
});

import { describe, expect, it } from "vitest";

import {
	atMinimumWidth,
	failPeelShareFor,
	peelQuotaSlotsFor,
	isPeelFatal,
	storageCreditRate,
	bankedKb,
	unbankedKb,
	GATE_COUNT,
	VICTORY_GATE,
	BOOT_CACHE_RUNGS,
	bootCacheRungAt,
} from "~/modules/run/run/domain/rules.model";
import { STORAGE_UNITS } from "~/shared/lib/storage";

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

describe("the two halves a finished run splits its balance into", () => {
	it("banks everything and leaves nothing behind on a victory", () => {
		expect(bankedKb(96, VICTORY_GATE, true)).toBe(96);
		expect(unbankedKb(96, VICTORY_GATE, true)).toBe(0);
	});

	it("leaves the whole balance behind when a run dies at the first gate", () => {
		expect(bankedKb(96, 0, false)).toBe(0);
		expect(unbankedKb(96, 0, false)).toBe(96);
	});

	it("leaves less behind the deeper a run got before it died", () => {
		expect(unbankedKb(96, 4, false)).toBeGreaterThan(unbankedKb(96, 11, false));
	});

	it("splits the balance with nothing created and nothing lost", () => {
		for (const gate of [0, 1, 4, 7, 11, VICTORY_GATE]) {
			expect(bankedKb(97, gate, false) + unbankedKb(97, gate, false)).toBe(97);
		}
	});

	it("leaves nothing behind for a run that held nothing", () => {
		expect(unbankedKb(0, 4, false)).toBe(0);
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

describe("the Boot Cache rungs (ADR-153)", () => {
	it("prices every rung at two archived KB per KB banked", () => {
		expect(
			BOOT_CACHE_RUNGS.map((rung) => [
				rung.archiveBytes / STORAGE_UNITS.KB,
				rung.storageKb,
			])
		).toEqual([
			[128, 64],
			[256, 128],
			[512, 256],
		]);
	});

	it("has no rung past the third", () => {
		expect(bootCacheRungAt(2)?.storageKb).toBe(256);
		expect(bootCacheRungAt(3)).toBeUndefined();
	});
});

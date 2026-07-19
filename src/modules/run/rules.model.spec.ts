import { describe, expect, it } from "vitest";

import { storageCreditRate, VICTORY_GATE } from "./rules.model";

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
		expect(storageCreditRate("dead", VICTORY_GATE / 2)).toBeCloseTo(0.5);
		expect(storageCreditRate("dead", VICTORY_GATE - 1)).toBeCloseTo(
			(VICTORY_GATE - 1) / VICTORY_GATE
		);
	});

	it("never pays more than the full leftovers", () => {
		expect(storageCreditRate("dead", VICTORY_GATE + 3)).toBe(1);
	});
});

import { describe, expect, it } from "vitest";

import { focusCoverageMultiplier, focusDemand, rarityOf } from "./config";
import { CONFIGS } from "./configRoster";

describe("rarityOf", () => {
	it("defaults an unset rarity to common", () => {
		expect(rarityOf(CONFIGS.js)).toBe("common");
	});

	it("reads an explicit rarity", () => {
		expect(rarityOf(CONFIGS.deployFriday)).toBe("legendary");
		expect(rarityOf(CONFIGS.copilot)).toBe("rare");
	});
});

describe("focusCoverageMultiplier", () => {
	it("scales 1.5x at L1, 2x at L2, 2.5x at L3", () => {
		expect(focusCoverageMultiplier(1)).toBe(1.5);
		expect(focusCoverageMultiplier(2)).toBe(2);
		expect(focusCoverageMultiplier(3)).toBe(2.5);
	});
});

describe("focusDemand", () => {
	it("demands `level` correct answers (default 1)", () => {
		expect(focusDemand(CONFIGS.js)).toBe(1);
		expect(focusDemand({ ...CONFIGS.js, level: 3 })).toBe(3);
	});
});

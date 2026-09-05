import { describe, expect, it } from "vitest";

import {
	autoUpgradeAfterCorrectOf,
	cacheMultiplierFor,
	describeConfig,
	draftCost,
	focusCoverageMultiplier,
	givesOf,
	headlineFigureOf,
	isUpgradable,
	baseSlotsOf,
	CACHE_HIT_CAP,
	CONFIG_SIZES,
	DRAFT_COST_PER_SLOT_KB,
	largestSizeFitting,
	minify,
	sellRefund,
	showsSampleSize,
	switchArm,
	upgradePreview,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

describe("draftCost", () => {
	it("prices a config at 32 KB for every slot it fills", () => {
		expect(draftCost(CONFIGS.js)).toBe(32);
		expect(draftCost(CONFIGS.agentsMd)).toBe(256);
	});

	it("charges the same rate at every size, so price reads straight off the size", () => {
		expect(draftCost(CONFIGS.js)).toBe(32);
		expect(draftCost(CONFIGS.codeCoverage)).toBe(64);
		expect(draftCost(CONFIGS.intellisense)).toBe(128);
		expect(draftCost(CONFIGS.agentsMd)).toBe(256);
	});

	it("refunds half the price on a sell", () => {
		expect(sellRefund(CONFIGS.agentsMd)).toBe(128);
	});

	it("prices the two-slot collector at 64KB, refunding 32KB", () => {
		expect(draftCost(CONFIGS.garbageCollection)).toBe(64);
		expect(sellRefund(CONFIGS.garbageCollection)).toBe(32);
	});

	it("prices WTFPL at its own tag rather than its grade", () => {
		expect(draftCost(CONFIGS.wtfpl)).toBe(512);
	});

	it("prices Freemium at nothing — eight slots whose whole cost is the bill", () => {
		expect(baseSlotsOf(CONFIGS.freemium)).toBe(8);
		expect(draftCost(CONFIGS.freemium)).toBe(0);
		expect(sellRefund(CONFIGS.freemium)).toBe(0);
	});
});

describe("baseSlotsOf", () => {
	it("defaults an unsized config to one slot", () => {
		expect(baseSlotsOf(CONFIGS.js)).toBe(1);
	});

	it("reads an explicit size", () => {
		expect(baseSlotsOf(CONFIGS.agentsMd)).toBe(8);
		expect(baseSlotsOf(CONFIGS.codeCoverage)).toBe(2);
	});

	it("sizes every roster config on the ladder, so none is unpriceable", () => {
		for (const config of Object.values(CONFIGS))
			expect(CONFIG_SIZES).toContain(baseSlotsOf(config));
	});
});

describe("largestSizeFitting", () => {
	it("names the biggest size that still fits the room left", () => {
		expect(largestSizeFitting(4)).toBe(4);
		expect(largestSizeFitting(7)).toBe(4);
		expect(largestSizeFitting(16)).toBe(16);
	});

	it("names nothing when there is no room at all", () => {
		expect(largestSizeFitting(0)).toBeNull();
	});
});

describe("CONFIG_SIZES", () => {
	it("runs 1 to 16, smallest first", () => {
		expect(CONFIG_SIZES).toEqual([1, 2, 4, 8, 12, 16]);
	});

	it("prices its largest size at 512 KB, the same tag WTFPL carries", () => {
		expect(DRAFT_COST_PER_SLOT_KB * CONFIG_SIZES[CONFIG_SIZES.length - 1]).toBe(
			512
		);
	});
});

describe("switchArm", () => {
	it("ships arm B: the coverage arm unloads and the faucet arm loads", () => {
		const armed = switchArm(CONFIGS.abTest);
		expect(armed.abArm).toBe("storage");
		expect(armed.coverageMultiplier).toBeUndefined();
		expect(armed.storagePerCorrect).toBe(8);
	});

	it("rewrites the row copy to name the live arm", () => {
		expect(switchArm(CONFIGS.abTest).description).toContain("Arm B is live");
		expect(switchArm(CONFIGS.abTest).gives).toContain("Arm B");
	});

	it("round-trips back to arm A, copy included", () => {
		const roundTripped = switchArm(switchArm(CONFIGS.abTest));
		expect(roundTripped.abArm).toBe("coverage");
		expect(roundTripped.coverageMultiplier).toBe(1.25);
		expect(roundTripped.storagePerCorrect).toBeUndefined();
		expect(roundTripped.description).toBe(CONFIGS.abTest.description);
	});

	it("leaves a config without arms untouched", () => {
		expect(switchArm(CONFIGS.js)).toBe(CONFIGS.js);
	});
});

describe("cacheMultiplierFor", () => {
	it("pays ×1 while the cache is cold", () => {
		expect(cacheMultiplierFor(CONFIGS.cache, 0)).toBe(1);
	});

	it("adds one step per cached hit", () => {
		expect(cacheMultiplierFor(CONFIGS.cache, 1)).toBe(1.25);
		expect(cacheMultiplierFor(CONFIGS.cache, 3)).toBe(1.75);
	});

	it("tops out at the cap, so a deep run cannot snowball past ×2", () => {
		expect(cacheMultiplierFor(CONFIGS.cache, CACHE_HIT_CAP)).toBe(2);
		expect(cacheMultiplierFor(CONFIGS.cache, CACHE_HIT_CAP + 5)).toBe(2);
	});

	it("halves the bonus when minified", () => {
		expect(cacheMultiplierFor(minify(CONFIGS.cache), CACHE_HIT_CAP)).toBe(1.5);
	});

	it("pays ×1 on a config without a cache step", () => {
		expect(cacheMultiplierFor(CONFIGS.intellisense, 3)).toBe(1);
	});
});

describe("focusCoverageMultiplier", () => {
	it("scales 1.25x at L1, 1.5x at L2, 1.75x at L3", () => {
		expect(focusCoverageMultiplier(1)).toBe(1.25);
		expect(focusCoverageMultiplier(2)).toBe(1.5);
		expect(focusCoverageMultiplier(3)).toBe(1.75);
	});
});

describe("isUpgradable", () => {
	it("refuses the collector — its payout is what you lost, not a level", () => {
		expect(isUpgradable(CONFIGS.garbageCollection)).toBe(false);
	});

	it("allows focus configs", () => {
		expect(isUpgradable(CONFIGS.js)).toBe(true);
		expect(isUpgradable(CONFIGS.css)).toBe(true);
	});

	it("allows Unit Tests until its level cap — its clear payout scales", () => {
		expect(isUpgradable(CONFIGS.unitTests)).toBe(true);
		expect(isUpgradable({ ...CONFIGS.unitTests, level: 5 })).toBe(false);
	});

	it("caps focus configs at level 5 too", () => {
		expect(isUpgradable({ ...CONFIGS.js, level: 5 })).toBe(false);
	});

	it("refuses configs with nothing that scales per level", () => {
		expect(isUpgradable(CONFIGS.agentsMd)).toBe(false);
		expect(isUpgradable(CONFIGS.codeCoverage)).toBe(false);
		expect(isUpgradable(CONFIGS.eslint)).toBe(false);
		expect(isUpgradable(CONFIGS.deprecated)).toBe(false);
	});

	it("allows Telemetry exactly one upgrade — its own cap, not the shared 5", () => {
		expect(isUpgradable(CONFIGS.telemetry)).toBe(true);
		expect(isUpgradable({ ...CONFIGS.telemetry, level: 2 })).toBe(false);
	});

	it("allows Dependabot exactly one upgrade — the odds are its only lever", () => {
		expect(isUpgradable(CONFIGS.dependabot)).toBe(true);
		expect(isUpgradable({ ...CONFIGS.dependabot, level: 2 })).toBe(false);
	});
});

describe("autoUpgradeAfterCorrectOf", () => {
	it("asks for five correct in a row at L1 and four at L2", () => {
		expect(autoUpgradeAfterCorrectOf(CONFIGS.dependabot)).toBe(5);
		expect(autoUpgradeAfterCorrectOf({ ...CONFIGS.dependabot, level: 2 })).toBe(
			4
		);
	});

	it("never drops below one answer, whatever the level", () => {
		expect(autoUpgradeAfterCorrectOf({ ...CONFIGS.dependabot, level: 9 })).toBe(
			1
		);
	});

	it("stays undefined for configs without the axis", () => {
		expect(autoUpgradeAfterCorrectOf(CONFIGS.js)).toBeUndefined();
	});
});

describe("showsSampleSize", () => {
	it("withholds the number of answers at L1 and hands it over at L2", () => {
		expect(showsSampleSize(CONFIGS.telemetry)).toBe(false);
		expect(showsSampleSize({ ...CONFIGS.telemetry, level: 2 })).toBe(true);
	});
});

describe("describeConfig", () => {
	it("derives Unit Tests' copy from its level — pure payout, no demand (ADR-035)", () => {
		expect(describeConfig(CONFIGS.unitTests)).toBe(
			"+32KB storage on gate clear."
		);
		expect(describeConfig({ ...CONFIGS.unitTests, level: 2 })).toBe(
			"+64KB storage on gate clear."
		);
	});

	it("describes a focus config with its level-scaled payout alone", () => {
		expect(describeConfig({ ...CONFIGS.js, level: 2 })).toBe(
			"JavaScript polls earn 1.5× coverage."
		);
	});

	it("describes Moore's Law without a balance floor", () => {
		expect(describeConfig(CONFIGS.mooresLaw)).toBe(
			"+2% of held storage on gate clear."
		);
	});

	it("describes Telemetry without a peek demand", () => {
		expect(describeConfig(CONFIGS.telemetry)).toBe(
			"Pay a doubling fee to see how the community answered this poll."
		);
	});

	it("derives Dependabot's count from its level, and names both resets", () => {
		expect(describeConfig(CONFIGS.dependabot)).toBe(
			"5 correct answers in a row upgrade a random config in your build, free. A wrong answer or a failed gate starts the count over."
		);
		expect(describeConfig({ ...CONFIGS.dependabot, level: 2 })).toBe(
			"4 correct answers in a row upgrade a random config in your build, free. A wrong answer or a failed gate starts the count over."
		);
	});

	it("reads Deprecated's live multiplier, so the chip fades with the config", () => {
		expect(describeConfig(CONFIGS.deprecated)).toBe(
			"All coverage earns ×3, fading ×0.5 each gate clear. Deleted at ×1."
		);
		expect(
			describeConfig({ ...CONFIGS.deprecated, coverageMultiplier: 2.5 })
		).toBe(
			"All coverage earns ×2.5, fading ×0.5 each gate clear. Deleted at ×1."
		);
	});
});

describe("givesOf", () => {
	it("derives a focus config's L1 copy — base multiplier", () => {
		expect(givesOf(CONFIGS.js)).toBe("JavaScript polls reward ×1.25 coverage");
	});

	it("scales the reward with the config's level after an upgrade", () => {
		expect(givesOf({ ...CONFIGS.js, level: 2 })).toBe(
			"JavaScript polls reward ×1.5 coverage"
		);
	});

	it("passes a non-focus config's authored copy through untouched", () => {
		expect(givesOf(CONFIGS.eslint)).toBe(CONFIGS.eslint.gives);
	});

	it("derives Unit Tests' gives from its level", () => {
		expect(givesOf(CONFIGS.unitTests)).toBe("+32KB on clear");
		expect(givesOf({ ...CONFIGS.unitTests, level: 3 })).toBe("+96KB on clear");
	});

	it("adds the sample size to Telemetry's gives once it is upgraded", () => {
		expect(givesOf(CONFIGS.telemetry)).toBe(
			"See how the community answered this poll"
		);
		expect(givesOf({ ...CONFIGS.telemetry, level: 2 })).toBe(
			"See how the community answered, and how many answered"
		);
	});
});

describe("headlineFigureOf", () => {
	it("prices a focus config by the level it has reached", () => {
		expect(headlineFigureOf(CONFIGS.jsx)).toEqual({
			kind: "multiplier",
			value: 1.25,
		});
		expect(headlineFigureOf({ ...CONFIGS.jsx, level: 2 })).toEqual({
			kind: "multiplier",
			value: 1.5,
		});
	});

	it("reads a flat coverage adder as coverage, not as a multiplier", () => {
		expect(headlineFigureOf(CONFIGS.codeCoverage)).toEqual({
			kind: "coverage",
			value: 0.5,
		});
	});

	it("reads a per-answer storage payout in KB", () => {
		expect(headlineFigureOf(CONFIGS.indexedDb)).toEqual({
			kind: "kb",
			value: 8,
		});
	});

	it("scales a clear payout by level, the way describeOf states it", () => {
		expect(headlineFigureOf({ ...CONFIGS.unitTests, level: 2 })).toEqual({
			kind: "kb",
			value: 64,
		});
	});

	it("withholds a figure where the config prices in something else", () => {
		expect(headlineFigureOf(CONFIGS.eslint)).toBeUndefined();
	});
});

describe("upgradePreview", () => {
	it("names the multiplier a focus config moves to", () => {
		expect(upgradePreview(CONFIGS.js)).toEqual([{ from: "1.25×", to: "1.5×" }]);
	});

	it("prices a clear payout in the KB it will actually pay", () => {
		expect(upgradePreview(CONFIGS.unitTests)).toEqual([
			{ from: "+32KB", to: "+64KB" },
		]);
	});

	it("states the interest rate on both sides of the purchase", () => {
		expect(upgradePreview(CONFIGS.mooresLaw)).toEqual([
			{ from: "+2%", to: "+4%" },
		]);
	});

	it("words the peek upgrade, which buys a fact rather than a number", () => {
		expect(upgradePreview(CONFIGS.telemetry)).toEqual([
			{ from: "split only", to: "with sample size" },
		]);
	});

	it("reads from the level the config is at, not from level one", () => {
		expect(upgradePreview({ ...CONFIGS.js, level: 3 })).toEqual([
			{ from: "1.75×", to: "2×" },
		]);
	});

	it("promises nothing for a config with no axis to upgrade", () => {
		expect(upgradePreview(CONFIGS.eslint)).toEqual([]);
	});
});

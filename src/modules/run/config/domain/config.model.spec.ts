import { describe, expect, it } from "vitest";

import {
	autoUpgradeOneInOf,
	describeConfig,
	draftCost,
	focusCoverageMultiplier,
	givesOf,
	headlineFigureOf,
	isUpgradable,
	RARITY_ODDS,
	RARITY_WEIGHT,
	rarityOf,
	sellRefund,
	shapeOf,
	showsSampleSize,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

describe("draftCost", () => {
	it("prices a config from its grade", () => {
		expect(draftCost(CONFIGS.js)).toBe(32);
		expect(draftCost(CONFIGS.agentsMd)).toBe(256);
	});

	it("doubles from each grade to the next, the way the bit count does", () => {
		expect(draftCost(CONFIGS.js)).toBe(32);
		expect(draftCost(CONFIGS.coverageGain)).toBe(64);
		expect(draftCost(CONFIGS.intellisense)).toBe(128);
		expect(draftCost(CONFIGS.agentsMd)).toBe(256);
	});

	it("refunds half the price on a sell", () => {
		expect(sellRefund(CONFIGS.agentsMd)).toBe(128);
	});

	it("prices WTFPL at its own tag rather than its grade", () => {
		expect(draftCost(CONFIGS.wtfpl)).toBe(512);
	});

	it("prices Freemium at nothing — a byte whose whole cost is the bill", () => {
		expect(rarityOf(CONFIGS.freemium)).toBe("byte");
		expect(draftCost(CONFIGS.freemium)).toBe(0);
		expect(sellRefund(CONFIGS.freemium)).toBe(0);
	});
});

describe("rarityOf", () => {
	it("defaults an unset grade to a bit", () => {
		expect(rarityOf(CONFIGS.js)).toBe("bit");
	});

	it("reads an explicit grade", () => {
		expect(rarityOf(CONFIGS.agentsMd)).toBe("byte");
		expect(rarityOf(CONFIGS.coverageGain)).toBe("crumb");
	});
});

describe("RARITY_ODDS", () => {
	it("quotes each grade's odds as the reciprocal of its weight", () => {
		const total = Object.values(RARITY_WEIGHT).reduce((sum, w) => sum + w, 0);

		for (const [rarity, odds] of Object.entries(RARITY_ODDS)) {
			const quoted = Number(odds.replace("1 in ", ""));
			const actual =
				total / RARITY_WEIGHT[rarity as keyof typeof RARITY_WEIGHT];

			expect(Math.round(actual)).toBe(quoted);
		}
	});

	it("keeps one notation, so no grade reads as a percentage", () => {
		for (const odds of Object.values(RARITY_ODDS))
			expect(odds).toMatch(/^1 in \d+$/);
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
		expect(isUpgradable(CONFIGS.coverageGain)).toBe(false);
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

describe("autoUpgradeOneInOf", () => {
	it("shortens the odds one step per level: 1-in-3 at L1, 1-in-2 at L2", () => {
		expect(autoUpgradeOneInOf(CONFIGS.dependabot)).toBe(3);
		expect(autoUpgradeOneInOf({ ...CONFIGS.dependabot, level: 2 })).toBe(2);
	});

	it("stays undefined for configs without the axis", () => {
		expect(autoUpgradeOneInOf(CONFIGS.js)).toBeUndefined();
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

	it("derives Dependabot's odds from its level", () => {
		expect(describeConfig(CONFIGS.dependabot)).toBe(
			"1 in 3 gate clears: a random config in your pipeline upgrades, free."
		);
		expect(describeConfig({ ...CONFIGS.dependabot, level: 2 })).toBe(
			"1 in 2 gate clears: a random config in your pipeline upgrades, free."
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

describe("shapeOf", () => {
	it("names a build of one grade by its count", () => {
		expect(shapeOf([CONFIGS.js, CONFIGS.ts, CONFIGS.eslint])).toBe(
			"three bits"
		);
	});

	it("names a single config with an article rather than a count", () => {
		expect(shapeOf([CONFIGS.js])).toBe("a bit");
	});

	it("lists grades biggest first and joins the last with and", () => {
		expect(shapeOf([CONFIGS.js, CONFIGS.freemium, CONFIGS.ts])).toBe(
			"a byte and two bits"
		);
	});

	it("keeps a minified config at its own grade, since that is what it is", () => {
		expect(shapeOf([{ ...CONFIGS.freemium, minified: true }])).toBe("a byte");
	});

	it("calls an empty build nothing rather than returning an empty string", () => {
		expect(shapeOf([])).toBe("nothing");
	});
});

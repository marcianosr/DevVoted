import { describe, expect, it } from "vitest";

import {
	describeConfig,
	focusCoverageMultiplier,
	focusDemand,
	givesOf,
	isUpgradable,
	needsOf,
	rarityOf,
} from "./config.model";
import { CONFIG_LIST, CONFIGS } from "./configRoster.model";

describe("rarityOf", () => {
	it("defaults an unset rarity to common", () => {
		expect(rarityOf(CONFIGS.js)).toBe("common");
	});

	it("reads an explicit rarity", () => {
		expect(rarityOf(CONFIGS.agentsMd)).toBe("legendary");
		expect(rarityOf(CONFIGS.coverageGain)).toBe("uncommon");
	});
});

describe("focusCoverageMultiplier", () => {
	it("scales 1.25x at L1, 1.5x at L2, 1.75x at L3", () => {
		expect(focusCoverageMultiplier(1)).toBe(1.25);
		expect(focusCoverageMultiplier(2)).toBe(1.5);
		expect(focusCoverageMultiplier(3)).toBe(1.75);
	});
});

describe("focusDemand", () => {
	it("demands `level` correct answers (default 1)", () => {
		expect(focusDemand(CONFIGS.js)).toBe(1);
		expect(focusDemand({ ...CONFIGS.js, level: 3 })).toBe(3);
	});
});

describe("isUpgradable", () => {
	it("allows focus configs", () => {
		expect(isUpgradable(CONFIGS.js)).toBe(true);
		expect(isUpgradable(CONFIGS.css)).toBe(true);
	});

	it("allows Unit Tests until its level cap", () => {
		expect(isUpgradable(CONFIGS.unitTests)).toBe(true);
		expect(isUpgradable({ ...CONFIGS.unitTests, level: 5 })).toBe(false);
	});

	it("caps focus configs at level 5 too", () => {
		expect(isUpgradable({ ...CONFIGS.js, level: 5 })).toBe(false);
	});

	it("refuses non-focus configs without a correct check", () => {
		expect(isUpgradable(CONFIGS.agentsMd)).toBe(false);
		expect(isUpgradable(CONFIGS.coverageGain)).toBe(false);
		expect(isUpgradable(CONFIGS.eslint)).toBe(false);
	});
});

describe("describeConfig", () => {
	it("derives Unit Tests' copy from its level — payout and demand together", () => {
		expect(describeConfig(CONFIGS.unitTests)).toBe(
			"+32KB storage on gate clear — demands 1 correct answer, rising as you climb."
		);
		expect(describeConfig({ ...CONFIGS.unitTests, level: 2 })).toBe(
			"+64KB storage on gate clear — demands 2 correct answers, rising as you climb."
		);
	});

	it("describes a focus config with its level-scaled payout and demand", () => {
		expect(describeConfig({ ...CONFIGS.js, level: 2 })).toBe(
			"JavaScript polls earn 1.5× coverage — but if JavaScript shows, you must get 2 right."
		);
	});
});

describe("givesOf / needsOf", () => {
	it("derives a focus config's L1 copy — singular demand, base multiplier", () => {
		expect(givesOf(CONFIGS.js)).toBe(
			"Then JavaScript polls earn ×1.25 coverage"
		);
		expect(needsOf(CONFIGS.js)).toBe("Get 1 JavaScript poll right");
	});

	it("scales the copy with the config's level after an upgrade", () => {
		expect(givesOf({ ...CONFIGS.js, level: 2 })).toBe(
			"Then JavaScript polls earn ×1.5 coverage"
		);
		expect(needsOf({ ...CONFIGS.js, level: 2 })).toBe(
			"Get 2 JavaScript polls right"
		);
	});

	it("passes a non-focus config's authored copy through untouched", () => {
		expect(givesOf(CONFIGS.eslint)).toBe(CONFIGS.eslint.gives);
		expect(needsOf(CONFIGS.eslint)).toBe(CONFIGS.eslint.needs);
	});

	it("derives Unit Tests' gives from its level", () => {
		expect(givesOf(CONFIGS.unitTests)).toBe("Then +32KB on clear");
		expect(givesOf({ ...CONFIGS.unitTests, level: 3 })).toBe(
			"Then +96KB on clear"
		);
	});
});

describe("roster copy", () => {
	// The pipeline detail prints "No condition" when `needs` is missing — a
	// false claim for any config that actually backs a check. Every check
	// authors its demand on the roster, except the escalating "correct" check,
	// which reads its live text from the gate (DVTD-7wy6), and focus configs,
	// whose demand derives from their level (needsOf, DVTD-a6yf).
	it("authors a needs sentence on every config whose check demands one", () => {
		for (const config of CONFIG_LIST) {
			if (!config.check && !config.focusCategory) continue;
			if (config.check === "correct") continue;
			expect(
				needsOf(config),
				`${config.id} backs a check but has no needs copy`
			).toBeDefined();
		}
	});
});

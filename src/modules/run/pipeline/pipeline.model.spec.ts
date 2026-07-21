import { describe, expect, it } from "vitest";

import { Config } from "../configs/config.model";
import { CONFIGS } from "../configs/configRoster.model";
import {
	Pipeline,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	coverageProfileFor,
	effectiveRequirement,
	canLint,
	isBare,
	rewardMultiplierFor,
	stripConfig,
} from "./pipeline.model";

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "hyrule-ci",
	slots: 3,
	configs,
});

describe("coverageProfileFor", () => {
	it("returns the identity profile for a bare pipeline", () => {
		expect(coverageProfileFor(pipelineWith([]))).toEqual({ mult: 1, add: 0 });
	});

	it("multiplies Amplify coverage mults and sums flat adds across the build", () => {
		const profile = coverageProfileFor(
			pipelineWith([CONFIGS.copilot, CONFIGS.codeCoverage])
		);
		expect(profile.mult).toBe(2);
		expect(profile.add).toBe(0.5);
	});
});

describe("effectiveRequirement", () => {
	it("returns the base for a bare pipeline", () => {
		expect(effectiveRequirement(pipelineWith([]), 1)).toBe(1);
	});

	it("floors at 1", () => {
		expect(effectiveRequirement(pipelineWith([]), 0)).toBe(1);
	});
});

describe("rewardMultiplierFor", () => {
	it("multiplies an upgraded Unit Tests and Check payouts across the pipeline", () => {
		expect(
			rewardMultiplierFor(
				pipelineWith([{ ...CONFIGS.unitTests, level: 2 }, CONFIGS.coverageGain])
			)
		).toBe(3); // 2 (L2 Unit Tests) × 1.5 (Coverage)
	});

	it("is 1 for a bare pipeline", () => {
		expect(rewardMultiplierFor(pipelineWith([]))).toBe(1);
	});
});

describe("coverageForAnswer", () => {
	it("pays 1.5x in a Focus category, 1x outside it", () => {
		expect(coverageForAnswer([CONFIGS.js], "js", 1)).toBe(1.5);
		expect(coverageForAnswer([CONFIGS.js], "css", 1)).toBe(1);
	});

	it("stacks Focus and Amplify across the whole pipeline", () => {
		expect(coverageForAnswer([CONFIGS.js, CONFIGS.copilot], "js", 1)).toBe(3); // 1.5 × 2
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([{ ...CONFIGS.js, level: 2 }], "js", 1)).toBe(2);
		expect(coverageForAnswer([CONFIGS.js], "js", 0)).toBe(0);
	});

	it("pays a partial share proportionally, configs included", () => {
		// Half a multi-answer set demonstrated → half the Focus-boosted earn.
		expect(coverageForAnswer([CONFIGS.js], "js", 0.5)).toBe(0.8); // 1.5 / 2, rounded
	});

	it("applies the streak factor last, over base × configs", () => {
		// 1.5 (Focus) × 1.3 (streak 3) = 1.95, rounded to one decimal.
		expect(coverageForAnswer([CONFIGS.js], "js", 1, 1.3)).toBe(2);
		// A factor of 1 (no streak) leaves the earn unchanged.
		expect(coverageForAnswer([CONFIGS.js], "js", 1, 1)).toBe(1.5);
	});
});

describe("coverageBreakdownForAnswer", () => {
	it("gives a bare correct answer a base of 1 with no bonuses", () => {
		expect(coverageBreakdownForAnswer([], "js", 1, 1, 0)).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("splits an Amplify multiplier into its own config chip", () => {
		// Copilot ×2 on a base of 1 → +1 config chip, base stays 1.
		expect(
			coverageBreakdownForAnswer([CONFIGS.copilot], "js", 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "copilot", value: 1 }],
		});
	});

	it("splits a flat coverage add into its own config chip", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.codeCoverage], "js", 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "code-coverage", value: 0.5 }],
		});
	});

	it("pulls the streak factor into its own bonus over base + configs", () => {
		// Focus .js (1.5×) at streak 1.3: base 1, .js +0.5, streak +0.5 = 2.
		expect(coverageBreakdownForAnswer([CONFIGS.js], "js", 1, 1.3, 0)).toEqual({
			base: 1,
			streakBonus: 0.5,
			configBonuses: [{ configId: "js", value: 0.5 }],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
		// ESLint is defense, .js Focus is a no-op on a CSS poll — neither chips.
		expect(
			coverageBreakdownForAnswer([CONFIGS.eslint, CONFIGS.js], "css", 1, 1, 0)
		).toEqual({ base: 1, streakBonus: 0, configBonuses: [] });
	});

	it("carries a miss as a negative base with no bonuses", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.copilot], "js", 0, 1, 0.5)
		).toEqual({ base: -0.5, streakBonus: 0, configBonuses: [] });
	});

	it("keeps base + streak + configs summing to the engine's earned coverage", () => {
		const configs = [CONFIGS.copilot, CONFIGS.codeCoverage];
		const breakdown = coverageBreakdownForAnswer(configs, "js", 1, 1.3, 0);
		const sum =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((total, bonus) => total + bonus.value, 0);
		expect(Math.round(sum * 10) / 10).toBe(
			coverageForAnswer(configs, "js", 1, 1.3)
		);
	});
});

describe("canLint", () => {
	it("is true only for a linter that covers the poll's category", () => {
		expect(canLint([CONFIGS.eslint], "js")).toBe(true);
		expect(canLint([CONFIGS.eslint], "css")).toBe(false); // ESLint is JS/TS only
		expect(canLint([CONFIGS.stylelint], "css")).toBe(true);
		expect(canLint([CONFIGS.js, CONFIGS.copilot], "js")).toBe(false); // no linter
	});
});

describe("stripConfig and isBare", () => {
	it("peels a config and reports bareness", () => {
		expect(isBare(pipelineWith([]))).toBe(true);
		const stripped = stripConfig(
			pipelineWith([CONFIGS.js, CONFIGS.eslint]),
			"eslint"
		);
		expect(stripped.configs.map((config) => config.id)).toEqual(["js"]);
	});
});

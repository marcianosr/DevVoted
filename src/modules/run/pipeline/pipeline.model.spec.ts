import { describe, expect, it } from "vitest";

import { Config } from "../configs/config.model";
import { CONFIGS } from "../configs/configRoster.model";
import {
	Pipeline,
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

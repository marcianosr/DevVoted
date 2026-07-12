import { describe, expect, it } from "vitest";

import { Config } from "../configs/config";
import { CONFIGS } from "../configs/configRoster";
import {
	Pipeline,
	coverageForAnswer,
	disabledOptionIds,
	effectiveRequirement,
	canLint,
	isBare,
	rewardMultiplierFor,
	stripConfig,
} from "./pipeline";

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "hyrule-ci",
	slots: 3,
	configs,
});

const triOptions = [
	{ id: "a", correct: true },
	{ id: "b", correct: false },
	{ id: "c", correct: false },
];

describe("effectiveRequirement", () => {
	it("returns the base for a bare pipeline", () => {
		expect(effectiveRequirement(pipelineWith([]), 1)).toBe(1);
	});

	it("raises per Risk config and stacks them", () => {
		expect(effectiveRequirement(pipelineWith([CONFIGS.pushForce]), 1)).toBe(2);
		expect(
			effectiveRequirement(
				pipelineWith([CONFIGS.pushForce, CONFIGS.deployFriday]),
				1
			)
		).toBe(4);
	});

	it("cancels all raises when yarn.lock is equipped", () => {
		expect(
			effectiveRequirement(
				pipelineWith([CONFIGS.deployFriday, CONFIGS.yarnLock]),
				1
			)
		).toBe(1);
	});

	it("floors at 1", () => {
		expect(effectiveRequirement(pipelineWith([]), 0)).toBe(1);
	});
});

describe("rewardMultiplierFor", () => {
	it("multiplies Risk and Check payouts across the pipeline", () => {
		expect(
			rewardMultiplierFor(
				pipelineWith([CONFIGS.pushForce, CONFIGS.coverageGain])
			)
		).toBe(3); // 2 × 1.5
	});

	it("is 1 for a bare pipeline", () => {
		expect(rewardMultiplierFor(pipelineWith([]))).toBe(1);
	});
});

describe("coverageForAnswer", () => {
	it("pays 1.5x in a Focus category, 1x outside it", () => {
		expect(coverageForAnswer([CONFIGS.js], "js", true)).toBe(1.5);
		expect(coverageForAnswer([CONFIGS.js], "css", true)).toBe(1);
	});

	it("stacks Focus and Amplify across the whole pipeline", () => {
		expect(coverageForAnswer([CONFIGS.js, CONFIGS.copilot], "js", true)).toBe(
			3
		); // 1.5 × 2
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([{ ...CONFIGS.js, level: 2 }], "js", true)).toBe(
			2
		);
		expect(coverageForAnswer([CONFIGS.js], "js", false)).toBe(0);
	});
});

describe("canLint", () => {
	it("is true only when a linter config is equipped", () => {
		expect(canLint([CONFIGS.eslint])).toBe(true);
		expect(canLint([CONFIGS.js, CONFIGS.copilot])).toBe(false);
	});
});

describe("disabledOptionIds", () => {
	it("disables one wrong option on a matching category, keeping a correct one alive", () => {
		const off = disabledOptionIds([CONFIGS.eslint], "js", triOptions);
		expect(off.size).toBe(1);
		expect(off.has("a")).toBe(false); // never the correct option
	});

	it("disables nothing off-category", () => {
		expect(disabledOptionIds([CONFIGS.eslint], "css", triOptions).size).toBe(0);
	});

	it("keeps at least one wrong option on a 2-option poll", () => {
		expect(
			disabledOptionIds([CONFIGS.eslint], "js", [
				{ id: "a", correct: true },
				{ id: "b", correct: false },
			]).size
		).toBe(0);
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

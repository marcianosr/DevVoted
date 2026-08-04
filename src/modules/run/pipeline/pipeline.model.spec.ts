import { describe, expect, it } from "vitest";

import { Config } from "../configs/config.model";
import { CONFIGS } from "../configs/configRoster.model";
import { AnswerContext } from "../configs/effect.model";
import {
	Pipeline,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	coverageProfileFor,
	effectiveRequirement,
	canLint,
	isBare,
	pipelineModifiersFor,
	rewardMultiplierFor,
	storageOnClearFor,
	stripConfig,
} from "./pipeline.model";

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "hyrule-ci",
	slots: 3,
	configs,
});

const at = (
	category: AnswerContext["category"],
	answeredBefore = 1
): AnswerContext => ({ category, answeredBefore });

describe("coverageProfileFor", () => {
	it("returns the identity profile for a bare pipeline", () => {
		expect(coverageProfileFor([])).toEqual({ mult: 1, add: 0 });
	});

	it("multiplies coverage mults and sums flat adds across the build", () => {
		const profile = coverageProfileFor([CONFIGS.copilot, CONFIGS.codeCoverage]);
		expect(profile.mult).toBe(2);
		expect(profile.add).toBe(0.5);
	});

	it("counts Intellisense and Coverage as coverage configs now, not storage ones", () => {
		const profile = coverageProfileFor([
			CONFIGS.intellisense,
			CONFIGS.coverageGain,
		]);
		expect(profile.mult).toBe(3); // 1.5 × 2
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
	it("is 1 across the whole shipped roster — the check is the price of the effect, not a storage payout", () => {
		expect(
			rewardMultiplierFor([
				{ ...CONFIGS.unitTests, level: 2 },
				CONFIGS.coverageGain,
				CONFIGS.coldStart,
				CONFIGS.intellisense,
			])
		).toBe(1);
	});

	it("is 1 for a bare pipeline", () => {
		expect(rewardMultiplierFor([])).toBe(1);
	});
});

describe("storageOnClearFor", () => {
	it("is 0 for a bare pipeline and sums flat clear payouts", () => {
		expect(storageOnClearFor([])).toBe(0);
		expect(storageOnClearFor([CONFIGS.unitTests])).toBe(32);
		expect(storageOnClearFor([CONFIGS.unitTests, CONFIGS.copilot])).toBe(32);
	});
});

describe("pipelineModifiersFor", () => {
	it("prices a bare pipeline at the base gate reward with identity multipliers", () => {
		expect(pipelineModifiersFor([])).toEqual({
			gateReward: 80,
			rewardMultiplier: 1,
			coverageMultiplier: 1,
			coverageAdd: 0,
		});
	});

	it("folds flat clear payouts and coverage boosts into one modifier set", () => {
		// Unit Tests pays +32 on clear, Copilot doubles coverage — the same
		// numbers the configure preview shows before the config is slotted.
		expect(pipelineModifiersFor([CONFIGS.unitTests, CONFIGS.copilot])).toEqual({
			gateReward: 112,
			rewardMultiplier: 1,
			coverageMultiplier: 2,
			coverageAdd: 0,
		});
	});
});

describe("coverageForAnswer", () => {
	it("pays 1.25x in a Focus category (1.3 rounded), 1x outside it", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1)).toBe(1.3);
		expect(coverageForAnswer([CONFIGS.js], at("css"), 1)).toBe(1);
	});

	it("stacks Focus and Amplify across the whole pipeline", () => {
		expect(coverageForAnswer([CONFIGS.js, CONFIGS.copilot], at("js"), 1)).toBe(
			2.5
		); // 1.25 × 2
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([{ ...CONFIGS.js, level: 2 }], at("js"), 1)).toBe(
			1.5
		);
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0)).toBe(0);
	});

	it("pays a partial share proportionally, configs included", () => {
		// Half a multi-answer set demonstrated → half the Focus-boosted earn.
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0.5)).toBe(0.6); // 1.25 / 2, rounded
	});

	it("applies the streak factor last, over base × configs", () => {
		// 1.25 (Focus) × 1.3 (streak 3) = 1.625, rounded to one decimal.
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1, 1.3)).toBe(1.6);
		// A factor of 1 (no streak) leaves the earn unchanged (1.25 rounds to 1.3).
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1, 1)).toBe(1.3);
	});

	it("applies multipliers last, so a ×mult amplifies flat adds too", () => {
		// (1 base + 0.5 Code Coverage) × 2 Copilot = 3 — the +0.5 gets doubled.
		expect(
			coverageForAnswer([CONFIGS.copilot, CONFIGS.codeCoverage], at("js"), 1)
		).toBe(3);
	});

	it("doubles the window's opening answer with Cold Start, and only that one", () => {
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 0), 1)).toBe(2);
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 1), 1)).toBe(1);
	});
});

describe("coverageBreakdownForAnswer", () => {
	it("gives a bare correct answer a base of 1 with no bonuses", () => {
		expect(coverageBreakdownForAnswer([], at("js"), 1, 1, 0)).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("splits an Amplify multiplier into its own config chip", () => {
		// Copilot ×2 on a base of 1 → +1 config chip, base stays 1.
		expect(
			coverageBreakdownForAnswer([CONFIGS.copilot], at("js"), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "copilot", value: 1 }],
		});
	});

	it("splits a flat coverage add into its own config chip", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.codeCoverage], at("js"), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "code-coverage", value: 0.5 }],
		});
	});

	it("chips Cold Start on the opener and hides it afterwards", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 0), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "cold-start", value: 1 }],
		});
		// Off the opener Cold Start covers at ×1 → zero-value chip → filtered out.
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 1), 1, 1, 0)
		).toEqual({ base: 1, streakBonus: 0, configBonuses: [] });
	});

	it("pulls the streak factor into its own bonus over base + configs", () => {
		// Focus .js (1.25×) at streak 1.3: total 1.6 → base 1, .js +0.3, streak +0.3.
		expect(
			coverageBreakdownForAnswer([CONFIGS.js], at("js"), 1, 1.3, 0)
		).toEqual({
			base: 1,
			streakBonus: 0.3,
			configBonuses: [{ configId: "js", value: 0.3 }],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
		// ESLint is defense, .js Focus is a no-op on a CSS poll — neither chips.
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.eslint, CONFIGS.js],
				at("css"),
				1,
				1,
				0
			)
		).toEqual({ base: 1, streakBonus: 0, configBonuses: [] });
	});

	it("carries a miss as a negative base with no bonuses", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.copilot], at("js"), 0, 1, 0.5)
		).toEqual({ base: -0.5, streakBonus: 0, configBonuses: [] });
	});

	it("credits the multiplier chip when a ×mult amplifies a flat add, listing the mult last", () => {
		// (1 + 0.5) × 2 = 3: Code Coverage keeps its face +0.5, Copilot absorbs
		// the amplification (+1.5 = doubling base + add), base stays 1. Copilot is
		// the ×mult, so it lists after the flat add even though it's slotted first.
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.copilot, CONFIGS.codeCoverage],
				at("js"),
				1,
				1,
				0
			)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [
				{ configId: "code-coverage", value: 0.5 },
				{ configId: "copilot", value: 1.5 },
			],
		});
	});

	it("lists every flat-add config before every ×mult config, whatever the slot order", () => {
		const order = coverageBreakdownForAnswer(
			[CONFIGS.copilot, CONFIGS.codeCoverage],
			at("js"),
			1,
			1,
			0
		).configBonuses.map((bonus) => bonus.configId);
		// copilot is the ×mult, code-coverage the flat add → add first, mult last.
		expect(order).toEqual(["code-coverage", "copilot"]);
	});

	it("keeps base + streak + configs summing to the engine's earned coverage", () => {
		const configs = [CONFIGS.copilot, CONFIGS.codeCoverage];
		const breakdown = coverageBreakdownForAnswer(configs, at("js"), 1, 1.3, 0);
		const sum =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((total, bonus) => total + bonus.value, 0);
		expect(Math.round(sum * 10) / 10).toBe(
			coverageForAnswer(configs, at("js"), 1, 1.3)
		);
	});
});

describe("canLint", () => {
	it("is true only for a linter that covers the poll's category", () => {
		expect(canLint([CONFIGS.eslint], "js")).toBe(true);
		expect(canLint([CONFIGS.eslint], "ts")).toBe(true); // ESLint covers both JS and TS
		expect(canLint([CONFIGS.eslint], "css")).toBe(false);
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

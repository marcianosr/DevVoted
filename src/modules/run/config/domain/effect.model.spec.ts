import { describe, expect, it } from "vitest";

import { faucetKbPerCorrect } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	AnswerContext,
	effectOf,
} from "~/modules/run/config/domain/effect.model";

const answering = (
	category: AnswerContext["category"],
	answeredBefore = 1
): AnswerContext => ({ category, answeredBefore });

describe("effectOf — Focus", () => {
	it("pays its multiplier in-category and 1× outside it", () => {
		const effect = effectOf(CONFIGS.js);
		expect(effect.coverage?.(answering("js"))).toEqual({ mult: 1.25, add: 0 });
		expect(effect.coverage?.(answering("css"))).toEqual({ mult: 1, add: 0 });
	});

	it("scales with level", () => {
		expect(
			effectOf({ ...CONFIGS.js, level: 2 }).coverage?.(answering("js"))
		).toEqual({ mult: 1.5, add: 0 });
	});

	it("contributes no faucet or mask", () => {
		const effect = effectOf(CONFIGS.js);
		expect(faucetKbPerCorrect([CONFIGS.js])).toBe(0);
		expect(effect.maskWrongOn).toBeUndefined();
	});
});

describe("effectOf — coverage amplifiers", () => {
	it("Coverage doubles gains instead of paying a storage multiplier", () => {
		const effect = effectOf(CONFIGS.coverageGain);
		expect(effect.coverage?.(answering("css"))).toEqual({ mult: 2, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("Intellisense multiplies ALL coverage instead of storage rewards", () => {
		const effect = effectOf(CONFIGS.intellisense);
		expect(effect.coverage?.(answering("java"))).toEqual({ mult: 1.5, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("Code Coverage keeps its flat add", () => {
		expect(effectOf(CONFIGS.codeCoverage).coverage?.(answering("js"))).toEqual({
			mult: 1,
			add: 0.5,
		});
	});

	it("AGENTS.md doubles all coverage, no strings attached (ADR-035)", () => {
		expect(effectOf(CONFIGS.agentsMd).coverage?.(answering("css"))).toEqual({
			mult: 2,
			add: 0,
		});
	});
});

describe("effectOf — Cold Start", () => {
	it("doubles the window's opening answer only", () => {
		const effect = effectOf(CONFIGS.coldStart);
		expect(effect.coverage?.(answering("js", 0))).toEqual({ mult: 2, add: 0 });
		expect(effect.coverage?.(answering("js", 1))).toEqual({ mult: 1, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});
});

describe("effectOf — Overclock", () => {
	it("quadruples the window's opener and throttles every answer after it", () => {
		const effect = effectOf(CONFIGS.overclock);
		expect(effect.coverage?.(answering("js", 0))).toEqual({ mult: 4, add: 0 });
		expect(effect.coverage?.(answering("js", 1))).toEqual({
			mult: 0.5,
			add: 0,
		});
		expect(effect.coverage?.(answering("js", 4))).toEqual({
			mult: 0.5,
			add: 0,
		});
		expect(effect.rewardMultiplier).toBeUndefined();
	});
});

describe("effectOf — storage benefits", () => {
	it("IndexedDB faucets 8KB per correct answer", () => {
		expect(faucetKbPerCorrect([CONFIGS.indexedDb])).toBe(8);
	});

	it("Unit Tests pays flat storage on clear, scaling with level", () => {
		expect(effectOf(CONFIGS.unitTests).storageOnClear).toBe(32);
		expect(effectOf({ ...CONFIGS.unitTests, level: 3 }).storageOnClear).toBe(
			96
		);
		expect(effectOf(CONFIGS.unitTests).rewardMultiplier).toBeUndefined();
	});

	it("Moore's Law pays interest per level, with no balance floor (ADR-035)", () => {
		expect(effectOf(CONFIGS.mooresLaw).storageInterestPct).toBe(2);
		expect(
			effectOf({ ...CONFIGS.mooresLaw, level: 5 }).storageInterestPct
		).toBe(10);
	});
});

describe("effectOf — linters", () => {
	it("masks wrong options only in its categories", () => {
		const mask = effectOf(CONFIGS.eslint).maskWrongOn;
		expect(mask?.("js")).toBe(true);
		expect(mask?.("css")).toBe(false);
	});

	it("Stylelint reads only CSS", () => {
		const mask = effectOf(CONFIGS.stylelint).maskWrongOn;
		expect(mask?.("css")).toBe(true);
		expect(mask?.("js")).toBe(false);
	});
});

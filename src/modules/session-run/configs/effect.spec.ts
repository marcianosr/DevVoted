import { describe, expect, it } from "vitest";

import { CONFIGS } from "./configRoster";
import { EMPTY_WINDOW, effectOf, EffectContext } from "./effect";

const ctx = (
	overrides: Partial<EffectContext["window"]> = {},
	gatesCleared = 0
): EffectContext => ({
	window: { ...EMPTY_WINDOW, ...overrides },
	gatesCleared,
});

describe("effectOf — Focus", () => {
	it("pays its multiplier in-category and 1× outside it", () => {
		const effect = effectOf(CONFIGS.js);
		expect(effect.coverage?.("js")).toEqual({ mult: 1.5, add: 0 });
		expect(effect.coverage?.("css")).toEqual({ mult: 1, add: 0 });
	});

	it("scales with level", () => {
		expect(effectOf({ ...CONFIGS.js, level: 2 }).coverage?.("js")).toEqual({
			mult: 2,
			add: 0,
		});
	});

	it("adds a mastery gate-check: skipped until the category appears, then running/success", () => {
		const check = effectOf(CONFIGS.js).gateCheck;
		expect(check?.(ctx()).state).toBe("skipped"); // not seen
		expect(
			check?.(ctx({ byCategory: { js: { seen: 1, correct: 0 } } })).state
		).toBe("running");
		expect(
			check?.(ctx({ byCategory: { js: { seen: 1, correct: 1 } } })).state
		).toBe("success");
	});
});

describe("effectOf — Check configs", () => {
	it("Coverage contributes a threshold gate-check, a demand, and its reward multiplier", () => {
		const effect = effectOf(CONFIGS.coverageGain);
		expect(effect.rewardMultiplier).toBe(1.5);
		expect(effect.gateCheck?.(ctx({ coverageGained: 3 })).state).toBe(
			"running"
		); // 3% < 4%, window open
		expect(effect.gateCheck?.(ctx({ coverageGained: 4 })).state).toBe(
			"success"
		);
		expect(effect.demand?.(0)).toBe("+4% coverage this window");
	});

	it("Speed reads fast answers", () => {
		expect(effectOf(CONFIGS.speed).gateCheck?.(ctx({ fast: 2 })).state).toBe(
			"success"
		);
		expect(effectOf(CONFIGS.speed).gateCheck?.(ctx({ fast: 1 })).state).toBe(
			"running"
		);
	});

	it("escalates the Coverage threshold deeper in the climb", () => {
		expect(
			effectOf(CONFIGS.coverageGain).gateCheck?.(ctx({ coverageGained: 4 }, 2))
				.state
		).toBe("running"); // needs 4+1
	});
});

describe("effectOf — passive effects", () => {
	it("ESLint masks wrong options only in its categories", () => {
		const mask = effectOf(CONFIGS.eslint).maskWrongOn;
		expect(mask?.("js")).toBe(true);
		expect(mask?.("css")).toBe(false);
	});

	it("yarn.lock locks the bar; push --force raises it and pays", () => {
		expect(effectOf(CONFIGS.yarnLock).locksBar).toBe(true);
		expect(effectOf(CONFIGS.pushForce).requirementDelta).toBe(1);
		expect(effectOf(CONFIGS.pushForce).rewardMultiplier).toBe(2);
	});

	it("Copilot multiplies coverage; IndexedDB faucets storage", () => {
		expect(effectOf(CONFIGS.copilot).coverage?.("css")).toEqual({
			mult: 2,
			add: 0,
		});
		expect(effectOf(CONFIGS.indexedDb).faucetPerCorrect).toBe(8);
	});

	it("a plain Focus config contributes no requirement, faucet, or mask", () => {
		const effect = effectOf(CONFIGS.js);
		expect(effect.requirementDelta).toBeUndefined();
		expect(effect.faucetPerCorrect).toBeUndefined();
		expect(effect.maskWrongOn).toBeUndefined();
	});
});

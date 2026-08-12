import { describe, expect, it } from "vitest";

import { faucetKbPerCorrect } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	AnswerContext,
	EMPTY_WINDOW,
	effectOf,
	EffectContext,
} from "~/modules/run/config/domain/effect.model";

const ctx = (
	overrides: Partial<EffectContext["window"]> = {},
	gatesCleared = 0
): EffectContext => ({
	window: { ...EMPTY_WINDOW, ...overrides },
	gatesCleared,
});

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

	it("contributes no requirement, faucet, or mask", () => {
		const effect = effectOf(CONFIGS.js);
		expect(effect.requirementDelta).toBeUndefined();
		expect(faucetKbPerCorrect([CONFIGS.js])).toBe(0);
		expect(effect.maskWrongOn).toBeUndefined();
	});
});

describe("effectOf — Coverage", () => {
	it("doubles coverage gains instead of paying a storage multiplier", () => {
		const effect = effectOf(CONFIGS.coverageGain);
		expect(effect.coverage?.(answering("css"))).toEqual({ mult: 2, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("demands +1% this window, without escalating deeper in the climb", () => {
		const effect = effectOf(CONFIGS.coverageGain);
		expect(effect.gateCheck?.(ctx({ coverageGained: 0.5 })).state).toBe(
			"running"
		);
		expect(effect.gateCheck?.(ctx({ coverageGained: 1 })).state).toBe(
			"success"
		);
		expect(effect.gateCheck?.(ctx({ coverageGained: 1 }, 4)).state).toBe(
			"success"
		); // gate 5: still 1%, only the baseline Correct check escalates
		expect(effect.demand?.(4)).toBe("+1% coverage this window");
	});
});

describe("effectOf — Cold Start", () => {
	it("doubles the window's opening answer only", () => {
		const effect = effectOf(CONFIGS.coldStart);
		expect(effect.coverage?.(answering("js", 0))).toEqual({ mult: 2, add: 0 });
		expect(effect.coverage?.(answering("js", 1))).toEqual({ mult: 1, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("checks the first answer: success once landed, failed the moment it misses", () => {
		const check = effectOf(CONFIGS.coldStart).gateCheck;
		expect(check?.(ctx()).state).toBe("running");
		expect(check?.(ctx({ answered: 1, leadingCorrect: 1 })).state).toBe(
			"success"
		);
		expect(
			check?.(ctx({ answered: 1, correct: 0, leadingCorrect: 0 })).state
		).toBe("failed");
	});
});

describe("effectOf — IndexedDB", () => {
	it("faucets storage AND demands 3 correct this window", () => {
		const effect = effectOf(CONFIGS.indexedDb);
		expect(faucetKbPerCorrect([CONFIGS.indexedDb])).toBe(8);
		expect(effect.gateCheck?.(ctx({ correct: 2, answered: 4 })).state).toBe(
			"running"
		);
		expect(effect.gateCheck?.(ctx({ correct: 3, answered: 3 })).state).toBe(
			"success"
		);
		expect(effect.gateCheck?.(ctx({ correct: 2, answered: 5 })).state).toBe(
			"failed"
		);
	});
});

describe("effectOf — Code Coverage", () => {
	it("keeps its flat add and stays provisional while the window is open", () => {
		const effect = effectOf(CONFIGS.codeCoverage);
		expect(effect.coverage?.(answering("js"))).toEqual({ mult: 1, add: 0.5 });
		expect(
			effect.gateCheck?.(ctx({ answered: 3, maxMissStreak: 1 })).state
		).toBe("running"); // clean so far is provisional, never an early success
	});

	it("fails the moment two consecutive misses land — and stays failed", () => {
		const check = effectOf(CONFIGS.codeCoverage).gateCheck;
		expect(check?.(ctx({ answered: 2, maxMissStreak: 2 })).state).toBe(
			"failed"
		);
		// a later correct answer never cleans the record
		expect(
			check?.(ctx({ answered: 4, correct: 2, missStreak: 0, maxMissStreak: 2 }))
				.state
		).toBe("failed");
	});

	it("succeeds only once the window closes without a double miss", () => {
		expect(
			effectOf(CONFIGS.codeCoverage).gateCheck?.(
				ctx({ answered: 5, correct: 3, maxMissStreak: 1 })
			).state
		).toBe("success");
	});

	it("reports no progress on a clean streak, a warning after one miss", () => {
		const check = effectOf(CONFIGS.codeCoverage).gateCheck;
		// The running dot already says all is well — no "steady" remark.
		expect(check?.(ctx({ answered: 2, missStreak: 0 })).progress).toBe(
			undefined
		);
		expect(
			check?.(ctx({ answered: 2, missStreak: 1, maxMissStreak: 1 })).progress
		).toBe("1 miss — the next one fails");
	});
});

describe("effectOf — Intellisense", () => {
	it("multiplies ALL coverage instead of storage rewards", () => {
		const effect = effectOf(CONFIGS.intellisense);
		expect(effect.coverage?.(answering("java"))).toEqual({
			mult: 1.5,
			add: 0,
		});
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("demands coverage gained in 2 categories this window", () => {
		const check = effectOf(CONFIGS.intellisense).gateCheck;
		const oneCategory = { js: { seen: 2, correct: 2, gained: 3 } };
		const twoCategories = {
			js: { seen: 2, correct: 2, gained: 3 },
			css: { seen: 1, correct: 1, gained: 1.2 },
		};
		expect(check?.(ctx({ byCategory: oneCategory, answered: 3 })).state).toBe(
			"running"
		);
		expect(check?.(ctx({ byCategory: twoCategories, answered: 3 })).state).toBe(
			"success"
		);
		expect(check?.(ctx({ byCategory: oneCategory, answered: 5 })).state).toBe(
			"failed"
		);
	});
});

describe("effectOf — linters", () => {
	it("masks wrong options only in its categories", () => {
		const mask = effectOf(CONFIGS.eslint).maskWrongOn;
		expect(mask?.("js")).toBe(true);
		expect(mask?.("css")).toBe(false);
	});

	it("skips only when none of its categories appeared, never because linting was declined", () => {
		const check = effectOf(CONFIGS.eslint).gateCheck;
		expect(check?.(ctx()).state).toBe("skipped");
		// The player answered a JS poll and chose not to lint it. Pre-ADR-022 this
		// also read "skipped", which is the freeloader hole: never spend, never owe.
		expect(
			check?.(ctx({ byCategory: { js: { seen: 1, correct: 0 } }, answered: 1 }))
				.state
		).not.toBe("skipped");
	});

	it("counts either of its categories toward one demand", () => {
		const check = effectOf(CONFIGS.eslint).gateCheck;
		expect(
			check?.(ctx({ byCategory: { ts: { seen: 1, correct: 1 } }, answered: 5 }))
				.state
		).toBe("success");
		expect(
			check?.(ctx({ byCategory: { js: { seen: 1, correct: 1 } }, answered: 5 }))
				.state
		).toBe("success");
	});

	it("fails a window that saw its category and got none right", () => {
		expect(
			effectOf(CONFIGS.eslint).gateCheck?.(
				ctx({ byCategory: { js: { seen: 2, correct: 0 } }, answered: 5 })
			).state
		).toBe("failed");
	});

	it("reads only its own categories", () => {
		expect(
			effectOf(CONFIGS.stylelint).gateCheck?.(
				ctx({ byCategory: { js: { seen: 1, correct: 0 } }, answered: 5 })
			).state
		).toBe("skipped");
	});

	it("demands nothing extra for linting, so an unaffordable window is never fatal", () => {
		expect(effectOf(CONFIGS.eslint).demand?.(0)).toBe(
			"ESLint: get one right if js or ts appears"
		);
	});
});

describe("effectOf — Unit Tests & AGENTS.md", () => {
	it("Unit Tests pays flat storage on clear — level never touches the multiplier", () => {
		const effect = effectOf(CONFIGS.unitTests);
		expect(effect.storageOnClear).toBe(32);
		expect(effect.rewardMultiplier).toBeUndefined();
		expect(
			effectOf({ ...CONFIGS.unitTests, level: 3 }).rewardMultiplier
		).toBeUndefined();
		// the baseline Correct check is synthesized in gate.model, not here
		expect(effect.gateCheck).toBeUndefined();
	});

	it("AGENTS.md doubles coverage and owes one correct answer for it", () => {
		// No longer the checkless exception (ADR-022): a config that owes nothing
		// let a build clear gates on 0/5. Its check is light because the 256KB
		// legendary draft price already is most of what it costs, but it is
		// unconditional — the draw can never excuse it.
		const effect = effectOf(CONFIGS.agentsMd);
		expect(effect.coverage?.(answering("css"))).toEqual({ mult: 2, add: 0 });
		expect(effect.demand?.(0)).toBe("1 correct answer this window");
		expect(
			effect.gateCheck?.({ window: EMPTY_WINDOW, gatesCleared: 0 })
		).toMatchObject({ label: "AGENTS.md", current: 0, target: 1 });
	});
});

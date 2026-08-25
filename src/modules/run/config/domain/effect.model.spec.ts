import { describe, expect, it } from "vitest";

import { faucetKbPerCorrect } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { FAUCET_CAP_KB } from "~/modules/run/run/domain/rules.model";
import {
	AnswerContext,
	configStatusFor,
	effectOf,
	type PollStatusContext,
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

const onPoll = (
	category: AnswerContext["category"],
	answeredBefore = 1,
	extras: Partial<PollStatusContext> = {}
): PollStatusContext => ({
	category,
	answeredBefore,
	suppressingAudit: false,
	faucetRemainingKb: FAUCET_CAP_KB,
	...extras,
});

describe("configStatusFor — offline", () => {
	it("names the audit holding the config down, whatever the config would do", () => {
		expect(
			configStatusFor(
				CONFIGS.intellisense,
				onPoll("js", 1, { offlineAudit: "Dependency Outage" })
			)
		).toEqual({ kind: "offline", audit: "Dependency Outage" });
	});
});

describe("configStatusFor — online", () => {
	it("puts a Focus config online only on its own category", () => {
		expect(configStatusFor(CONFIGS.js, onPoll("js"))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.js, onPoll("css"))).toEqual({
			kind: "skipped",
			why: { kind: "otherCategories", categories: ["js"] },
		});
	});

	it("keeps a flat coverage multiplier online on every poll", () => {
		expect(configStatusFor(CONFIGS.intellisense, onPoll("css"))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.codeCoverage, onPoll("css"))).toEqual({
			kind: "online",
		});
	});

	it("puts a linter online on the categories it can cross out in", () => {
		expect(configStatusFor(CONFIGS.eslint, onPoll("ts"))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.eslint, onPoll("css"))).toEqual({
			kind: "skipped",
			why: { kind: "otherCategories", categories: ["js", "ts"] },
		});
	});

	it("counts a per-answer payout and a sellable peek as work on this poll", () => {
		expect(configStatusFor(CONFIGS.indexedDb, onPoll("git"))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.telemetry, onPoll("git"))).toEqual({
			kind: "online",
		});
	});

	it("throttles Overclock online after the opener, because ×0.5 is still a change", () => {
		expect(configStatusFor(CONFIGS.overclock, onPoll("js", 0))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.overclock, onPoll("js", 3))).toEqual({
			kind: "online",
		});
	});

	it("holds Cold Start to the opener, where its multiplier is the whole effect", () => {
		expect(configStatusFor(CONFIGS.coldStart, onPoll("js", 0))).toEqual({
			kind: "online",
		});
		expect(configStatusFor(CONFIGS.coldStart, onPoll("js", 2))).toEqual({
			kind: "skipped",
			why: { kind: "openerOnly" },
		});
	});

	it("puts Volkswagen CI online only where there is an audit to suppress", () => {
		expect(
			configStatusFor(
				CONFIGS.volkswagenCi,
				onPoll("js", 1, { suppressingAudit: true })
			)
		).toEqual({ kind: "online" });
		expect(configStatusFor(CONFIGS.volkswagenCi, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "noAuditToSuppress" },
		});
	});
});

describe("configStatusFor — skipped", () => {
	it("names the gate clear for the configs that pay there", () => {
		expect(configStatusFor(CONFIGS.unitTests, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysAtGateClear" },
		});
		expect(configStatusFor(CONFIGS.mooresLaw, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysAtGateClear" },
		});
		expect(configStatusFor(CONFIGS.dependabot, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysAtGateClear" },
		});
	});

	it("leads with Freemium's bill rather than its shop discount", () => {
		expect(configStatusFor(CONFIGS.freemium, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "billsAtGateClear" },
		});
	});

	it("sends a shop-only config to the shop", () => {
		expect(configStatusFor(CONFIGS.wtfpl, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "inShop" },
		});
	});

	it("keeps Prefetch online, because the reveal is on screen while answering", () => {
		expect(configStatusFor(CONFIGS.prefetch, onPoll("js"))).toEqual({
			kind: "online",
		});
	});

	it("skips a fully decayed Deprecated, which multiplies nothing at ×1", () => {
		expect(
			configStatusFor(
				{ ...CONFIGS.deprecated, coverageMultiplier: 1 },
				onPoll("js")
			)
		).toEqual({ kind: "skipped", why: { kind: "notThisPoll" } });
	});

	// The rate never changes, so the row would keep advertising +8KB on a run
	// that cannot pay it. The budget is what went to zero, and it is what the
	// player needs told.
	it("skips IndexedDB once the run's faucet allowance is spent", () => {
		expect(
			configStatusFor(
				CONFIGS.indexedDb,
				onPoll("git", 1, { faucetRemainingKb: 0 })
			)
		).toEqual({ kind: "skipped", why: { kind: "runCapReached" } });
	});

	it("keeps IndexedDB online while any of the allowance is left", () => {
		expect(
			configStatusFor(
				CONFIGS.indexedDb,
				onPoll("git", 1, { faucetRemainingKb: 8 })
			)
		).toEqual({ kind: "online" });
	});
});

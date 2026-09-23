import { describe, expect, it } from "vitest";

import {
	faucetKbPerCorrect,
	minify,
} from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { FAUCET_CAP_KB } from "~/modules/run/run/domain/rules.model";
import {
	AnswerContext,
	effectOf,
} from "~/modules/run/config/domain/effect.model";
import {
	configStatusFor,
	type PollStatusContext,
} from "~/modules/run/config/domain/configStatus.model";

const answering = (
	category: AnswerContext["category"],
	answeredBefore = 1
): AnswerContext => ({
	category,
	answerType: "single",
	answeredBefore,
	cachedHits: 0,
	previouslyMissed: false,
});

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
	it("Intellisense multiplies ALL coverage instead of storage rewards", () => {
		const effect = effectOf(CONFIGS.intellisense);
		expect(effect.coverage?.(answering("java"))).toEqual({ mult: 1.5, add: 0 });
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("Code Coverage keeps its flat add", () => {
		expect(effectOf(CONFIGS.codeCoverage).coverage?.(answering("js"))).toEqual({
			mult: 1,
			add: 0.1,
		});
	});

	it("AGENTS.md doubles all coverage, no strings attached (ADR-035)", () => {
		expect(effectOf(CONFIGS.agentsMd).coverage?.(answering("css"))).toEqual({
			mult: 2,
			add: 0,
		});
	});
});

describe("effectOf — Cache", () => {
	const warm = (category: AnswerContext["category"], cachedHits: number) => ({
		...answering(category),
		cachedHits,
	});

	it("pays nothing cold and a quarter unit more per cached hit", () => {
		const effect = effectOf(CONFIGS.cache);
		expect(effect.coverage?.(warm("js", 0))).toEqual({ mult: 1, add: 0 });
		expect(effect.coverage?.(warm("js", 2))).toEqual({ mult: 1, add: 0.5 });
	});

	it("tops out at one unit however warm the category runs", () => {
		expect(effectOf(CONFIGS.cache).coverage?.(warm("js", 9))).toEqual({
			mult: 1,
			add: 1,
		});
	});

	it("contributes no storage payout", () => {
		const effect = effectOf(CONFIGS.cache);
		expect(effect.rewardMultiplier).toBeUndefined();
		expect(effect.storageOnClear).toBeUndefined();
	});
});

describe("effectOf — .prettierrc", () => {
	const onMultiple = (): AnswerContext => ({
		...answering("js"),
		answerType: "multiple",
	});

	it("adds the fraction a half unit needs to reach a whole one", () => {
		expect(effectOf(CONFIGS.prettierrc).coverage?.(onMultiple(), 0.5)).toEqual({
			mult: 1,
			add: 0.5,
		});
	});

	it("adds nothing to a figure that is already whole", () => {
		const effect = effectOf(CONFIGS.prettierrc);
		expect(effect.coverage?.(onMultiple(), 1)).toEqual({ mult: 1, add: 0 });
		expect(effect.coverage?.(onMultiple(), 2)).toEqual({ mult: 1, add: 0 });
	});

	it("adds nothing when no answer has been scored yet", () => {
		expect(effectOf(CONFIGS.prettierrc).coverage?.(onMultiple())).toEqual({
			mult: 1,
			add: 0,
		});
	});

	it("never multiplies, so the top-up cannot be amplified", () => {
		expect(
			effectOf(CONFIGS.prettierrc).coverage?.(onMultiple(), 0.5)?.mult
		).toBe(1);
	});
});

describe("effectOf — Cold Start", () => {
	it("pays nothing for the window's opener and ×1.5 for every answer after", () => {
		const effect = effectOf(CONFIGS.coldStart);
		expect(effect.coverage?.(answering("js", 0))).toEqual({ mult: 0, add: 0 });
		expect(effect.coverage?.(answering("js", 1))).toEqual({
			mult: 1.5,
			add: 0,
		});
		expect(effect.rewardMultiplier).toBeUndefined();
	});

	it("keeps the dead opener dead when minified, since a cost is never halved", () => {
		const effect = effectOf(minify(CONFIGS.coldStart));
		expect(effect.coverage?.(answering("js", 0))).toEqual({ mult: 0, add: 0 });
		expect(effect.coverage?.(answering("js", 1))).toEqual({
			mult: 1.25,
			add: 0,
		});
	});
});

describe("effectOf — Regression Test", () => {
	const missed = (category: AnswerContext["category"]): AnswerContext => ({
		...answering(category),
		previouslyMissed: true,
	});

	it("doubles a poll this account has missed before, and only that poll", () => {
		const effect = effectOf(CONFIGS.regressionTest);
		expect(effect.coverage?.(missed("js"))).toEqual({ mult: 2, add: 0 });
		expect(effect.coverage?.(answering("js"))).toEqual({ mult: 1, add: 0 });
	});

	it("halves the bonus when minified, since the doubling is what it pays", () => {
		const effect = effectOf(minify(CONFIGS.regressionTest));
		expect(effect.coverage?.(missed("js"))).toEqual({ mult: 1.5, add: 0 });
	});

	it("reads on any category, since a miss is not a subject", () => {
		const effect = effectOf(CONFIGS.regressionTest);
		expect(effect.coverage?.(missed("css"))).toEqual({ mult: 2, add: 0 });
		expect(effect.coverage?.(missed("java"))).toEqual({ mult: 2, add: 0 });
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
	answerType: "single",
	answeredBefore,
	cachedHits: 0,
	previouslyMissed: false,
	suppressingAudit: false,
	pendingKb: 0,
	faucetRemainingKb: FAUCET_CAP_KB,
	autoUpgradeProgress: 0,
	...extras,
});

describe("configStatusFor — offline", () => {
	it("names the audit holding the config down, whatever the config would do", () => {
		expect(
			configStatusFor(
				CONFIGS.intellisense,
				onPoll("js", 1, { offlineAudit: "424 Failed Dependency" })
			)
		).toEqual({ kind: "offline", audit: "424 Failed Dependency" });
	});
});

describe("configStatusFor — coverage on the online arm", () => {
	it("carries the multiplier a Focus config is applying to this poll", () => {
		expect(configStatusFor(CONFIGS.js, onPoll("js"))).toEqual({
			kind: "online",
			coverage: { mult: 1.25, add: 0 },
		});
	});

	it("carries the units a flat adder is contributing", () => {
		expect(configStatusFor(CONFIGS.codeCoverage, onPoll("css"))).toEqual({
			kind: "online",
			coverage: { mult: 1, add: 0.1 },
		});
	});

	it("leaves the coverage off a config online for some other reason", () => {
		expect(configStatusFor(CONFIGS.eslint, onPoll("ts"))).toEqual({
			kind: "online",
		});
	});
});

describe("configStatusFor — online", () => {
	it("puts a Focus config online only on its own category", () => {
		expect(configStatusFor(CONFIGS.js, onPoll("js")).kind).toBe("online");
		expect(configStatusFor(CONFIGS.js, onPoll("css"))).toEqual({
			kind: "skipped",
			why: { kind: "otherCategories", categories: ["js"] },
		});
	});

	it("puts Cache online once the category is warm and skips it cold", () => {
		expect(
			configStatusFor(CONFIGS.cache, onPoll("js", 1, { cachedHits: 1 })).kind
		).toBe("online");
		expect(configStatusFor(CONFIGS.cache, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "cacheCold" },
		});
	});

	it("keeps a flat coverage multiplier online on every poll", () => {
		expect(configStatusFor(CONFIGS.intellisense, onPoll("css")).kind).toBe(
			"online"
		);
		expect(configStatusFor(CONFIGS.codeCoverage, onPoll("css")).kind).toBe(
			"online"
		);
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
		expect(configStatusFor(CONFIGS.overclock, onPoll("js", 0)).kind).toBe(
			"online"
		);
		expect(configStatusFor(CONFIGS.overclock, onPoll("js", 3)).kind).toBe(
			"online"
		);
	});

	it("keeps Cold Start online all window, since every answer reads its factor", () => {
		expect(configStatusFor(CONFIGS.coldStart, onPoll("js", 0)).kind).toBe(
			"online"
		);
		expect(configStatusFor(CONFIGS.coldStart, onPoll("js", 2)).kind).toBe(
			"online"
		);
	});

	it("holds Regression Test to polls this account has missed before", () => {
		expect(
			configStatusFor(
				CONFIGS.regressionTest,
				onPoll("js", 1, { previouslyMissed: true })
			).kind
		).toBe("online");
		expect(configStatusFor(CONFIGS.regressionTest, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "missedOnly" },
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
	it("names the peel for the collector, which never fires on a poll", () => {
		expect(configStatusFor(CONFIGS.garbageCollection, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysOnPeel" },
		});
	});

	it("names the gate clear for the configs that pay there", () => {
		expect(configStatusFor(CONFIGS.unitTests, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysAtGateClear" },
		});
		expect(configStatusFor(CONFIGS.mooresLaw, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "paysAtGateClear" },
		});
	});

	it("tells .prettierrc it is waiting for a select-all on a single-answer poll", () => {
		expect(configStatusFor(CONFIGS.prettierrc, onPoll("js"))).toEqual({
			kind: "skipped",
			why: { kind: "selectAllOnly" },
		});
	});

	it("tells .prettierrc the answer decides on a select-all poll", () => {
		expect(
			configStatusFor(
				CONFIGS.prettierrc,
				onPoll("js", 1, { answerType: "multiple" })
			)
		).toEqual({ kind: "skipped", why: { kind: "paysOnPartial" } });
	});

	it("refuses to tell .prettierrc the answer type at the 207 gate — the status would leak it", () => {
		expect(
			configStatusFor(
				CONFIGS.prettierrc,
				onPoll("js", 1, { answerTypeHidden: true })
			)
		).toEqual({ kind: "unknown" });
		expect(
			configStatusFor(
				CONFIGS.prettierrc,
				onPoll("js", 1, { answerType: "multiple", answerTypeHidden: true })
			)
		).toEqual({ kind: "unknown" });
	});

	it("keeps a category-blind config honest at the 207 gate — only the answer type is withheld", () => {
		expect(
			configStatusFor(
				CONFIGS.unitTests,
				onPoll("js", 1, { answerTypeHidden: true })
			)
		).toEqual({ kind: "skipped", why: { kind: "paysAtGateClear" } });
	});

	it("keeps Dependabot online on every poll — the answer counts either way", () => {
		expect(configStatusFor(CONFIGS.dependabot, onPoll("js"))).toEqual({
			kind: "online",
			bumpIn: 5,
		});
		expect(configStatusFor(CONFIGS.dependabot, onPoll("ruby"))).toEqual({
			kind: "online",
			bumpIn: 5,
		});
	});

	it("counts Dependabot's streak down towards the free upgrade", () => {
		expect(
			configStatusFor(
				CONFIGS.dependabot,
				onPoll("js", 1, { autoUpgradeProgress: 4 })
			)
		).toEqual({ kind: "online", bumpIn: 1 });
	});

	it("shortens the count at v2, where four in a row already pay", () => {
		expect(
			configStatusFor(
				{ ...CONFIGS.dependabot, level: 2 },
				onPoll("js", 1, { autoUpgradeProgress: 2 })
			)
		).toEqual({ kind: "online", bumpIn: 2 });
	});

	it("leaves a config that bumps nothing without a count", () => {
		expect(
			configStatusFor(CONFIGS.js, onPoll("js", 1, { autoUpgradeProgress: 3 }))
		).toEqual({ kind: "online", coverage: { mult: 1.25, add: 0 } });
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

	it("skips Database on the same spent allowance", () => {
		expect(
			configStatusFor(
				CONFIGS.database,
				onPoll("git", 1, { faucetRemainingKb: 0 })
			)
		).toEqual({ kind: "skipped", why: { kind: "runCapReached" } });
	});
});

describe("configStatusFor — an open transaction states what it holds", () => {
	it("carries the KB Database is holding on this poll", () => {
		expect(
			configStatusFor(CONFIGS.database, onPoll("git", 1, { pendingKb: 24 }))
		).toEqual({ kind: "online", holdingKb: 24 });
	});

	it("says nothing while the transaction is empty", () => {
		expect(
			configStatusFor(CONFIGS.database, onPoll("git", 1, { pendingKb: 0 }))
		).toEqual({ kind: "online" });
	});

	it("never lets a plain faucet claim the figure", () => {
		expect(
			configStatusFor(CONFIGS.indexedDb, onPoll("git", 1, { pendingKb: 24 }))
		).toEqual({ kind: "online" });
	});
});

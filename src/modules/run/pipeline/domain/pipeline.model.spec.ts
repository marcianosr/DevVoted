import { describe, expect, it } from "vitest";

import {
	SLICE_WINDOW,
	roundToOneDecimal,
	streakMultiplier,
	VICTORY_GATE,
	WRONG_COVERAGE_LOSS,
} from "~/modules/run/run/domain/rules.model";
import { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { AnswerContext } from "~/modules/run/config/domain/effect.model";
import {
	Pipeline,
	BASE_SLOTS,
	MAX_SLOTS,
	coverageBreakdownForAnswer,
	coverageForAnswer,
	gateClearPayout,
	canLint,
	extraPickPayoutFor,
	isBare,
	isSlotUnlocked,
	nextSlotUnlockFor,
	perAnswerPreviewFor,
	pipelineModifiersFor,
	rewardMultiplierFor,
	SLOT_UNLOCKS,
	slotsFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";

describe("slots open on gates, coverage, or either (ADR-041)", () => {
	const bare = { gatesCleared: 0, coverage: 0 };

	it("starts at three and holds there until the first grant lands", () => {
		expect(slotsFor(bare)).toBe(BASE_SLOTS);
		expect(slotsFor({ gatesCleared: 1, coverage: 0 })).toBe(BASE_SLOTS);
	});

	it("grants a slot for clearing gate 1, the first gate that pays width", () => {
		expect(slotsFor({ gatesCleared: 2, coverage: 0 })).toBe(4);
	});

	it("grants a slot on coverage alone, with no gate cleared for it", () => {
		expect(slotsFor({ gatesCleared: 0, coverage: 60 })).toBe(4);
		expect(slotsFor({ gatesCleared: 0, coverage: 240 })).toBe(6);
	});

	it("counts a grant earned out of order as width now, not width owed", () => {
		// Coverage 60 is slot 6's row, but only two grants are in hand.
		expect(slotsFor({ gatesCleared: 2, coverage: 60 })).toBe(5);
	});

	it("opens an either-or grant from whichever route arrives", () => {
		const [either] = SLOT_UNLOCKS.filter((unlock) => unlock.slot === 10);

		expect(isSlotUnlocked(either, { gatesCleared: 11, coverage: 0 })).toBe(
			true
		);
		expect(isSlotUnlocked(either, { gatesCleared: 0, coverage: 300 })).toBe(
			true
		);
		expect(isSlotUnlocked(either, { gatesCleared: 10, coverage: 299 })).toBe(
			false
		);
	});

	it("caps a run that clears everything and covers everything", () => {
		expect(slotsFor({ gatesCleared: 13, coverage: 400 })).toBe(MAX_SLOTS);
	});

	it("names what opens the next slot, and nothing at the cap", () => {
		expect(nextSlotUnlockFor(bare, BASE_SLOTS)).toEqual({ slot: 4, gate: 1 });
		expect(
			nextSlotUnlockFor({ gatesCleared: 13, coverage: 400 }, MAX_SLOTS)
		).toBeNull();
	});

	it("skips a grant the width already covers, so a coverage dip re-advertises nothing", () => {
		// 60% banked slot 6, then a miss dropped coverage back under it.
		const dipped = { gatesCleared: 0, coverage: 58 };

		expect(nextSlotUnlockFor(dipped, 4)).toEqual({ slot: 5, gate: 3 });
	});
});

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "hyrule-ci",
	slots: 3,
	configs,
});

const at = (
	category: AnswerContext["category"],
	answeredBefore = 1
): AnswerContext => ({ category, answeredBefore });

describe("rewardMultiplierFor", () => {
	it("is 1 across the whole shipped roster — configs pay in coverage or KB, never in a storage multiplier", () => {
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

describe("pipelineModifiersFor", () => {
	it("prices a bare pipeline at the opening gate's reward with identity multipliers", () => {
		expect(pipelineModifiersFor([], 0)).toEqual({
			gateReward: 32,
			rewardMultiplier: 1,
			coverageMultiplier: 1,
			coverageAdd: 0,
		});
	});

	// The clear payout rides the `gatesCleared + 1` curve, so a preview that
	// ignored the gate understated it by the whole multiplier — the receipt read
	// 32KB at Cascade where the clear actually pays 96KB.
	it("prices the clear against the gate being previewed, not the base", () => {
		expect(pipelineModifiersFor([], 1).gateReward).toBe(64);
		expect(pipelineModifiersFor([], 2).gateReward).toBe(96);
	});

	it("agrees with what a full window actually pays", () => {
		const configs = [CONFIGS.unitTests, CONFIGS.agentsMd];
		for (const gate of [0, 1, 5, 12])
			expect(pipelineModifiersFor(configs, gate).gateReward).toBe(
				gateClearPayout(configs, SLICE_WINDOW, gate)
			);
	});

	it("folds flat clear payouts and coverage boosts into one modifier set", () => {
		// Unit Tests pays +32 on clear, AGENTS.md doubles coverage — the same
		// numbers the configure preview shows before the config is slotted.
		expect(
			pipelineModifiersFor([CONFIGS.unitTests, CONFIGS.agentsMd], 0)
		).toEqual({
			gateReward: 64,
			rewardMultiplier: 1,
			coverageMultiplier: 2,
			coverageAdd: 0,
		});
	});

	it("multiplies coverage mults across the build instead of summing them", () => {
		expect(
			pipelineModifiersFor([CONFIGS.intellisense, CONFIGS.coverageGain], 0)
				.coverageMultiplier
		).toBe(3); // 1.5 × 2
	});
});

describe("perAnswerPreviewFor", () => {
	it("prices a bare pipeline at gate 0: 1 coverage, no storage, no matching-config bonus", () => {
		expect(perAnswerPreviewFor([], 0)).toEqual({
			coveragePerCorrect: 1,
			coveragePerWrong: -0.5,
			storageKbPerCorrect: 0,
			matchingConfigMultiplier: undefined,
			streakStepMultiplier: streakMultiplier(1),
		});
	});

	// The base is a number no correct answer ever pays: the first one already
	// carries a streak step, so the receipt has to state it (ADR-040).
	it("carries the streak step, since even the first correct answer rides one", () => {
		expect(perAnswerPreviewFor([], 0).streakStepMultiplier).toBe(1.1);
	});

	it("scales coverage with gate depth, riding the same curve as gateClearPayout", () => {
		expect(perAnswerPreviewFor([], 4).coveragePerCorrect).toBe(5); // gate 4: ×5
	});

	it("folds in build-wide coverage mults/adds, excluding Focus bonuses", () => {
		// AGENTS.md doubles coverage, Code Coverage adds +0.5 flat: (1 + 0.5) × 2.
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], 0)
				.coveragePerCorrect
		).toBe(3);
	});

	// The whole point of pricing the bleed off the earn: a miss costs the same
	// fraction of an answer whatever the build, so stacking multipliers can no
	// longer buy near-immunity to being wrong.
	it("takes a fixed share of what a correct answer pays, on any build", () => {
		for (const configs of [
			[],
			[CONFIGS.codeCoverage],
			[CONFIGS.agentsMd],
			[CONFIGS.agentsMd, CONFIGS.codeCoverage],
		]) {
			const { coveragePerCorrect, coveragePerWrong } = perAnswerPreviewFor(
				configs,
				4
			);

			expect(-coveragePerWrong).toBe(
				roundToOneDecimal(WRONG_COVERAGE_LOSS * coveragePerCorrect)
			);
		}
	});

	it("scales the bleed with the gate, as the earn does", () => {
		// Gate 4 pays ×5, so it bleeds ×5 too.
		expect(perAnswerPreviewFor([], 0).coveragePerWrong).toBe(-0.5);
		expect(perAnswerPreviewFor([], 4).coveragePerWrong).toBe(-2.5);
	});

	// Flat adds lift the earn, so they lift the bleed with it — the old formula
	// read a multiplier field that is 1 on every config in the roster.
	it("follows a config that only adds flat coverage, rather than ignoring it", () => {
		// Code Coverage adds +0.5, so a correct answer pays 1.5 and a wrong one
		// costs half of that.
		expect(
			perAnswerPreviewFor([CONFIGS.codeCoverage], 0).coveragePerWrong
		).toBe(-0.8);
	});

	it("sums storagePerCorrect across the build", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.indexedDb], 0).storageKbPerCorrect
		).toBe(8);
		expect(perAnswerPreviewFor([], 0).storageKbPerCorrect).toBe(0);
	});

	it("surfaces the highest Focus bonus as the matching-config multiplier", () => {
		expect(perAnswerPreviewFor([CONFIGS.js], 0).matchingConfigMultiplier).toBe(
			1.25
		);
		expect(
			perAnswerPreviewFor([CONFIGS.js, { ...CONFIGS.ts, level: 3 }], 0)
				.matchingConfigMultiplier
		).toBe(1.75); // .ts at L3: 1 + 0.25 × 3
	});

	it("omits the matching-config multiplier with no Focus config equipped", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd], 0).matchingConfigMultiplier
		).toBeUndefined();
	});

	it("folds Overclock's throttle into the floor — the opener bonus stays out", () => {
		// Four of five answers earn the throttled rate, so ×0.5 IS the guarantee.
		expect(perAnswerPreviewFor([CONFIGS.overclock], 0).coveragePerCorrect).toBe(
			0.5
		);
		// Cold Start's opener is conditional upside and never lifted the floor.
		expect(perAnswerPreviewFor([CONFIGS.coldStart], 0).coveragePerCorrect).toBe(
			1
		);
	});
});

describe("gateClearPayout", () => {
	it("scales the base reward with window correctness", () => {
		expect(gateClearPayout([], 5, 0)).toBe(32);
		expect(gateClearPayout([], 3, 0)).toBe(19); // 32 × 3/5, rounded
	});

	it("rides the same gate-depth curve as coverage", () => {
		expect(gateClearPayout([], 5, 4)).toBe(160); // gate 4: 32 × 5
		expect(gateClearPayout([], 5, 11)).toBe(384); // gate 11: 32 × 12
	});

	it("caps the depth multiplier at the summit for endless runs", () => {
		// The summit pays in full (×13); past it the multiplier stops climbing.
		expect(gateClearPayout([], 5, VICTORY_GATE)).toBe(416);
		expect(gateClearPayout([], 5, 30)).toBe(416);
	});

	it("pays a 0/5 clear nothing — a farm build banks no storage (ADR-017)", () => {
		expect(gateClearPayout([], 0, 11)).toBe(0);
	});

	it("keeps flat clear payouts whole — they ride their own passed check", () => {
		// Unit Tests' +32 is not scaled: its check demanded the correct answers.
		expect(gateClearPayout([CONFIGS.unitTests], 3, 0)).toBe(19 + 32);
	});
});

describe("storageInterestFor", () => {
	it("pays nothing without an interest config", () => {
		expect(storageInterestFor([], 512)).toBe(0);
		expect(storageInterestFor([CONFIGS.unitTests], 512)).toBe(0);
	});

	it("pays 2% of held storage at L1, rounded down to whole KB", () => {
		expect(storageInterestFor([CONFIGS.mooresLaw], 512)).toBe(10);
		expect(storageInterestFor([CONFIGS.mooresLaw], 99)).toBe(1);
	});

	it("pays 2% more per level, reaching a tenth at L5", () => {
		expect(storageInterestFor([{ ...CONFIGS.mooresLaw, level: 3 }], 512)).toBe(
			30
		);
		expect(storageInterestFor([{ ...CONFIGS.mooresLaw, level: 5 }], 512)).toBe(
			51
		);
	});

	it("pays nothing on a balance too small to earn a whole KB", () => {
		expect(storageInterestFor([CONFIGS.mooresLaw], 0)).toBe(0);
		expect(storageInterestFor([CONFIGS.mooresLaw], 32)).toBe(0); // 2% of 32 is 0.64
	});

	it("compounds across gates by reading the grown balance each time", () => {
		const maxed = [{ ...CONFIGS.mooresLaw, level: 5 }];
		const first = storageInterestFor(maxed, 512);
		expect(storageInterestFor(maxed, 512 + first)).toBe(56);
	});
});

// No config on the roster pays per extra pick any more — `.length` is pure
// information now — so the axis is exercised by a config built for it. If it
// gains no owner, the axis and these tests should go together.
const PER_EXTRA_PICK: Config = {
	id: "per-extra-pick",
	label: "Per extra pick",
	family: "economy",
	description: "Pays per correct answer beyond one per poll.",
	rewardMultiplier: 1,
	storagePerExtraPick: 16,
};

describe("extraPickPayoutFor", () => {
	it("pays nothing to a build with no config on the axis", () => {
		expect(extraPickPayoutFor([], 3)).toBe(0);
		expect(extraPickPayoutFor([CONFIGS.unitTests], 3)).toBe(0);
		expect(extraPickPayoutFor([CONFIGS.length], 3)).toBe(0);
	});

	it("pays its rate per correct answer beyond one per poll", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 3)).toBe(48);
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 1)).toBe(16);
	});

	it("pays nothing on a window of single-answer polls, the axis's dead spot", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 0)).toBe(0);
	});

	it("never pays negative on a short final window", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], -2)).toBe(0);
	});
});

describe("coverageForAnswer", () => {
	it("pays 1.25x in a Focus category (1.3 rounded), 1x outside it", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1)).toBe(1.3);
		expect(coverageForAnswer([CONFIGS.js], at("css"), 1)).toBe(1);
	});

	it("stacks Focus and Amplify across the whole pipeline", () => {
		expect(coverageForAnswer([CONFIGS.js, CONFIGS.agentsMd], at("js"), 1)).toBe(
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
		// (1 base + 0.5 Code Coverage) × 2 AGENTS.md = 3 — the +0.5 gets doubled.
		expect(
			coverageForAnswer([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
		).toBe(3);
	});

	it("doubles the window's opening answer with Cold Start, and only that one", () => {
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 0), 1)).toBe(2);
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 1), 1)).toBe(1);
	});

	it("front-loads the window with Overclock: ×4 opener, ×0.5 for the rest", () => {
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 0), 1)).toBe(4);
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 1), 1)).toBe(0.5);
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 4), 1)).toBe(0.5);
	});

	it("stacks Overclock and Cold Start multiplicatively on the opener", () => {
		const build = [CONFIGS.overclock, CONFIGS.coldStart];
		expect(coverageForAnswer(build, at("js", 0), 1)).toBe(8);
		// Cold Start covers at ×1 off the opener, so only the throttle remains.
		expect(coverageForAnswer(build, at("js", 1), 1)).toBe(0.5);
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
		// AGENTS.md ×2 on a base of 1 → +1 config chip, base stays 1.
		expect(
			coverageBreakdownForAnswer([CONFIGS.agentsMd], at("js"), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "agents-md", value: 1 }],
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

	it("chips Overclock's throttle as a negative bonus off the opener", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 0), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: 3 }],
		});
		// ×0.5 on a base of 1: the chip carries the half it burned, in cinnabar.
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 1), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: -0.5 }],
		});
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
			coverageBreakdownForAnswer([CONFIGS.agentsMd], at("js"), 0, 1, 0.5)
		).toEqual({ base: -0.5, streakBonus: 0, configBonuses: [] });
	});

	it("credits the multiplier chip when a ×mult amplifies a flat add, listing the mult last", () => {
		// (1 + 0.5) × 2 = 3: Code Coverage keeps its face +0.5, AGENTS.md absorbs
		// the amplification (+1.5 = doubling base + add), base stays 1. AGENTS.md is
		// the ×mult, so it lists after the flat add even though it's slotted first.
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.agentsMd, CONFIGS.codeCoverage],
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
				{ configId: "agents-md", value: 1.5 },
			],
		});
	});

	it("lists every flat-add config before every ×mult config, whatever the slot order", () => {
		const order = coverageBreakdownForAnswer(
			[CONFIGS.agentsMd, CONFIGS.codeCoverage],
			at("js"),
			1,
			1,
			0
		).configBonuses.map((bonus) => bonus.configId);
		// agents-md is the ×mult, code-coverage the flat add → add first, mult last.
		expect(order).toEqual(["code-coverage", "agents-md"]);
	});

	it("keeps base + streak + configs summing to the engine's earned coverage", () => {
		const configs = [CONFIGS.agentsMd, CONFIGS.codeCoverage];
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
		expect(canLint([CONFIGS.js, CONFIGS.agentsMd], "js")).toBe(false); // no linter
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

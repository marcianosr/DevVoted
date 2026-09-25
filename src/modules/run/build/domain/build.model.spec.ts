import { describe, expect, it } from "vitest";

import {
	BASE_SLOTS,
	TOP_BUILD_SPACE_RUNG,
	buildSpaceFor,
	SLICE_WINDOW,
	VICTORY_GATE,
	roundToTwoDecimals,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";
import { BASE_UNIT } from "~/modules/run/build/domain/coverageRatio.model";

const BASE = BASE_UNIT;
import { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { AnswerContext } from "~/modules/run/config/domain/effect.model";
import {
	Build,
	coverageBreakdownForAnswer,
	coverageFactorsForAnswer,
	coverageForAnswer,
	freeSlots,
	gateClearPayout,
	canLint,
	extraPickPayoutFor,
	hasRoomFor,
	isBare,
	isOverCapacity,
	occupiedSlots,
	rungAfterBuild,
	spaceForBuild,
	upkeepForBuild,
	overflowSlots,
	perAnswerPreviewFor,
	buildModifiersFor,
	rewardMultiplierFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/build/domain/build.model";

const buildOf = (configs: Config[]): Build => ({
	id: "hyrule-ci",
	configs,
});

describe("the build space the run rents (ADR-098)", () => {
	it("opens every run on the free four", () => {
		expect(BASE_SLOTS).toBe(4);
	});

	it("tops out at 32, the widest rung on the ladder", () => {
		expect(buildSpaceFor(TOP_BUILD_SPACE_RUNG)).toBe(32);
	});

	it("rents the smallest rung the build fits in", () => {
		expect(spaceForBuild(buildOf([CONFIGS.js]))).toBe(4);
		expect(spaceForBuild(buildOf([CONFIGS.wtfpl]))).toBe(8);
		expect(spaceForBuild(buildOf([CONFIGS.wtfpl, CONFIGS.js]))).toBe(12);
	});

	it("bills a weight one over a rung for the whole rung above it", () => {
		expect(upkeepForBuild(buildOf([CONFIGS.js]))).toBe(0);
		expect(upkeepForBuild(buildOf([CONFIGS.wtfpl]))).toBe(32);
		expect(upkeepForBuild(buildOf([CONFIGS.wtfpl, CONFIGS.js]))).toBe(64);
	});

	it("names the rung ahead, and nothing once the ladder runs out", () => {
		expect(rungAfterBuild(buildOf([CONFIGS.js]))?.weight).toBe(6);
		expect(
			rungAfterBuild(buildOf(Array.from({ length: 4 }, () => CONFIGS.wtfpl)))
		).toBeUndefined();
	});
});

describe("what fills the build (ADR-044)", () => {
	it("charges each config the slots its size names", () => {
		expect(occupiedSlots([CONFIGS.js])).toBe(1);
		expect(occupiedSlots([CONFIGS.indexedDb])).toBe(2);
		expect(occupiedSlots([CONFIGS.wtfpl])).toBe(8);
		expect(occupiedSlots([CONFIGS.js, CONFIGS.indexedDb])).toBe(3);
	});

	it("leaves free only the room inside the rung it rents", () => {
		expect(freeSlots(buildOf([CONFIGS.indexedDb]))).toBe(2);
		expect(freeSlots(buildOf([CONFIGS.wtfpl]))).toBe(0);
	});

	/**
	 * Room stopped being a reason to refuse an offer at every rung but the last
	 * (ADR-098): a build grows into the rung above rather than being held out of
	 * it, so only the top of the ladder can still say no.
	 */
	it("refuses only what the top rung cannot hold", () => {
		expect(hasRoomFor(buildOf([CONFIGS.indexedDb]), 16)).toBe(true);

		const brimming = buildOf(Array.from({ length: 4 }, () => CONFIGS.wtfpl));
		expect(hasRoomFor(brimming, 1)).toBe(false);
	});

	it("reports an overflow only past the top of the ladder", () => {
		const over = buildOf(Array.from({ length: 5 }, () => CONFIGS.wtfpl));

		expect(isOverCapacity(over)).toBe(true);
		expect(overflowSlots(over)).toBe(8);
	});
});

const buildWith = buildOf;

const at = (
	category: AnswerContext["category"],
	answeredBefore = 1,
	answerType: AnswerContext["answerType"] = "single"
): AnswerContext => ({
	category,
	answerType,
	answeredBefore,
	cachedHits: 0,
	previouslyMissed: false,
});

describe("rewardMultiplierFor", () => {
	it("is 1 across the whole shipped roster — configs pay in coverage or KB, never in a storage multiplier", () => {
		expect(
			rewardMultiplierFor([
				{ ...CONFIGS.unitTests, level: 2 },
				CONFIGS.agentsMd,
				CONFIGS.coldStart,
				CONFIGS.intellisense,
			])
		).toBe(1);
	});

	it("is 1 for a bare build", () => {
		expect(rewardMultiplierFor([])).toBe(1);
	});
});

describe("buildModifiersFor", () => {
	it("prices a bare build at the opening gate's reward with identity multipliers", () => {
		expect(buildModifiersFor([], 0)).toEqual({
			gateReward: 32,
			rewardMultiplier: 1,
			coverageMultiplier: 1,
			coverageAdd: 0,
		});
	});

	it("prices the clear against the gate being previewed, not the base", () => {
		expect(buildModifiersFor([], 1).gateReward).toBe(64);
		expect(buildModifiersFor([], 2).gateReward).toBe(96);
	});

	it("agrees with what a full window actually pays", () => {
		const configs = [CONFIGS.unitTests, CONFIGS.agentsMd];
		for (const gate of [0, 1, 5, 12])
			expect(buildModifiersFor(configs, gate).gateReward).toBe(
				gateClearPayout(configs, SLICE_WINDOW, gate)
			);
	});

	it("folds flat clear payouts and coverage boosts into one modifier set", () => {
		expect(
			buildModifiersFor([CONFIGS.unitTests, CONFIGS.agentsMd], 0)
		).toEqual({
			gateReward: 64,
			rewardMultiplier: 1,
			coverageMultiplier: 2,
			coverageAdd: 0,
		});
	});

	it("multiplies coverage mults across the build instead of summing them", () => {
		expect(
			buildModifiersFor([CONFIGS.intellisense, CONFIGS.agentsMd], 0)
				.coverageMultiplier
		).toBe(3);
	});
});

describe("perAnswerPreviewFor", () => {
	it("prices a bare build at gate 0: the flat base, no storage, no matching-config bonus", () => {
		expect(perAnswerPreviewFor([])).toEqual({
			coveragePerCorrect: BASE,
			coveragePerWrong: 0,
			storageKbPerCorrect: 0,
			matchingConfigMultiplier: undefined,
			streakStepMultiplier: streakMultiplier(1),
		});
	});

	it("carries the streak step, since even the first correct answer rides one", () => {
		expect(perAnswerPreviewFor([]).streakStepMultiplier).toBe(1.1);
	});

	it("pays the same for a correct answer at every gate", () => {
		expect(perAnswerPreviewFor([]).coveragePerCorrect).toBe(BASE);
	});

	it("previews a multiple-choice poll at double, multiplied by the build before the flat add", () => {
		expect(perAnswerPreviewFor([], "multiple").coveragePerCorrect).toBe(
			BASE * 2
		);
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], "multiple")
				.coveragePerCorrect
		).toBeCloseTo(BASE * 2 * 2 + 0.1);
	});

	it("multiplies by build-wide mults and adds flat units on top, excluding Focus bonuses", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage])
				.coveragePerCorrect
		).toBeCloseTo(BASE * 2 + 0.1);
	});

	it("costs nothing to miss on any build: the slot is the cost, not a bleed", () => {
		for (const configs of [
			[],
			[CONFIGS.codeCoverage],
			[CONFIGS.agentsMd],
			[CONFIGS.agentsMd, CONFIGS.codeCoverage],
		])
			expect(perAnswerPreviewFor(configs).coveragePerWrong).toBe(0);
	});

	it("prices the miss once a wager is armed, since only a wager bleeds", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.strict], "single", 0.5).coveragePerWrong
		).toBe(-0.5);
	});

	it("leaves the miss free while the wager sits unarmed", () => {
		expect(perAnswerPreviewFor([CONFIGS.strict]).coveragePerWrong).toBe(0);
	});

	it("follows a config that only adds flat coverage, rather than ignoring it", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.codeCoverage]).coveragePerCorrect
		).toBeGreaterThan(BASE);
	});

	it("sums storagePerCorrect across the build", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.indexedDb]).storageKbPerCorrect
		).toBe(8);
		expect(perAnswerPreviewFor([]).storageKbPerCorrect).toBe(0);
	});

	it("surfaces the highest Focus bonus as the matching-config multiplier", () => {
		expect(perAnswerPreviewFor([CONFIGS.js]).matchingConfigMultiplier).toBe(
			1.25
		);
		expect(
			perAnswerPreviewFor([CONFIGS.js, { ...CONFIGS.ts, level: 3 }])
				.matchingConfigMultiplier
		).toBe(1.75);
	});

	it("omits the matching-config multiplier with no Focus config equipped", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd]).matchingConfigMultiplier
		).toBeUndefined();
	});

	it("folds both throttles into the floor, and leaves either opener out of it", () => {
		expect(perAnswerPreviewFor([CONFIGS.overclock]).coveragePerCorrect).toBe(
			BASE * 0.5
		);
		expect(perAnswerPreviewFor([CONFIGS.coldStart]).coveragePerCorrect).toBe(
			BASE * 1.5
		);
	});
});

describe("gateClearPayout", () => {
	it("scales the base reward with window correctness", () => {
		expect(gateClearPayout([], 5, 0)).toBe(32);
		expect(gateClearPayout([], 3, 0)).toBe(19);
	});

	it("rides the same gate-depth curve as coverage", () => {
		expect(gateClearPayout([], 5, 4)).toBe(160);
		expect(gateClearPayout([], 5, 11)).toBe(384);
	});

	it("caps the depth multiplier at the summit for endless runs", () => {
		expect(gateClearPayout([], 5, VICTORY_GATE)).toBe(416);
		expect(gateClearPayout([], 5, 30)).toBe(416);
	});

	it("pays a 0/5 clear nothing — a farm build banks no storage", () => {
		expect(gateClearPayout([], 0, 11)).toBe(0);
	});

	it("keeps flat clear payouts whole — they ride their own passed check", () => {
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
		expect(storageInterestFor([CONFIGS.mooresLaw], 32)).toBe(0);
	});

	it("compounds across gates by reading the grown balance each time", () => {
		const maxed = [{ ...CONFIGS.mooresLaw, level: 5 }];
		const first = storageInterestFor(maxed, 512);
		expect(storageInterestFor(maxed, 512 + first)).toBe(56);
	});
});

const PER_EXTRA_PICK: Config = {
	id: "per-extra-pick",
	label: "Per extra pick",
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

	it("pays nothing on a window of single-answer polls, the axis's dead slot", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], 0)).toBe(0);
	});

	it("never pays negative on a short final window", () => {
		expect(extraPickPayoutFor([PER_EXTRA_PICK], -2)).toBe(0);
	});
});

describe("coverageForAnswer", () => {
	const pays = (multiplier: number) => roundToTwoDecimals(BASE * multiplier);

	it("pays one unit times the build on a single-answer poll", () => {
		expect(coverageForAnswer([], at("js"), 1)).toBe(BASE);
	});

	it("pays double on a fully answered multiple-choice poll", () => {
		expect(coverageForAnswer([], at("js", 1, "multiple"), 1)).toBe(BASE * 2);
	});

	it.each([
		[0.25, 0.5],
		[0.5, 1],
		[0.75, 1.5],
	])("pays a %s multiple-choice rung %s units", (share, units) => {
		expect(coverageForAnswer([], at("js", 1, "multiple"), share)).toBe(units);
	});

	it("doubles before the build multiplies, and before the streak adds", () => {
		expect(
			coverageForAnswer([CONFIGS.agentsMd], at("js", 1, "multiple"), 1)
		).toBe(pays(4));
		expect(coverageForAnswer([], at("js", 1, "multiple"), 1, 1)).toBeCloseTo(
			BASE * 2 + 0.1
		);
	});

	it("adds the streak step after the multipliers, never inside them", () => {
		expect(coverageForAnswer([], at("js"), 1, 1)).toBeCloseTo(BASE + 0.1);
		expect(coverageForAnswer([CONFIGS.agentsMd], at("js"), 1, 1)).toBeCloseTo(
			BASE * 2 + 0.1
		);
	});

	it("pays no streak step on the window's opening answer", () => {
		expect(coverageForAnswer([], at("js"), 1, 0)).toBe(BASE);
	});

	it("pays the same flat step however long the streak runs", () => {
		expect(coverageForAnswer([], at("js"), 1, 9)).toBeCloseTo(
			coverageForAnswer([], at("js"), 1, 1)
		);
	});

	it("pays 1.25x in a Focus category, 1x outside it", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1)).toBe(pays(1.25));
		expect(coverageForAnswer([CONFIGS.js], at("css"), 1)).toBe(pays(1));
	});

	it("stacks Focus and Amplify across the whole build", () => {
		expect(coverageForAnswer([CONFIGS.js, CONFIGS.agentsMd], at("js"), 1)).toBe(
			pays(2.5)
		);
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([{ ...CONFIGS.js, level: 2 }], at("js"), 1)).toBe(
			pays(1.5)
		);
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0)).toBe(0);
	});

	it("pays a partial share proportionally, configs included", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0.5)).toBe(pays(0.625));
	});

	it("keeps a flat add outside the multipliers, so a ×mult cannot amplify it", () => {
		expect(
			coverageForAnswer([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
		).toBe(roundToTwoDecimals(pays(2) + 0.1));
	});

	it.each([
		[0.25, 1],
		[0.5, 1],
		[0.75, 2],
	])(
		"rounds a %s multiple-choice rung up to %s whole units with .prettierrc",
		(share, units) => {
			expect(
				coverageForAnswer([CONFIGS.prettierrc], at("js", 1, "multiple"), share)
			).toBe(units);
		}
	);

	it("leaves a full multiple-choice answer alone: two units is already whole", () => {
		expect(
			coverageForAnswer([CONFIGS.prettierrc], at("js", 1, "multiple"), 1)
		).toBe(BASE * 2);
	});

	it("never fires on a single-answer poll, where a share is already binary", () => {
		expect(coverageForAnswer([CONFIGS.prettierrc], at("js"), 1)).toBe(BASE);
		expect(coverageForAnswer([CONFIGS.prettierrc], at("js"), 0)).toBe(0);
	});

	it("keeps the top-up outside the multipliers, so a near-miss still trails a full answer", () => {
		const build = [CONFIGS.prettierrc, CONFIGS.agentsMd];
		expect(coverageForAnswer(build, at("js", 1, "multiple"), 0.75)).toBe(3.5);
		expect(coverageForAnswer(build, at("js", 1, "multiple"), 1)).toBe(4);
	});

	it("pays nothing for Cold Start's opener and ×1.5 for every answer after it", () => {
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 0), 1)).toBe(pays(0));
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 1), 1)).toBe(
			pays(1.5)
		);
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 4), 1)).toBe(
			pays(1.5)
		);
	});

	it("front-loads the window with Overclock: ×4 opener, ×0.5 for the rest", () => {
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 0), 1)).toBe(pays(4));
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 1), 1)).toBe(
			pays(0.5)
		);
		expect(coverageForAnswer([CONFIGS.overclock], at("js", 4), 1)).toBe(
			pays(0.5)
		);
	});

	it("lets Cold Start's dead opener cancel Overclock's, and compounds them after", () => {
		const build = [CONFIGS.overclock, CONFIGS.coldStart];
		expect(coverageForAnswer(build, at("js", 0), 1)).toBe(pays(0));
		expect(coverageForAnswer(build, at("js", 1), 1)).toBe(pays(0.75));
	});
});

describe("coverageBreakdownForAnswer", () => {
	it("gives a bare correct answer the flat base with no bonuses", () => {
		expect(coverageBreakdownForAnswer([], at("js"), 1, 0)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("states the doubled figure as the base on a multiple-choice poll", () => {
		expect(
			coverageBreakdownForAnswer([], at("js", 1, "multiple"), 1, 0)
		).toEqual({
			base: BASE * 2,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("splits an Amplify multiplier into its own config chip", () => {
		expect(coverageBreakdownForAnswer([CONFIGS.agentsMd], at("js"), 1, 0)).toEqual(
			{
				base: BASE,
				streakBonus: 0,
				configBonuses: [{ configId: "agents-md", value: BASE, factor: 2 }],
			}
		);
	});

	it("reads the streak step on its own row, not as a config chip", () => {
		expect(coverageBreakdownForAnswer([], at("js"), 1, 3)).toEqual({
			base: BASE,
			streakBonus: 0.1,
			configBonuses: [],
		});
	});

	it("keeps the rows summing to the paid total once the streak is running", () => {
		const build = [CONFIGS.agentsMd];
		const breakdown = coverageBreakdownForAnswer(build, at("js"), 1, 3);
		const rows =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((sum, bonus) => sum + bonus.value, 0);

		expect(rows).toBeCloseTo(coverageForAnswer(build, at("js"), 1, 3));
	});

	it("splits a flat coverage add into its own config chip", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.codeCoverage], at("js"), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "code-coverage", value: BASE * 0.1 }],
		});
	});

	it("chips Cold Start's dead opener as a loss and its throttle as a gain", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 0), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "cold-start", value: -BASE, factor: 0 }],
		});
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 1), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "cold-start", value: BASE * 0.5, factor: 1.5 }],
		});
	});

	it("chips Overclock's throttle as a negative bonus off the opener", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 0), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: BASE * 3, factor: 4 }],
		});
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 1), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: -BASE * 0.5, factor: 0.5 }],
		});
	});

	it("names the streak step in the equation once one is running", () => {
		expect(coverageBreakdownForAnswer([CONFIGS.js], at("js"), 1, 0)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "js", value: roundToTwoDecimals(BASE * 0.25), factor: 1.25 },
			],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.eslint, CONFIGS.js], at("css"), 1, 0)
		).toEqual({ base: BASE, streakBonus: 0, configBonuses: [] });
	});

	it("chips .prettierrc's top-up as its own row, so the base stays the answer's own figure", () => {
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.prettierrc],
				at("js", 1, "multiple"),
				0.25,
				0
			)
		).toEqual({
			base: 0.5,
			streakBonus: 0,
			configBonuses: [{ configId: "prettierrc", value: 0.5 }],
		});
	});

	it("hides .prettierrc on a half catch, which was already a whole unit", () => {
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.prettierrc],
				at("js", 1, "multiple"),
				0.5,
				0
			)
		).toEqual({ base: 1, streakBonus: 0, configBonuses: [] });
	});

	it("sums .prettierrc's row with a multiplier's to the figure that was paid", () => {
		const build = [CONFIGS.prettierrc, CONFIGS.agentsMd];
		const context = at("js", 1, "multiple");
		const breakdown = coverageBreakdownForAnswer(build, context, 0.25, 0);

		expect(breakdown).toEqual({
			base: 0.5,
			streakBonus: 0,
			configBonuses: [
				{ configId: "prettierrc", value: 0.5 },
				{ configId: "agents-md", value: 0.5, factor: 2 },
			],
		});
		expect(
			breakdown.base +
				breakdown.configBonuses.reduce((sum, bonus) => sum + bonus.value, 0)
		).toBe(coverageForAnswer(build, context, 0.25, 0));
	});

	it("carries a miss as a flat nothing: the slot is the cost, not a bleed", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.agentsMd], at("js"), 0, 3)
		).toEqual({ base: 0, streakBonus: 0, configBonuses: [] });
	});

	it("credits a flat add at face value and the ×mult on the base alone, listing the mult last", () => {
		expect(
			coverageBreakdownForAnswer(
				[CONFIGS.agentsMd, CONFIGS.codeCoverage],
				at("js"),
				1,
				0
			)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "code-coverage", value: 0.1 },
				{ configId: "agents-md", value: BASE, factor: 2 },
			],
		});
	});

	it("lists every flat-add config before every ×mult config, whatever the slot order", () => {
		const order = coverageBreakdownForAnswer(
			[CONFIGS.agentsMd, CONFIGS.codeCoverage],
			at("js"),
			1,
			0
		).configBonuses.map((bonus) => bonus.configId);
		expect(order).toEqual(["code-coverage", "agents-md"]);
	});

	it("carries the factor on a multiplier bonus so a row can read ×1.25", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.js], at("js"), 1, 0).configBonuses
		).toEqual([
			{ configId: "js", value: roundToTwoDecimals(BASE * 0.25), factor: 1.25 },
		]);
	});

	it("leaves a flat adder without a factor, since it never multiplied", () => {
		const [bonus] = coverageBreakdownForAnswer(
			[CONFIGS.codeCoverage],
			at("js"),
			1,
			0
		).configBonuses;
		expect(bonus).not.toHaveProperty("factor");
	});

	it("carries the throttled factor once the opener is spent", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 1), 1, 0)
				.configBonuses
		).toEqual([{ configId: "overclock", value: -BASE * 0.5, factor: 0.5 }]);
	});

	it("keeps base + streak + configs summing to the engine's earned coverage", () => {
		const configs = [CONFIGS.agentsMd, CONFIGS.codeCoverage];
		const breakdown = coverageBreakdownForAnswer(configs, at("js"), 1, 0);
		const sum =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((total, bonus) => total + bonus.value, 0);
		expect(roundToTwoDecimals(sum)).toBe(
			coverageForAnswer(configs, at("js"), 1)
		);
	});
});

describe("canLint", () => {
	it("is true only for a linter that covers the poll's category", () => {
		expect(canLint([CONFIGS.eslint], "js")).toBe(true);
		expect(canLint([CONFIGS.eslint], "ts")).toBe(true);
		expect(canLint([CONFIGS.eslint], "css")).toBe(false);
		expect(canLint([CONFIGS.stylelint], "css")).toBe(true);
		expect(canLint([CONFIGS.js, CONFIGS.agentsMd], "js")).toBe(false);
	});
});

describe("stripConfig and isBare", () => {
	it("peels a config and reports bareness", () => {
		expect(isBare(buildWith([]))).toBe(true);
		const stripped = stripConfig(
			buildWith([CONFIGS.js, CONFIGS.eslint]),
			"eslint"
		);
		expect(stripped.configs.map((config) => config.id)).toEqual(["js"]);
	});
});

describe("coverageFactorsForAnswer", () => {
	it("hands back the share and the build's combined factor", () => {
		expect(coverageFactorsForAnswer([CONFIGS.js], at("js"), 1)).toEqual({
			correct: 1,
			build: 1.25,
		});
	});

	it("reports the multiplier product as the build factor, leaving flat adds out of it", () => {
		expect(
			coverageFactorsForAnswer(
				[CONFIGS.agentsMd, CONFIGS.codeCoverage],
				at("js"),
				1
			)
		).toEqual({ correct: 1, build: 2 });
	});

	it("reads a bare build as ×1 rather than pretending it contributed", () => {
		expect(coverageFactorsForAnswer([], at("js"), 2)).toEqual({
			correct: 2,
			build: 1,
		});
	});

	it("hands back nothing at all for a wrong answer", () => {
		expect(coverageFactorsForAnswer([CONFIGS.js], at("js"), 0)).toBe(undefined);
	});
});

describe("the receipt for an armed wager", () => {
	const context = {
		category: "react",
		answerType: "single",
		answeredBefore: 0,
		cachedHits: 0,
		previouslyMissed: false,
	} as const;

	it("names the wager as its own row, so the chip that paid lights up", () => {
		const breakdown = coverageBreakdownForAnswer(
			[CONFIGS.strict],
			context,
			1,
			0,
			0.5
		);

		expect(breakdown.configBonuses).toEqual([
			{ configId: "strict", value: 0.5 },
		]);
	});

	it("keeps the base honest, so the rows still sum to what was paid", () => {
		const breakdown = coverageBreakdownForAnswer(
			[CONFIGS.strict, CONFIGS.agentsMd],
			context,
			1,
			0,
			0.5
		);
		const rows =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((sum, bonus) => sum + bonus.value, 0);

		expect(rows).toBe(2.5);
	});

	it("writes no wager row when nothing was armed", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.strict], context, 1).configBonuses
		).toEqual([]);
	});
});

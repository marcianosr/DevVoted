import { describe, expect, it } from "vitest";

import {
	BASE_SLOTS,
	BASE_STREAK_STEPS,
	MAX_SLOTS,
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
	overflowSlots,
	perAnswerPreviewFor,
	buildModifiersFor,
	rewardMultiplierFor,
	streakCapStepsFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/build/domain/build.model";

describe("capacity is slots, and slots are bought (ADR-046)", () => {
	it("opens every run on four, whatever it is holding or spending", () => {
		expect(BASE_SLOTS).toBe(4);
	});

	it("tops out at 24, the last slot the shop sells", () => {
		expect(MAX_SLOTS).toBe(24);
	});
});

describe("what fills the build (ADR-044)", () => {
	it("charges each config the slots its size names", () => {
		expect(occupiedSlots([CONFIGS.js])).toBe(1);
		expect(occupiedSlots([CONFIGS.indexedDb])).toBe(2);
		expect(occupiedSlots([CONFIGS.wtfpl])).toBe(8);
		expect(occupiedSlots([CONFIGS.js, CONFIGS.indexedDb])).toBe(3);
	});

	it("refuses a config that does not fit, and admits a smaller one", () => {
		const narrow: Build = {
			id: "hyrule-ci",
			slots: 4,
			configs: [CONFIGS.indexedDb],
		};
		expect(freeSlots(narrow)).toBe(2);
		expect(hasRoomFor(narrow, 2)).toBe(true);
		expect(hasRoomFor(narrow, 4)).toBe(false);
	});

	it("reports an overflow rather than pretending the build shrank", () => {
		const repossessed: Build = {
			id: "hyrule-ci",
			slots: 4,
			configs: [CONFIGS.wtfpl],
		};
		expect(isOverCapacity(repossessed)).toBe(true);
		expect(overflowSlots(repossessed)).toBe(4);
		expect(freeSlots(repossessed)).toBe(0);
	});
});

const buildWith = (configs: Config[]): Build => ({
	id: "hyrule-ci",
	slots: BASE_SLOTS,
	configs,
});

const at = (
	category: AnswerContext["category"],
	answeredBefore = 1,
	answerType: AnswerContext["answerType"] = "single"
): AnswerContext => ({ category, answerType, answeredBefore, cachedHits: 0 });

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
			streakCapMultiplier: 2,
		});
	});

	it("caps the streak at the base ten steps on a build that sells no headroom", () => {
		expect(streakCapStepsFor([])).toBe(BASE_STREAK_STEPS);
		expect(perAnswerPreviewFor([]).streakCapMultiplier).toBe(2);
	});

	it("adds a headroom config's steps to the cap, so the ceiling moves with the build", () => {
		const headroom = { ...CONFIGS.js, id: "flow", streakCapSteps: 5 };

		expect(streakCapStepsFor([headroom])).toBe(BASE_STREAK_STEPS + 5);
		expect(perAnswerPreviewFor([headroom]).streakCapMultiplier).toBe(2.5);
	});

	it("carries the streak step, since even the first correct answer rides one", () => {
		expect(perAnswerPreviewFor([]).streakStepMultiplier).toBe(1.1);
	});

	it("pays the same for a correct answer at every gate", () => {
		expect(perAnswerPreviewFor([]).coveragePerCorrect).toBe(BASE);
	});

	it("previews a multiple-choice poll at double, and folds the build in after", () => {
		expect(perAnswerPreviewFor([], "multiple").coveragePerCorrect).toBe(
			BASE * 2
		);
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], "multiple")
				.coveragePerCorrect
		).toBeCloseTo(BASE * 2.2 * 2);
	});

	it("folds in build-wide coverage mults/adds, excluding Focus bonuses", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage])
				.coveragePerCorrect
		).toBeCloseTo(BASE * 2.2);
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

	it("folds Overclock's throttle into the floor — the opener bonus stays out", () => {
		expect(perAnswerPreviewFor([CONFIGS.overclock]).coveragePerCorrect).toBe(
			BASE * 0.5
		);
		expect(perAnswerPreviewFor([CONFIGS.coldStart]).coveragePerCorrect).toBe(
			BASE
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

	it("applies multipliers last, so a ×mult amplifies flat adds too", () => {
		expect(
			coverageForAnswer([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
		).toBe(pays(2.2));
	});

	it("doubles the window's opening answer with Cold Start, and only that one", () => {
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 0), 1)).toBe(pays(2));
		expect(coverageForAnswer([CONFIGS.coldStart], at("js", 1), 1)).toBe(pays(1));
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

	it("stacks Overclock and Cold Start multiplicatively on the opener", () => {
		const build = [CONFIGS.overclock, CONFIGS.coldStart];
		expect(coverageForAnswer(build, at("js", 0), 1)).toBe(pays(8));
		expect(coverageForAnswer(build, at("js", 1), 1)).toBe(pays(0.5));
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
				configBonuses: [{ configId: "agents-md", value: BASE }],
			}
		);
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

	it("chips Cold Start on the opener and hides it afterwards", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 0), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "cold-start", value: BASE }],
		});
		expect(
			coverageBreakdownForAnswer([CONFIGS.coldStart], at("js", 1), 1, 0)
		).toEqual({ base: BASE, streakBonus: 0, configBonuses: [] });
	});

	it("chips Overclock's throttle as a negative bonus off the opener", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 0), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: BASE * 3 }],
		});
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 1), 1, 0)
		).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: -BASE * 0.5 }],
		});
	});

	it("names the streak step in the equation once one is running", () => {
		expect(coverageBreakdownForAnswer([CONFIGS.js], at("js"), 1, 0)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "js", value: roundToTwoDecimals(BASE * 0.25) },
			],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.eslint, CONFIGS.js], at("css"), 1, 0)
		).toEqual({ base: BASE, streakBonus: 0, configBonuses: [] });
	});

	it("carries a miss as a flat nothing: the slot is the cost, not a bleed", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.agentsMd], at("js"), 0, 3)
		).toEqual({ base: 0, streakBonus: 0, configBonuses: [] });
	});

	it("credits the multiplier chip when a ×mult amplifies a flat add, listing the mult last", () => {
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
				{ configId: "code-coverage", value: BASE * 0.1 },
				{ configId: "agents-md", value: BASE * 1.1 },
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

	it("folds adds and multipliers into one build factor, adds first", () => {
		expect(
			coverageFactorsForAnswer(
				[CONFIGS.agentsMd, CONFIGS.codeCoverage],
				at("js"),
				1
			)
		).toEqual({ correct: 1, build: 2.2 });
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

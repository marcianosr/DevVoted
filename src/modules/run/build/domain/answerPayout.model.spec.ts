import { describe, expect, it } from "vitest";

import {
	answerPayoutFor,
	perAnswerPreviewFor,
	previewContextFor,
} from "~/modules/run/build/domain/answerPayout.model";
import { BASE_UNIT } from "~/modules/run/build/domain/coverageRatio.model";
import { CONFIGS, CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import type {
	AnswerContext,
	PayoutContext,
} from "~/modules/run/config/domain/effect.model";
import {
	roundToTwoDecimals,
	streakMultiplier,
} from "~/modules/run/run/domain/rules.model";

const BASE = BASE_UNIT;

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

const earnedBy = (
	configs: Parameters<typeof answerPayoutFor>[0],
	context: PayoutContext,
	share: number,
	streakBefore = 0
): number => answerPayoutFor(configs, context, share, streakBefore).earned;

describe("the preview is the payout", () => {
	const moments = [0, 1].flatMap((answeredBefore) =>
		(["single", "multiple"] as const).map((answerType) => ({
			answeredBefore,
			answerType,
		}))
	);

	it.each(CONFIG_LIST.map((config) => [config.id, config] as const))(
		"quotes %s alone at exactly what a full right answer then pays",
		(_id, config) => {
			for (const facts of moments)
				expect(perAnswerPreviewFor([config], facts).coveragePerCorrect).toBe(
					answerPayoutFor([config], previewContextFor(facts), 1, 0).earned
				);
		}
	);

	it.each([
		["Focus and Amplify", [CONFIGS.js, CONFIGS.agentsMd]],
		["Cold Start and Code Coverage", [CONFIGS.coldStart, CONFIGS.codeCoverage]],
		["Overclock and Cache", [CONFIGS.overclock, CONFIGS.cache]],
		["both openers", [CONFIGS.overclock, CONFIGS.coldStart]],
	] as const)("quotes %s at what the pair then pays", (_name, configs) => {
		for (const facts of moments)
			expect(perAnswerPreviewFor(configs, facts).coveragePerCorrect).toBe(
				answerPayoutFor(configs, previewContextFor(facts), 1, 0).earned
			);
	});

	it("quotes the opener before the window's first answer and the throttle after it", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.coldStart], { answeredBefore: 0 })
				.coveragePerCorrect
		).toBe(0);
		expect(
			perAnswerPreviewFor([CONFIGS.coldStart], { answeredBefore: 1 })
				.coveragePerCorrect
		).toBe(BASE * 1.5);
		expect(
			perAnswerPreviewFor([CONFIGS.overclock], { answeredBefore: 0 })
				.coveragePerCorrect
		).toBe(BASE * 4);
		expect(
			perAnswerPreviewFor([CONFIGS.overclock], { answeredBefore: 1 })
				.coveragePerCorrect
		).toBe(BASE * 0.5);
	});

	it("focuses nothing when the poll's category is not known yet", () => {
		expect(
			earnedBy([CONFIGS.js], previewContextFor({ answeredBefore: 1 }), 1)
		).toBe(BASE);
		expect(
			answerPayoutFor([CONFIGS.js], previewContextFor({ answeredBefore: 1 }), 1)
				.breakdown.configBonuses
		).toEqual([]);
	});
});

describe("perAnswerPreviewFor", () => {
	const later = { answeredBefore: 1 } as const;

	it("prices a bare build at gate 0: the flat base, no storage, no matching-config bonus", () => {
		expect(perAnswerPreviewFor([], later)).toEqual({
			coveragePerCorrect: BASE,
			coveragePerWrong: 0,
			storageKbPerCorrect: 0,
			matchingConfigMultiplier: undefined,
			streakStepMultiplier: streakMultiplier(1),
		});
	});

	it("carries the streak step, since even the first correct answer rides one", () => {
		expect(perAnswerPreviewFor([], later).streakStepMultiplier).toBe(1.1);
	});

	it("previews a multiple-choice poll at double, multiplied by the build before the flat add", () => {
		expect(
			perAnswerPreviewFor([], { ...later, answerType: "multiple" })
				.coveragePerCorrect
		).toBe(BASE * 2);
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], {
				...later,
				answerType: "multiple",
			}).coveragePerCorrect
		).toBeCloseTo(BASE * 2 * 2 + 0.1);
	});

	it("multiplies by build-wide mults and adds flat units on top, excluding Focus bonuses", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], later)
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
			expect(perAnswerPreviewFor(configs, later).coveragePerWrong).toBe(0);
	});

	it("prices the miss once a wager is armed, since only a wager bleeds", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.strict], { ...later, wagerUnits: 0.5 })
				.coveragePerWrong
		).toBe(-0.5);
	});

	it("leaves the miss free while the wager sits unarmed", () => {
		expect(perAnswerPreviewFor([CONFIGS.strict], later).coveragePerWrong).toBe(
			0
		);
	});

	it("follows a config that only adds flat coverage, rather than ignoring it", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.codeCoverage], later).coveragePerCorrect
		).toBeGreaterThan(BASE);
	});

	it("sums storagePerCorrect across the build", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.indexedDb], later).storageKbPerCorrect
		).toBe(8);
		expect(perAnswerPreviewFor([], later).storageKbPerCorrect).toBe(0);
	});

	it("surfaces the highest Focus bonus as the matching-config multiplier", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.js], later).matchingConfigMultiplier
		).toBe(1.25);
		expect(
			perAnswerPreviewFor([CONFIGS.js, { ...CONFIGS.ts, level: 3 }], later)
				.matchingConfigMultiplier
		).toBe(1.75);
	});

	it("omits the matching-config multiplier with no Focus config equipped", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd], later).matchingConfigMultiplier
		).toBeUndefined();
	});
});

describe("what one answer pays", () => {
	const pays = (multiplier: number) => roundToTwoDecimals(BASE * multiplier);

	it("pays one unit times the build on a single-answer poll", () => {
		expect(earnedBy([], at("js"), 1)).toBe(BASE);
	});

	it("pays double on a fully answered multiple-choice poll", () => {
		expect(earnedBy([], at("js", 1, "multiple"), 1)).toBe(BASE * 2);
	});

	it.each([
		[0.25, 0.5],
		[0.5, 1],
		[0.75, 1.5],
	])("pays a %s multiple-choice rung %s units", (share, units) => {
		expect(earnedBy([], at("js", 1, "multiple"), share)).toBe(units);
	});

	it("doubles before the build multiplies, and before the streak adds", () => {
		expect(earnedBy([CONFIGS.agentsMd], at("js", 1, "multiple"), 1)).toBe(
			pays(4)
		);
		expect(earnedBy([], at("js", 1, "multiple"), 1, 1)).toBeCloseTo(
			BASE * 2 + 0.1
		);
	});

	it("adds the streak step after the multipliers, never inside them", () => {
		expect(earnedBy([], at("js"), 1, 1)).toBeCloseTo(BASE + 0.1);
		expect(earnedBy([CONFIGS.agentsMd], at("js"), 1, 1)).toBeCloseTo(
			BASE * 2 + 0.1
		);
	});

	it("pays no streak step on the window's opening answer", () => {
		expect(earnedBy([], at("js"), 1, 0)).toBe(BASE);
	});

	it("pays the same flat step however long the streak runs", () => {
		expect(earnedBy([], at("js"), 1, 9)).toBeCloseTo(earnedBy([], at("js"), 1, 1));
	});

	it("pays 1.25x in a Focus category, 1x outside it", () => {
		expect(earnedBy([CONFIGS.js], at("js"), 1)).toBe(pays(1.25));
		expect(earnedBy([CONFIGS.js], at("css"), 1)).toBe(pays(1));
	});

	it("stacks Focus and Amplify across the whole build", () => {
		expect(earnedBy([CONFIGS.js, CONFIGS.agentsMd], at("js"), 1)).toBe(
			pays(2.5)
		);
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(earnedBy([{ ...CONFIGS.js, level: 2 }], at("js"), 1)).toBe(
			pays(1.5)
		);
		expect(earnedBy([CONFIGS.js], at("js"), 0)).toBe(0);
	});

	it("pays a partial share proportionally, configs included", () => {
		expect(earnedBy([CONFIGS.js], at("js"), 0.5)).toBe(pays(0.625));
	});

	it("keeps a flat add outside the multipliers, so a ×mult cannot amplify it", () => {
		expect(
			earnedBy([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
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
				earnedBy([CONFIGS.prettierrc], at("js", 1, "multiple"), share)
			).toBe(units);
		}
	);

	it("leaves a full multiple-choice answer alone: two units is already whole", () => {
		expect(earnedBy([CONFIGS.prettierrc], at("js", 1, "multiple"), 1)).toBe(
			BASE * 2
		);
	});

	it("never fires on a single-answer poll, where a share is already binary", () => {
		expect(earnedBy([CONFIGS.prettierrc], at("js"), 1)).toBe(BASE);
		expect(earnedBy([CONFIGS.prettierrc], at("js"), 0)).toBe(0);
	});

	it("keeps the top-up outside the multipliers, so a near-miss still trails a full answer", () => {
		const build = [CONFIGS.prettierrc, CONFIGS.agentsMd];
		expect(earnedBy(build, at("js", 1, "multiple"), 0.75)).toBe(3.5);
		expect(earnedBy(build, at("js", 1, "multiple"), 1)).toBe(4);
	});

	it("pays nothing for Cold Start's opener and ×1.5 for every answer after it", () => {
		expect(earnedBy([CONFIGS.coldStart], at("js", 0), 1)).toBe(pays(0));
		expect(earnedBy([CONFIGS.coldStart], at("js", 1), 1)).toBe(pays(1.5));
		expect(earnedBy([CONFIGS.coldStart], at("js", 4), 1)).toBe(pays(1.5));
	});

	it("front-loads the window with Overclock: ×4 opener, ×0.5 for the rest", () => {
		expect(earnedBy([CONFIGS.overclock], at("js", 0), 1)).toBe(pays(4));
		expect(earnedBy([CONFIGS.overclock], at("js", 1), 1)).toBe(pays(0.5));
		expect(earnedBy([CONFIGS.overclock], at("js", 4), 1)).toBe(pays(0.5));
	});

	it("lets Cold Start's dead opener cancel Overclock's, and compounds them after", () => {
		const build = [CONFIGS.overclock, CONFIGS.coldStart];
		expect(earnedBy(build, at("js", 0), 1)).toBe(pays(0));
		expect(earnedBy(build, at("js", 1), 1)).toBe(pays(0.75));
	});

	it("folds an armed wager's win into the figure paid, rounded once more on top", () => {
		const context = at("js");
		const bare = earnedBy([CONFIGS.agentsMd, CONFIGS.codeCoverage], context, 1, 1);
		expect(
			answerPayoutFor(
				[CONFIGS.strict, CONFIGS.agentsMd, CONFIGS.codeCoverage],
				context,
				1,
				1,
				0.5
			).earned
		).toBe(roundToTwoDecimals(bare + 0.5));
	});
});

describe("the receipt one answer carries", () => {
	const breakdownOf = (
		configs: Parameters<typeof answerPayoutFor>[0],
		context: PayoutContext,
		share: number,
		streakBefore = 0,
		wagerUnits = 0
	) => answerPayoutFor(configs, context, share, streakBefore, wagerUnits).breakdown;

	it("gives a bare correct answer the flat base with no bonuses", () => {
		expect(breakdownOf([], at("js"), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("states the doubled figure as the base on a multiple-choice poll", () => {
		expect(breakdownOf([], at("js", 1, "multiple"), 1)).toEqual({
			base: BASE * 2,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("splits an Amplify multiplier into its own config chip", () => {
		expect(breakdownOf([CONFIGS.agentsMd], at("js"), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "agents-md", value: BASE, factor: 2 }],
		});
	});

	it("reads the streak step on its own row, not as a config chip", () => {
		expect(breakdownOf([], at("js"), 1, 3)).toEqual({
			base: BASE,
			streakBonus: 0.1,
			configBonuses: [],
		});
	});

	it("keeps the rows summing to the paid total once the streak is running", () => {
		const build = [CONFIGS.agentsMd];
		const breakdown = breakdownOf(build, at("js"), 1, 3);
		const rows =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((sum, bonus) => sum + bonus.value, 0);

		expect(rows).toBeCloseTo(earnedBy(build, at("js"), 1, 3));
	});

	it("splits a flat coverage add into its own config chip", () => {
		expect(breakdownOf([CONFIGS.codeCoverage], at("js"), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "code-coverage", value: BASE * 0.1 }],
		});
	});

	it("chips Cold Start's dead opener as a loss and its throttle as a gain", () => {
		expect(breakdownOf([CONFIGS.coldStart], at("js", 0), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "cold-start", value: -BASE, factor: 0 }],
		});
		expect(breakdownOf([CONFIGS.coldStart], at("js", 1), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "cold-start", value: BASE * 0.5, factor: 1.5 },
			],
		});
	});

	it("chips Overclock's throttle as a negative bonus off the opener", () => {
		expect(breakdownOf([CONFIGS.overclock], at("js", 0), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: BASE * 3, factor: 4 }],
		});
		expect(breakdownOf([CONFIGS.overclock], at("js", 1), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "overclock", value: -BASE * 0.5, factor: 0.5 },
			],
		});
	});

	it("names the streak step in the equation once one is running", () => {
		expect(breakdownOf([CONFIGS.js], at("js"), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [
				{ configId: "js", value: roundToTwoDecimals(BASE * 0.25), factor: 1.25 },
			],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
		expect(breakdownOf([CONFIGS.eslint, CONFIGS.js], at("css"), 1)).toEqual({
			base: BASE,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("chips .prettierrc's top-up as its own row, so the base stays the answer's own figure", () => {
		expect(
			breakdownOf([CONFIGS.prettierrc], at("js", 1, "multiple"), 0.25)
		).toEqual({
			base: 0.5,
			streakBonus: 0,
			configBonuses: [{ configId: "prettierrc", value: 0.5 }],
		});
	});

	it("hides .prettierrc on a half catch, which was already a whole unit", () => {
		expect(
			breakdownOf([CONFIGS.prettierrc], at("js", 1, "multiple"), 0.5)
		).toEqual({ base: 1, streakBonus: 0, configBonuses: [] });
	});

	it("sums .prettierrc's row with a multiplier's to the figure that was paid", () => {
		const build = [CONFIGS.prettierrc, CONFIGS.agentsMd];
		const context = at("js", 1, "multiple");
		const breakdown = breakdownOf(build, context, 0.25);

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
		).toBe(earnedBy(build, context, 0.25));
	});

	it("carries a miss as a flat nothing: the slot is the cost, not a bleed", () => {
		expect(breakdownOf([CONFIGS.agentsMd], at("js"), 0, 3)).toEqual({
			base: 0,
			streakBonus: 0,
			configBonuses: [],
		});
	});

	it("credits a flat add at face value and the ×mult on the base alone, listing the mult last", () => {
		expect(
			breakdownOf([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
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
		const order = breakdownOf(
			[CONFIGS.agentsMd, CONFIGS.codeCoverage],
			at("js"),
			1
		).configBonuses.map((bonus) => bonus.configId);
		expect(order).toEqual(["code-coverage", "agents-md"]);
	});

	it("leaves a flat adder without a factor, since it never multiplied", () => {
		const [bonus] = breakdownOf([CONFIGS.codeCoverage], at("js"), 1)
			.configBonuses;
		expect(bonus).not.toHaveProperty("factor");
	});

	it("carries the throttled factor once the opener is spent", () => {
		expect(
			breakdownOf([CONFIGS.overclock], at("js", 1), 1).configBonuses
		).toEqual([{ configId: "overclock", value: -BASE * 0.5, factor: 0.5 }]);
	});

	it("keeps base + streak + configs summing to the engine's earned coverage", () => {
		const configs = [CONFIGS.agentsMd, CONFIGS.codeCoverage];
		const breakdown = breakdownOf(configs, at("js"), 1);
		const sum =
			breakdown.base +
			breakdown.streakBonus +
			breakdown.configBonuses.reduce((total, bonus) => total + bonus.value, 0);
		expect(roundToTwoDecimals(sum)).toBe(earnedBy(configs, at("js"), 1));
	});

	describe("for an armed wager", () => {
		const context = at("react", 0);

		it("names the wager as its own row, so the chip that paid lights up", () => {
			expect(
				breakdownOf([CONFIGS.strict], context, 1, 0, 0.5).configBonuses
			).toEqual([{ configId: "strict", value: 0.5 }]);
		});

		it("keeps the base honest, so the rows still sum to what was paid", () => {
			const breakdown = breakdownOf(
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
			expect(breakdownOf([CONFIGS.strict], context, 1).configBonuses).toEqual(
				[]
			);
		});
	});
});

describe("the factors one answer reports", () => {
	const factorsOf = (
		configs: Parameters<typeof answerPayoutFor>[0],
		context: PayoutContext,
		share: number
	) => answerPayoutFor(configs, context, share).factors;

	it("hands back the share and the build's combined factor", () => {
		expect(factorsOf([CONFIGS.js], at("js"), 1)).toEqual({
			correct: 1,
			build: 1.25,
		});
	});

	it("reports the multiplier product as the build factor, leaving flat adds out of it", () => {
		expect(
			factorsOf([CONFIGS.agentsMd, CONFIGS.codeCoverage], at("js"), 1)
		).toEqual({ correct: 1, build: 2 });
	});

	it("reads a bare build as ×1 rather than pretending it contributed", () => {
		expect(factorsOf([], at("js"), 2)).toEqual({ correct: 2, build: 1 });
	});

	it("hands back nothing at all for a wrong answer", () => {
		expect(factorsOf([CONFIGS.js], at("js"), 0)).toBeUndefined();
	});
});

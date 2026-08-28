import { describe, expect, it } from "vitest";

import {
	BASE_STREAK_STEPS,
	MAX_EXTRA_SPOTS,
	SLICE_WINDOW,
	SPOT_RUNGS,
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
	BASE_SPOTS,
	FREE_SPOTS_CEILING,
	MAX_SPOTS,
	coverageBreakdownForAnswer,
	coverageFactorsForAnswer,
	coverageForAnswer,
	freeSpots,
	gateClearPayout,
	canLint,
	extraPickPayoutFor,
	hasRoomFor,
	isBare,
	isOverCapacity,
	occupiedSpots,
	overflowSpots,
	perAnswerPreviewFor,
	pipelineModifiersFor,
	rewardMultiplierFor,
	streakCapStepsFor,
	storageInterestFor,
	stripConfig,
} from "~/modules/run/pipeline/domain/pipeline.model";

describe("capacity is spots, off the width ladder (ADR-044/045)", () => {
	it("opens on the first rung's four — a nibble is the biggest thing that fits", () => {
		expect(BASE_SPOTS).toBe(4);
		expect(SPOT_RUNGS[0].spots).toBe(BASE_SPOTS);
		expect(SPOT_RUNGS[0].fromGate).toBe(0);
	});

	it("tops out at the last rung's width plus every extra spot for sale", () => {
		expect(FREE_SPOTS_CEILING).toBe(24);
		expect(SPOT_RUNGS.at(-1)?.spots).toBe(FREE_SPOTS_CEILING);
		expect(MAX_SPOTS).toBe(FREE_SPOTS_CEILING + MAX_EXTRA_SPOTS);
	});
});

describe("what fills the pipeline (ADR-044)", () => {
	it("charges each config the bits its grade is named for", () => {
		expect(occupiedSpots([CONFIGS.js])).toBe(1);
		expect(occupiedSpots([CONFIGS.indexedDb])).toBe(2);
		expect(occupiedSpots([CONFIGS.wtfpl])).toBe(8);
		expect(occupiedSpots([CONFIGS.js, CONFIGS.indexedDb])).toBe(3);
	});

	it("refuses a config that does not fit, and admits a smaller one", () => {
		const narrow: Pipeline = {
			id: "hyrule-ci",
			spots: 4,
			configs: [CONFIGS.indexedDb],
		};
		expect(freeSpots(narrow)).toBe(2);
		expect(hasRoomFor(narrow, 2)).toBe(true);
		expect(hasRoomFor(narrow, 4)).toBe(false);
	});

	it("reports an overflow rather than pretending the build shrank", () => {
		const repossessed: Pipeline = {
			id: "hyrule-ci",
			spots: 4,
			configs: [CONFIGS.wtfpl],
		};
		expect(isOverCapacity(repossessed)).toBe(true);
		expect(overflowSpots(repossessed)).toBe(4);
		expect(freeSpots(repossessed)).toBe(0);
	});
});

const pipelineWith = (configs: Config[]): Pipeline => ({
	id: "hyrule-ci",
	spots: BASE_SPOTS,
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
		).toBe(3);
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
			streakCapMultiplier: 2,
		});
	});

	it("caps the streak at the base ten steps on a build that sells no headroom", () => {
		expect(streakCapStepsFor([])).toBe(BASE_STREAK_STEPS);
		expect(perAnswerPreviewFor([], 0).streakCapMultiplier).toBe(2);
	});

	it("adds a headroom config's steps to the cap, so the ceiling moves with the build", () => {
		const headroom = { ...CONFIGS.js, id: "flow", streakCapSteps: 5 };

		expect(streakCapStepsFor([headroom])).toBe(BASE_STREAK_STEPS + 5);
		expect(perAnswerPreviewFor([headroom], 0).streakCapMultiplier).toBe(2.5);
	});

	it("carries the streak step, since even the first correct answer rides one", () => {
		expect(perAnswerPreviewFor([], 0).streakStepMultiplier).toBe(1.1);
	});

	it("scales coverage with gate depth, riding the same curve as gateClearPayout", () => {
		expect(perAnswerPreviewFor([], 4).coveragePerCorrect).toBe(5);
	});

	it("folds in build-wide coverage mults/adds, excluding Focus bonuses", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd, CONFIGS.codeCoverage], 0)
				.coveragePerCorrect
		).toBe(3);
	});

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
		expect(perAnswerPreviewFor([], 0).coveragePerWrong).toBe(-0.5);
		expect(perAnswerPreviewFor([], 4).coveragePerWrong).toBe(-2.5);
	});

	it("follows a config that only adds flat coverage, rather than ignoring it", () => {
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
		).toBe(1.75);
	});

	it("omits the matching-config multiplier with no Focus config equipped", () => {
		expect(
			perAnswerPreviewFor([CONFIGS.agentsMd], 0).matchingConfigMultiplier
		).toBeUndefined();
	});

	it("folds Overclock's throttle into the floor — the opener bonus stays out", () => {
		expect(perAnswerPreviewFor([CONFIGS.overclock], 0).coveragePerCorrect).toBe(
			0.5
		);
		expect(perAnswerPreviewFor([CONFIGS.coldStart], 0).coveragePerCorrect).toBe(
			1
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

	it("pays a 0/5 clear nothing — a farm build banks no storage (ADR-017)", () => {
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
		);
	});

	it("scales Focus with level and pays nothing for a wrong answer", () => {
		expect(coverageForAnswer([{ ...CONFIGS.js, level: 2 }], at("js"), 1)).toBe(
			1.5
		);
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0)).toBe(0);
	});

	it("pays a partial share proportionally, configs included", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 0.5)).toBe(0.6);
	});

	it("applies the streak factor last, over base × configs", () => {
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1, 1.3)).toBe(1.6);
		expect(coverageForAnswer([CONFIGS.js], at("js"), 1, 1)).toBe(1.3);
	});

	it("applies multipliers last, so a ×mult amplifies flat adds too", () => {
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
		expect(
			coverageBreakdownForAnswer([CONFIGS.overclock], at("js", 1), 1, 1, 0)
		).toEqual({
			base: 1,
			streakBonus: 0,
			configBonuses: [{ configId: "overclock", value: -0.5 }],
		});
	});

	it("pulls the streak factor into its own bonus over base + configs", () => {
		expect(
			coverageBreakdownForAnswer([CONFIGS.js], at("js"), 1, 1.3, 0)
		).toEqual({
			base: 1,
			streakBonus: 0.3,
			configBonuses: [{ configId: "js", value: 0.3 }],
		});
	});

	it("excludes configs with no coverage effect on the category", () => {
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
		expect(canLint([CONFIGS.eslint], "ts")).toBe(true);
		expect(canLint([CONFIGS.eslint], "css")).toBe(false);
		expect(canLint([CONFIGS.stylelint], "css")).toBe(true);
		expect(canLint([CONFIGS.js, CONFIGS.agentsMd], "js")).toBe(false);
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

describe("coverageFactorsForAnswer", () => {
	it("hands back the share, the build's combined factor, and the streak", () => {
		expect(coverageFactorsForAnswer([CONFIGS.js], at("js"), 1, 1.1)).toEqual({
			correct: 1,
			build: 1.25,
			streak: 1.1,
		});
	});

	it("folds adds and multipliers into one build factor, adds first", () => {
		expect(
			coverageFactorsForAnswer(
				[CONFIGS.codeCoverage, CONFIGS.agentsMd],
				at("js"),
				1,
				1
			)
		).toEqual({ correct: 1, build: 3, streak: 1 });
	});

	it("reads a bare build as ×1 rather than pretending it contributed", () => {
		expect(coverageFactorsForAnswer([], at("js"), 2, 1)).toEqual({
			correct: 2,
			build: 1,
			streak: 1,
		});
	});

	it("has no factors for a miss — nothing multiplied", () => {
		expect(coverageFactorsForAnswer([CONFIGS.js], at("js"), 0, 1)).toBe(
			undefined
		);
	});
});

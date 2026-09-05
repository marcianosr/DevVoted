import { describe, expect, it } from "vitest";

import {
	autoUpgradeOnAnswer,
	autoUpgradeRemaining,
} from "~/modules/run/config/domain/autoUpgrade.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

// Firing is decided by the count alone; the seed only picks the target.
// Picks index the candidates sorted by id, verified against the LCG in
// seededRandom: with three candidates, "beta" picks the first, "eta" the second.
const PICKS_FIRST = "beta";
const PICKS_SECOND = "eta";

const NEEDED = 5;

// Sorted candidate ids: dependabot, js, unit-tests.
const build: readonly Config[] = [
	CONFIGS.dependabot,
	CONFIGS.js,
	CONFIGS.unitTests,
];

const answerCorrectly = (
	configs: readonly Config[],
	times: number,
	seed: string
) => {
	let state = { configs, progress: 0 };
	const bumps: string[] = [];
	for (let i = 0; i < times; i++) {
		const next = autoUpgradeOnAnswer(
			state.configs,
			state.progress,
			"correct",
			seed
		);
		if (next.bumped) bumps.push(next.bumped.id);
		state = { configs: next.configs, progress: next.progress };
	}
	return { ...state, bumps };
};

describe("autoUpgradeOnAnswer", () => {
	it("leaves a build without Dependabot untouched however long the run goes", () => {
		const plain = [CONFIGS.js, CONFIGS.unitTests];
		const result = answerCorrectly(plain, 20, PICKS_FIRST);
		expect(result.bumps).toEqual([]);
		expect(result.configs).toEqual(plain);
	});

	it("holds its fire until the fifth correct answer in a row", () => {
		const four = answerCorrectly(build, 4, PICKS_SECOND);
		expect(four.bumps).toEqual([]);
		expect(four.progress).toBe(4);

		const five = answerCorrectly(build, 5, PICKS_SECOND);
		expect(five.bumps).toEqual(["js"]);
		expect(five.progress).toBe(0);
	});

	it("levels exactly one config by one when it fires", () => {
		const result = answerCorrectly(build, NEEDED, PICKS_SECOND);
		expect(
			result.configs.filter((config) => (config.level ?? 1) > 1)
		).toHaveLength(1);
		expect(result.configs).toHaveLength(build.length);
	});

	it("starts the count over on a wrong answer", () => {
		const four = answerCorrectly(build, 4, PICKS_SECOND);
		const wrong = autoUpgradeOnAnswer(
			four.configs,
			four.progress,
			"wrong",
			PICKS_SECOND
		);
		expect(wrong.progress).toBe(0);
		expect(wrong.bumped).toBeUndefined();
	});

	it("leaves the count alone on a partial answer — it neither advances nor resets", () => {
		const three = answerCorrectly(build, 3, PICKS_SECOND);
		const partial = autoUpgradeOnAnswer(
			three.configs,
			three.progress,
			"partial",
			PICKS_SECOND
		);
		expect(partial.progress).toBe(3);
		expect(partial.bumped).toBeUndefined();
	});

	it("fires again every fifth answer, so a clean run keeps paying", () => {
		const result = answerCorrectly(build, 15, PICKS_SECOND);
		expect(result.bumps).toHaveLength(3);
	});

	it("bumps a Focus config no mastery has earned — merges land without review", () => {
		// .js at L1 with zero JavaScript coverage anywhere: the shop would refuse
		// this upgrade, Dependabot does not (Option A, 2026-08-20).
		const result = answerCorrectly(build, NEEDED, PICKS_SECOND);
		expect(result.bumps).toEqual(["js"]);
	});

	it("can bump Dependabot itself — it is in the build too", () => {
		const result = answerCorrectly(build, NEEDED, PICKS_FIRST);
		expect(result.bumps).toEqual(["dependabot"]);
	});

	it("changes nothing when the count completes but nothing can level", () => {
		// Dependabot at its cap, ESLint has no level axis: no candidates.
		const maxed = { ...CONFIGS.dependabot, level: 2 };
		const stuck = [maxed, CONFIGS.eslint];
		const result = answerCorrectly(stuck, 10, PICKS_FIRST);
		expect(result.bumps).toEqual([]);
		expect(result.configs).toEqual(stuck);
	});

	it("needs one fewer answer at L2 — the level shortens the count", () => {
		const atLevelTwo = [
			{ ...CONFIGS.dependabot, level: 2 },
			CONFIGS.js,
			CONFIGS.unitTests,
		];
		expect(answerCorrectly(atLevelTwo, 4, PICKS_SECOND).bumps).toHaveLength(1);
		expect(answerCorrectly(build, 4, PICKS_SECOND).bumps).toHaveLength(0);
	});

	it("names the config that fired alongside the one it bumped", () => {
		const four = answerCorrectly(build, 4, PICKS_SECOND);
		const fired = autoUpgradeOnAnswer(
			four.configs,
			four.progress,
			"correct",
			PICKS_SECOND
		);
		expect(fired.by?.id).toBe(CONFIGS.dependabot.id);
		expect(fired.bumped?.id).not.toBe(CONFIGS.dependabot.id);
	});

	it("names no cause on an answer that only advances the count", () => {
		const one = autoUpgradeOnAnswer(build, 0, "correct", PICKS_SECOND);
		expect(one.by).toBeUndefined();
		expect(one.bumped).toBeUndefined();
	});

	it("replays the same outcome for the same count and seed", () => {
		const first = autoUpgradeOnAnswer(build, 4, "correct", PICKS_SECOND);
		const second = autoUpgradeOnAnswer(build, 4, "correct", PICKS_SECOND);
		expect(first.bumped?.id).toBe(second.bumped?.id);
		expect(first.configs).toEqual(second.configs);
	});
});

describe("autoUpgradeRemaining", () => {
	it("counts down from five as correct answers land", () => {
		expect(autoUpgradeRemaining(build, 0)).toBe(5);
		expect(autoUpgradeRemaining(build, 3)).toBe(2);
		expect(autoUpgradeRemaining(build, 4)).toBe(1);
	});

	it("counts down from four once Dependabot is at L2", () => {
		const atLevelTwo = [{ ...CONFIGS.dependabot, level: 2 }, CONFIGS.js];
		expect(autoUpgradeRemaining(atLevelTwo, 0)).toBe(4);
	});

	it("stays undefined for a build with nothing that auto-upgrades", () => {
		expect(autoUpgradeRemaining([CONFIGS.js], 0)).toBeUndefined();
	});
});

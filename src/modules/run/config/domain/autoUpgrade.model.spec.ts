import { describe, expect, it } from "vitest";

import { autoUpgradeOnClear } from "~/modules/run/config/domain/autoUpgrade.model";
import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

// Seed outcomes are fixed by the LCG in seededRandom, verified against it:
// "beta" and "eta" hit the 1-in-3 roll, "gamma" misses at 1-in-3 and 1-in-2,
// "alpha" misses at 1-in-3 but hits at 1-in-2. Picks index the candidates
// sorted by id: with three candidates, "beta" picks the first, "eta" the second.
const HIT_PICKS_FIRST = "beta";
const HIT_PICKS_SECOND = "eta";
const MISS = "gamma";
const HIT_ONLY_AT_ONE_IN_TWO = "alpha";

// Sorted candidate ids: dependabot, js, unit-tests.
const build: readonly Config[] = [
	CONFIGS.dependabot,
	CONFIGS.js,
	CONFIGS.unitTests,
];

describe("autoUpgradeOnClear", () => {
	it("leaves a build without Dependabot untouched, even on a hitting seed", () => {
		const result = autoUpgradeOnClear(
			[CONFIGS.js, CONFIGS.unitTests],
			HIT_PICKS_FIRST
		);
		expect(result.bumped).toBeUndefined();
		expect(result.configs).toEqual([CONFIGS.js, CONFIGS.unitTests]);
	});

	it("changes nothing when the roll misses", () => {
		const result = autoUpgradeOnClear(build, MISS);
		expect(result.bumped).toBeUndefined();
		expect(result.configs).toEqual(build);
	});

	it("levels exactly one config by one when the roll hits", () => {
		const result = autoUpgradeOnClear(build, HIT_PICKS_SECOND);
		expect(result.bumped?.id).toBe("js");
		expect(result.bumped?.level).toBe(2);
		expect(result.configs.filter((config) => (config.level ?? 1) > 1)).toEqual([
			result.bumped,
		]);
		expect(result.configs).toHaveLength(build.length);
	});

	it("bumps a Focus config no mastery has earned — merges land without review", () => {
		// .js at L1 with zero JavaScript coverage anywhere: the shop would refuse
		// this upgrade, Dependabot does not (Option A, 2026-08-20).
		const result = autoUpgradeOnClear(build, HIT_PICKS_SECOND);
		expect(result.bumped?.id).toBe("js");
		expect(result.bumped?.level).toBe(2);
	});

	it("can bump Dependabot itself — it is in the build too", () => {
		const result = autoUpgradeOnClear(build, HIT_PICKS_FIRST);
		expect(result.bumped?.id).toBe("dependabot");
		expect(result.bumped?.level).toBe(2);
	});

	it("changes nothing when the roll hits but nothing can level", () => {
		// Dependabot at its cap, ESLint has no level axis: no candidates.
		const maxed = { ...CONFIGS.dependabot, level: 2 };
		const result = autoUpgradeOnClear(
			[maxed, CONFIGS.eslint],
			HIT_ONLY_AT_ONE_IN_TWO
		);
		expect(result.bumped).toBeUndefined();
		expect(result.configs).toEqual([maxed, CONFIGS.eslint]);
	});

	it("rolls 1-in-2 once Dependabot is at L2 — the same seed that missed at L1 hits", () => {
		const atLevelTwo = [
			{ ...CONFIGS.dependabot, level: 2 },
			CONFIGS.js,
			CONFIGS.unitTests,
		];
		expect(
			autoUpgradeOnClear(build, HIT_ONLY_AT_ONE_IN_TWO).bumped
		).toBeUndefined();
		expect(
			autoUpgradeOnClear(atLevelTwo, HIT_ONLY_AT_ONE_IN_TWO).bumped
		).toBeDefined();
	});

	it("replays the same outcome for the same seed", () => {
		const first = autoUpgradeOnClear(build, HIT_PICKS_SECOND);
		const second = autoUpgradeOnClear(build, HIT_PICKS_SECOND);
		expect(first.bumped?.id).toBe(second.bumped?.id);
		expect(first.configs).toEqual(second.configs);
	});
});

import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import {
	HAND_SIZE,
	startingHand,
	STARTER_POOL,
} from "~/modules/run/config/domain/hand.model";

const ids = (configs: readonly Config[]) => configs.map((config) => config.id);

const hasFocus = (configs: readonly Config[]) =>
	configs.some((config) => config.focusCategory !== undefined);

describe("startingHand", () => {
	it("deals HAND_SIZE configs from the pool", () => {
		const hand = startingHand(STARTER_POOL, "kanto");

		expect(hand).toHaveLength(HAND_SIZE);
		expect(new Set(ids(hand)).size).toBe(HAND_SIZE);
	});

	it("deals only configs the pool holds, never the wider roster", () => {
		const poolIds = new Set(ids(STARTER_POOL));

		ids(startingHand(STARTER_POOL, "pallet")).forEach((id) =>
			expect(poolIds.has(id)).toBe(true)
		);
	});

	it("deals the same hand twice for one seed, so a reload keeps its cards", () => {
		expect(ids(startingHand(STARTER_POOL, "viridian"))).toEqual(
			ids(startingHand(STARTER_POOL, "viridian"))
		);
	});

	it("deals different hands to different seeds", () => {
		const seeds = ["cerulean", "vermilion", "saffron", "celadon", "fuchsia"];
		const hands = seeds.map((seed) =>
			ids(startingHand(STARTER_POOL, seed)).join()
		);

		expect(new Set(hands).size).toBeGreaterThan(1);
	});

	// Aim decides runs, so a hand with no category multiplier is broken rather
	// than merely unlucky.
	it("always deals a focus config, whatever the seed", () => {
		const seeds = Array.from({ length: 200 }, (_, index) => `seed-${index}`);

		seeds.forEach((seed) =>
			expect(hasFocus(startingHand(STARTER_POOL, seed))).toBe(true)
		);
	});

	it("trades a card for a focus config when the draw comes up with none", () => {
		// One focus config, sat past the draw on every seed but its own: the
		// guarantee has to reach back into the undealt half to find it.
		const focusLast: readonly Config[] = [
			CONFIGS.unitTests,
			CONFIGS.agentsMd,
			CONFIGS.codeCoverage,
			CONFIGS.indexedDb,
			CONFIGS.coverageGain,
			CONFIGS.coldStart,
			CONFIGS.mooresLaw,
			CONFIGS.js,
		];

		const hand = startingHand(focusLast, "no-focus-in-sight");

		expect(hand).toHaveLength(HAND_SIZE);
		expect(ids(hand)).toContain(CONFIGS.js.id);
		expect(new Set(ids(hand)).size).toBe(HAND_SIZE);
	});

	it("deals a focus-free hand rather than inventing one the pool lacks", () => {
		const noFocus: readonly Config[] = [
			CONFIGS.unitTests,
			CONFIGS.agentsMd,
			CONFIGS.codeCoverage,
			CONFIGS.indexedDb,
			CONFIGS.coverageGain,
			CONFIGS.coldStart,
			CONFIGS.mooresLaw,
		];

		const hand = startingHand(noFocus, "nothing-to-aim-with");

		expect(hand).toHaveLength(HAND_SIZE);
		expect(hasFocus(hand)).toBe(false);
	});

	it("deals the whole pool when it is shorter than a hand", () => {
		const thin: readonly Config[] = [CONFIGS.js, CONFIGS.unitTests];

		expect(startingHand(thin, "run-one")).toHaveLength(2);
	});

	it("leaves the pool it was handed untouched", () => {
		const pool = [...STARTER_POOL];
		startingHand(pool, "lavender");

		expect(ids(pool)).toEqual(ids(STARTER_POOL));
	});
});

describe("STARTER_POOL", () => {
	// A pool that could not fill a hand would make HAND_SIZE a lie, and one with
	// no focus configs would make the guarantee unsatisfiable.
	it("holds enough configs to fill a hand, with something to aim by", () => {
		expect(STARTER_POOL.length).toBeGreaterThanOrEqual(HAND_SIZE);
		expect(hasFocus(STARTER_POOL)).toBe(true);
	});

	// Handed configs are free; the expensive half of the roster is what drafting
	// is for.
	it("hands out nothing the shop prices as a drawback", () => {
		STARTER_POOL.forEach((config) => expect(config.draftCost).toBeUndefined());
	});
});

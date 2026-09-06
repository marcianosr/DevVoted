import { describe, expect, it } from "vitest";

import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import {
	CONFIG_LIST,
	CONFIGS,
} from "~/modules/run/config/domain/configRoster.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";
import {
	FOCUS_BAND,
	HAND_SIZE,
	PAIRABLE_PICKS,
	RECOMMENDED_SIZE,
	recommendedPicks,
	startingHand,
	STARTER_POOL,
} from "~/modules/run/config/domain/hand.model";

const SLOT_BUDGET = 4;

const ids = (configs: readonly Config[]) => configs.map((config) => config.id);

const hasFocus = (configs: readonly Config[]) =>
	configs.some((config) => config.focusCategory !== undefined);

const focusCount = (configs: readonly Config[]) =>
	configs.filter((config) => config.focusCategory !== undefined).length;

const smallestPicksOccupy = (configs: readonly Config[]) =>
	[...configs]
		.sort((one, other) => slotsOf(one) - slotsOf(other))
		.slice(0, PAIRABLE_PICKS)
		.reduce((total, config) => total + slotsOf(config), 0);

const seeds = (count: number) =>
	Array.from({ length: count }, (_, index) => `seed-${index}`);

describe("startingHand", () => {
	it("deals HAND_SIZE configs from the pool", () => {
		const hand = startingHand(STARTER_POOL, "kanto", SLOT_BUDGET);

		expect(hand).toHaveLength(HAND_SIZE);
		expect(new Set(ids(hand)).size).toBe(HAND_SIZE);
	});

	it("deals only configs the pool holds, never the wider roster", () => {
		const poolIds = new Set(ids(STARTER_POOL));

		ids(startingHand(STARTER_POOL, "pallet", SLOT_BUDGET)).forEach((id) =>
			expect(poolIds.has(id)).toBe(true)
		);
	});

	it("deals the same hand twice for one seed, so a reload keeps its cards", () => {
		expect(ids(startingHand(STARTER_POOL, "viridian", SLOT_BUDGET))).toEqual(
			ids(startingHand(STARTER_POOL, "viridian", SLOT_BUDGET))
		);
	});

	it("deals different hands to different seeds", () => {
		const hands = [
			"cerulean",
			"vermilion",
			"saffron",
			"celadon",
			"fuchsia",
		].map((seed) => ids(startingHand(STARTER_POOL, seed, SLOT_BUDGET)).join());

		expect(new Set(hands).size).toBeGreaterThan(1);
	});

	// Aim decides runs, so a hand with no category multiplier is broken rather
	// than merely unlucky.
	it("always deals a focus config, whatever the seed", () => {
		seeds(200).forEach((seed) =>
			expect(hasFocus(startingHand(STARTER_POOL, seed, SLOT_BUDGET))).toBe(true)
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
			CONFIGS.abTest,
			CONFIGS.coldStart,
			CONFIGS.mooresLaw,
			CONFIGS.js,
		];

		const hand = startingHand(focusLast, "no-focus-in-sight", SLOT_BUDGET);

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
			CONFIGS.abTest,
			CONFIGS.coldStart,
			CONFIGS.mooresLaw,
		];

		const hand = startingHand(noFocus, "nothing-to-aim-with", SLOT_BUDGET);

		expect(hand).toHaveLength(HAND_SIZE);
		expect(hasFocus(hand)).toBe(false);
	});

	it("deals the whole pool when it is shorter than a hand", () => {
		const thin: readonly Config[] = [CONFIGS.js, CONFIGS.unitTests];

		expect(startingHand(thin, "run-one", SLOT_BUDGET)).toHaveLength(2);
	});

	it("leaves the pool it was handed untouched", () => {
		const pool = [...STARTER_POOL];
		startingHand(pool, "lavender", SLOT_BUDGET);

		expect(ids(pool)).toEqual(ids(STARTER_POOL));
	});
});

// ADR-062. STARTER_POOL's curation held these by construction; a draw from the
// account's granted pool (DVTD-p9ah) does not, so the draw enforces them.
describe("startingHand guarantees", () => {
	it("never deals a config the slot budget cannot install", () => {
		const oversized = [CONFIGS.agentsMd, CONFIGS.volkswagenCi];

		seeds(200).forEach((seed) => {
			const dealt = ids(startingHand(CONFIG_LIST, seed, SLOT_BUDGET));

			oversized.forEach((config) => expect(dealt).not.toContain(config.id));
		});
	});

	// The rule is larger-than, not as-large-as: a config that exactly fills the
	// budget is a legal all-in opening, not a dead card.
	it("still deals a config that exactly fills the budget", () => {
		const dealtSomewhere = seeds(200).some((seed) =>
			ids(startingHand(CONFIG_LIST, seed, SLOT_BUDGET)).includes(
				CONFIGS.intellisense.id
			)
		);

		expect(slotsOf(CONFIGS.intellisense)).toBe(SLOT_BUDGET);
		expect(dealtSomewhere).toBe(true);
	});

	it("deals a config the budget can install even when the pool is all oversized but one", () => {
		const oneAffordable: readonly Config[] = [
			CONFIGS.agentsMd,
			CONFIGS.volkswagenCi,
			CONFIGS.js,
		];

		expect(ids(startingHand(oneAffordable, "squeeze", SLOT_BUDGET))).toEqual([
			CONFIGS.js.id,
		]);
	});

	it("deals one or two focus configs, never a hand of five category bets", () => {
		seeds(200).forEach((seed) => {
			const dealt = startingHand(CONFIG_LIST, seed, SLOT_BUDGET);

			expect(focusCount(dealt)).toBeGreaterThanOrEqual(FOCUS_BAND.min);
			expect(focusCount(dealt)).toBeLessThanOrEqual(FOCUS_BAND.max);
		});
	});

	it("varies the focus count across seeds rather than pinning one end of the band", () => {
		const counts = new Set(
			seeds(200).map((seed) =>
				focusCount(startingHand(CONFIG_LIST, seed, SLOT_BUDGET))
			)
		);

		expect(counts).toEqual(new Set([FOCUS_BAND.min, FOCUS_BAND.max]));
	});

	// The floor is one config (ADR-057); a hand whose cards cannot sit together
	// would make that floor the ceiling too.
	it("deals PAIRABLE_PICKS configs that fit the budget together", () => {
		seeds(200).forEach((seed) => {
			const dealt = startingHand(CONFIG_LIST, seed, SLOT_BUDGET);

			expect(smallestPicksOccupy(dealt)).toBeLessThanOrEqual(SLOT_BUDGET);
		});
	});

	it("trades a crowding card for a smaller one when the draw cannot pair", () => {
		// Four 2-slot configs and one 1-slot: any three of the 2-slot cards
		// overshoot a budget of 4, so the draw has to reach for the small ones.
		const crowded: readonly Config[] = [
			CONFIGS.codeCoverage,
			CONFIGS.indexedDb,
			CONFIGS.coldStart,
			CONFIGS.gitRebase,
			CONFIGS.js,
			CONFIGS.ts,
			CONFIGS.unitTests,
		];

		seeds(50).forEach((seed) => {
			const dealt = startingHand(crowded, seed, SLOT_BUDGET);

			expect(smallestPicksOccupy(dealt)).toBeLessThanOrEqual(SLOT_BUDGET);
		});
	});

	it("keeps the focus config when repairing a hand down to size", () => {
		const oneFocusManyBulky: readonly Config[] = [
			CONFIGS.codeCoverage,
			CONFIGS.indexedDb,
			CONFIGS.coldStart,
			CONFIGS.gitRebase,
			CONFIGS.js,
			CONFIGS.unitTests,
			CONFIGS.eslint,
		];

		seeds(50).forEach((seed) =>
			expect(hasFocus(startingHand(oneFocusManyBulky, seed, SLOT_BUDGET))).toBe(
				true
			)
		);
	});

	// The free eight satisfy every rule by accident; only a roster-sized pool
	// proves the draw enforces them.
	it("holds every guarantee against the full roster, on every seed", () => {
		seeds(200).forEach((seed) => {
			const dealt = startingHand(CONFIG_LIST, seed, SLOT_BUDGET);

			expect(dealt).toHaveLength(HAND_SIZE);
			expect(new Set(ids(dealt)).size).toBe(HAND_SIZE);
			dealt.forEach((config) =>
				expect(slotsOf(config)).toBeLessThanOrEqual(SLOT_BUDGET)
			);
			expect(focusCount(dealt)).toBeGreaterThanOrEqual(FOCUS_BAND.min);
			expect(focusCount(dealt)).toBeLessThanOrEqual(FOCUS_BAND.max);
			expect(smallestPicksOccupy(dealt)).toBeLessThanOrEqual(SLOT_BUDGET);
		});
	});
});

describe("RECOMMENDED_SIZE", () => {
	// Every recommendedPicks spec asserts against the constant, so a slide back
	// to preselecting three would stay green without this.
	it("marks two of the five, leaving the opening a decision (ADR-057)", () => {
		expect(RECOMMENDED_SIZE).toBe(2);
		expect(HAND_SIZE).toBe(5);
	});
});

describe("STARTER_POOL", () => {
	// A pool that could not fill a hand would make HAND_SIZE a lie, and one with
	// no focus configs would make the guarantee unsatisfiable.
	it("holds enough configs to fill a hand, with something to aim by", () => {
		expect(STARTER_POOL.length).toBeGreaterThanOrEqual(HAND_SIZE);
		expect(hasFocus(STARTER_POOL)).toBe(true);
	});

	// ADR-051 Decision 2, amended 2026-09-04 to eight. The pool is the stand-in
	// for the account's granted set until DVTD-p9ah swaps it.
	it("is ADR-051's free eight, so the stand-in matches what signup will grant", () => {
		expect(ids(STARTER_POOL).sort()).toEqual(
			[
				"code-coverage",
				"cold-start",
				"css",
				"eslint",
				"indexed-db",
				"js",
				"ts",
				"unit-tests",
			].sort()
		);
	});

	it("deals a hand the budget can install, with room to pair", () => {
		STARTER_POOL.forEach((config) =>
			expect(slotsOf(config)).toBeLessThanOrEqual(SLOT_BUDGET)
		);
		expect(smallestPicksOccupy(STARTER_POOL)).toBeLessThanOrEqual(SLOT_BUDGET);
	});

	// Handed configs are free; the expensive half of the roster is what drafting
	// is for.
	it("hands out nothing the shop prices as a drawback", () => {
		STARTER_POOL.forEach((config) => expect(config.draftCost).toBeUndefined());
	});
});

describe("recommendedPicks", () => {
	const oneSlotHand: readonly Config[] = [
		CONFIGS.js,
		CONFIGS.ts,
		CONFIGS.unitTests,
		CONFIGS.eslint,
		CONFIGS.css,
	];

	it("picks RECOMMENDED_SIZE configs from the hand when they fit", () => {
		const picks = recommendedPicks(oneSlotHand, 4);
		const handIds = new Set(ids(oneSlotHand));

		expect(picks).toHaveLength(RECOMMENDED_SIZE);
		ids(picks).forEach((id) => expect(handIds.has(id)).toBe(true));
		expect(new Set(ids(picks)).size).toBe(RECOMMENDED_SIZE);
	});

	it("keeps the picks inside the slot budget, dropping to fewer when big configs crowd it", () => {
		const bulky: readonly Config[] = [
			CONFIGS.agentsMd,
			CONFIGS.codeCoverage,
			CONFIGS.indexedDb,
			CONFIGS.abTest,
			CONFIGS.js,
		];

		const picks = recommendedPicks(bulky, 4);
		const occupied = picks.reduce((total, pick) => total + slotsOf(pick), 0);

		expect(occupied).toBeLessThanOrEqual(4);
		expect(ids(picks)).not.toContain(CONFIGS.agentsMd.id);
	});

	it("always includes a focus config when the hand holds one that fits", () => {
		const picks = recommendedPicks(
			[CONFIGS.unitTests, CONFIGS.eslint, CONFIGS.indexedDb, CONFIGS.js],
			4
		);

		expect(hasFocus(picks)).toBe(true);
	});

	it("includes a coverage earner when the hand holds one", () => {
		const picks = recommendedPicks(
			[CONFIGS.unitTests, CONFIGS.eslint, CONFIGS.codeCoverage],
			4
		);

		expect(picks.some(touchesCoverage)).toBe(true);
	});

	it("recommends the same trio for the same hand, so a reload keeps the default", () => {
		expect(ids(recommendedPicks(oneSlotHand, 4))).toEqual(
			ids(recommendedPicks(oneSlotHand, 4))
		);
	});

	it("recommends nothing from an empty hand", () => {
		expect(recommendedPicks([], 4)).toEqual([]);
	});

	it("recommends nothing when no card fits the budget", () => {
		expect(recommendedPicks([CONFIGS.agentsMd], 4)).toEqual([]);
	});
});

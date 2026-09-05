import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { Config } from "~/modules/run/config/domain/config.model";
import { slotsOf } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";
import { touchesCoverage } from "~/modules/run/config/domain/effect.model";

/**
 * What a run may draw its opening hand from. Deliberately not the whole roster:
 * a handed config is free, and WTFPL alone lists at 512KB — drafting is where
 * the expensive half of the catalog is meant to be paid for.
 *
 * This is the seam the unlock system grows (DVTD-2try). Today it is one fixed
 * list for everybody; once configs carry unlock requirements it becomes the
 * account's own pool, and a wider pool is what makes a draw feel richer.
 */
export const STARTER_POOL: readonly Config[] = [
	CONFIGS.unitTests,
	CONFIGS.js,
	CONFIGS.ts,
	CONFIGS.css,
	CONFIGS.eslint,
	CONFIGS.agentsMd,
	CONFIGS.codeCoverage,
	CONFIGS.indexedDb,
	CONFIGS.coldStart,

	// ...Object.entries(CONFIGS).map(([, config]) => {
	// 	console.log("config", config);
	// 	return config;
	// }),
];

/** One more than the four slots a run opens with, so the hand is a choice
 * rather than a formality, and short enough that a first run reads it whole. */
export const HAND_SIZE = 5;

/** How many of the hand the deal marks as its suggested opening. Advice only
 * — nothing is picked for the player (ADR-057). Two of five leaves ten possible
 * pairs to second-guess, and leaves the first pick genuinely theirs. */
export const RECOMMENDED_SIZE = 2;

const isFocus = (config: Config): boolean => config.focusCategory !== undefined;

/**
 * The opening hand: a seeded draw, holding at least one focus config.
 *
 * The guarantee is not politeness. Aim decides runs — a build pointed at the
 * categories it answers well swings the win rate several times over, while
 * sheer width self-cancels — so a hand with no category multiplier in it is not
 * an interesting hand, it is a broken one.
 *
 * Seeded rather than random so a hand survives a reload and a run can be
 * replayed; the caller owns what the seed is made of.
 */
export const startingHand = (
	pool: readonly Config[],
	seed: string
): readonly Config[] => {
	const shuffled = shuffleSeeded(pool, seed);
	const hand = shuffled.slice(0, HAND_SIZE);
	if (hand.some(isFocus)) return hand;

	// Trading the last card keeps the swap inside the shuffle's own order rather
	// than picking a favourite to sacrifice.
	const focus = shuffled.slice(HAND_SIZE).find(isFocus);
	return focus ? [...hand.slice(0, HAND_SIZE - 1), focus] : hand;
};

const occupiedBy = (picks: readonly Config[]): number =>
	picks.reduce((total, pick) => total + slotsOf(pick), 0);

const fitsWith = (
	picks: readonly Config[],
	config: Config,
	maxSlots: number
): boolean => occupiedBy(picks) + slotsOf(config) <= maxSlots;

/**
 * The picks a deal marks as its recommended opening: one config to aim with,
 * one that earns coverage, then whatever fits — in hand order, so the same hand
 * always recommends the same configs (ADR-052, amended by ADR-057).
 */
export const recommendedPicks = (
	hand: readonly Config[],
	maxSlots: number
): readonly Config[] => {
	const seeded = [isFocus, touchesCoverage].reduce<readonly Config[]>(
		(picks, wanted) => {
			const next = hand.find(
				(config) =>
					!picks.includes(config) &&
					wanted(config) &&
					fitsWith(picks, config, maxSlots)
			);
			return next ? [...picks, next] : picks;
		},
		[]
	);

	return hand.reduce<readonly Config[]>(
		(picks, config) =>
			picks.length < RECOMMENDED_SIZE &&
			!picks.includes(config) &&
			fitsWith(picks, config, maxSlots)
				? [...picks, config]
				: picks,
		seeded
	);
};

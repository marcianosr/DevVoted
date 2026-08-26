import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { Config } from "~/modules/run/config/domain/config.model";
import { CONFIGS } from "~/modules/run/config/domain/configRoster.model";

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
	CONFIGS.coverageGain,
	CONFIGS.coldStart,
];

/** Twice the three slots a run opens with, so the hand is a choice rather than
 * a formality, and short enough that a first run is not asked to read ten. */
export const HAND_SIZE = 6;

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

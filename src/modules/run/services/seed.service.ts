import { SLICE_WINDOW } from "../rules.model";

/**
 * Daily seed selection (ADR-009): one seed per day produces one poll sequence,
 * identical for every player. Pure — callers persist the result to
 * daily_run_polls exactly once, so mid-day poll-pool changes can never fork
 * the shared climb.
 *
 * One gate per day (ADR-014): the day hands exactly one gate window's worth
 * of polls. Running out is the normal end of every day — the run locks and
 * tomorrow's segment unlocks it — never a terminal.
 */
export const SEED_LENGTH = SLICE_WINDOW;

/** MurmurHash3-derived string hash: seeds the PRNG from an arbitrary string. */
const xmur3 = (input: string): number => {
	let hash = 1779033703 ^ input.length;
	for (let index = 0; index < input.length; index++) {
		hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353);
		hash = (hash << 13) | (hash >>> 19);
	}
	hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
	hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
	return (hash ^= hash >>> 16) >>> 0;
};

/** Mulberry32: tiny deterministic PRNG, returns floats in [0, 1). */
const mulberry32 = (seed: number): (() => number) => {
	let state = seed;
	return () => {
		state |= 0;
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const shuffle = <T>(items: readonly T[], random: () => number): T[] => {
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const swapWith = Math.floor(random() * (index + 1));
		[shuffled[index], shuffled[swapWith]] = [
			shuffled[swapWith],
			shuffled[index],
		];
	}
	return shuffled;
};

/**
 * Rolls the day's climb sequence: a deterministic shuffle of the poll pool,
 * capped at SEED_LENGTH. Same seed + same pool = identical sequence.
 */
export const rollDailySeedSequence = (
	seed: string,
	pollIds: readonly number[]
): number[] => shuffle(pollIds, mulberry32(xmur3(seed))).slice(0, SEED_LENGTH);

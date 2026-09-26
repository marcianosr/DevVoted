import { SLICE_WINDOW } from "~/modules/run/run/domain/rules.model";

export const SEED_LENGTH = SLICE_WINDOW;

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

export const rollDailySeedSequence = (
	seed: string,
	pollIds: readonly number[]
): number[] => shuffle(pollIds, mulberry32(xmur3(seed))).slice(0, SEED_LENGTH);

/**
 * Simple seeded pseudo-random number generator
 * Based on a linear congruential generator (LCG)
 * This ensures the same seed always produces the same sequence of "random" numbers
 */
class SeededRandom {
	private seed: number;

	constructor(seed: string) {
		// Convert string seed to number using a simple hash function
		this.seed = this.hashString(seed);
	}

	private hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			// Use a better mixing function with more variation
			hash = ((hash << 5) - hash + char) >>> 0;
			hash = ((hash << 13) ^ hash) >>> 0;
			hash = ((hash * 0x5bd1e995) ^ (hash >>> 15)) >>> 0;
		}
		// Add the string length to create more variation for similar strings
		hash = (hash + str.length * 0x9e3779b9) >>> 0;
		return hash;
	}

	/**
	 * Generate next pseudo-random number between 0 and 1
	 */
	next(): number {
		// Linear congruential generator: (a * seed + c) % m
		// Using parameters from Numerical Recipes
		this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
		return this.seed / 2 ** 32;
	}

	/**
	 * Generate random integer between min (inclusive) and max (exclusive)
	 */
	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min)) + min;
	}
}

/**
 * Select a random item from an array using a seed for deterministic results
 * The same seed will always return the same item from the same array
 */
export const selectSeededRandom = <T>(array: T[], seed: string): T | null => {
	if (array.length === 0) {
		return null;
	}

	const rng = new SeededRandom(seed);
	const index = rng.nextInt(0, array.length);
	return array[index];
};

/**
 * Create a seeded random number generator instance
 * Useful when you need multiple random values with the same seed
 */
export const createSeededRandom = (seed: string): SeededRandom => {
	return new SeededRandom(seed);
};
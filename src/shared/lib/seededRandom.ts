class SeededRandom {
	private seed: number;

	constructor(seed: string) {
		this.seed = this.hashString(seed);
	}

	private hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash + char) >>> 0;
			hash = ((hash << 13) ^ hash) >>> 0;
			hash = ((hash * 0x5bd1e995) ^ (hash >>> 15)) >>> 0;
		}
		hash = (hash + str.length * 0x9e3779b9) >>> 0;
		return hash;
	}

	next(): number {
		this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
		return this.seed / 2 ** 32;
	}

	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min)) + min;
	}
}

export const selectSeededRandom = <T>(array: T[], seed: string): T | null => {
	if (array.length === 0) {
		return null;
	}

	const rng = new SeededRandom(seed);
	const index = rng.nextInt(0, array.length);
	return array[index];
};

type WeightedItem<T> = {
	item: T;
	weight: number;
};

export const selectWeightedSeededRandom = <T>(
	items: WeightedItem<T>[],
	seed: string
): T | null => {
	if (items.length === 0) return null;

	const rng = new SeededRandom(seed);

	let cumulativeWeight = 0;
	const weighted = items.map(({ item, weight }) => {
		cumulativeWeight += weight;
		return { item, cumulativeWeight };
	});

	const randomValue = rng.next() * cumulativeWeight;
	const selected = weighted.find((w) => randomValue <= w.cumulativeWeight);

	return selected?.item ?? items[0].item;
};

export const shuffleSeeded = <T>(items: readonly T[], seed: string): T[] => {
	const rng = new SeededRandom(seed);
	const shuffled = [...items];
	for (let index = shuffled.length - 1; index > 0; index--) {
		const swapWith = rng.nextInt(0, index + 1);
		[shuffled[index], shuffled[swapWith]] = [
			shuffled[swapWith],
			shuffled[index],
		];
	}
	return shuffled;
};

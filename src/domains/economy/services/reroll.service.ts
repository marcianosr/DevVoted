import { STORAGE_UNITS } from "~/lib/storage";

const fibonacciCache: number[] = [1, 1];

const getFibonacci = (n: number): number => {
	if (n < 0) return 0;
	if (fibonacciCache[n] !== undefined) return fibonacciCache[n];

	for (let i = fibonacciCache.length; i <= n; i++) {
		fibonacciCache[i] = fibonacciCache[i - 1] + fibonacciCache[i - 2];
	}

	return fibonacciCache[n];
};

export const calculateRerollCost = (currentPollRerolls: number): number => {
	return getFibonacci(currentPollRerolls) * STORAGE_UNITS.KB;
};

export const getTotalRerollsCost = (rerollCount: number): number => {
	let total = 0;
	for (let i = 0; i < rerollCount; i++) {
		total += calculateRerollCost(i);
	}
	return total;
};

export const canAffordReroll = (
	storageAvailable: number,
	currentPollRerolls: number
): boolean => {
	const cost = calculateRerollCost(currentPollRerolls);
	return storageAvailable >= cost;
};

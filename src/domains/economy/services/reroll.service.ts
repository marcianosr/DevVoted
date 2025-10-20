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

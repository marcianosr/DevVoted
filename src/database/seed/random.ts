/**
 * Deterministic string hash. Every value the seed "randomises" derives from
 * this, so `db:refresh` reproduces the same database exactly — the old seed
 * used Math.random() and drifted on every run.
 */
export const hashOf = (text: string): number =>
	[...text].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 9973, 7);

export const pickDeterministic = <T>(items: readonly T[], seed: string): T =>
	items[hashOf(seed) % items.length];

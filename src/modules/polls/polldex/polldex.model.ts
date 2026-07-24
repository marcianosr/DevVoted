import { CATEGORY_CODES, type CategoryCode } from "~/domains/shared/categories";

/**
 * One row in the Polldex — a poll plus the viewer's lifetime stats for it.
 *
 * Redaction is enforced at the type/data level: an unseen poll carries
 * `question: null` (the actual text never crosses the wire) while keeping its
 * `categoryCode` (category is metadata, not a spoiler) so filtering still works.
 */
export type PolldexEntry = {
	id: number;
	pollNumber: number | null;
	categoryCode: CategoryCode;
	seen: boolean;
	question: string | null;
	timesSeen: number;
	answeredCount: number;
	accuracy: number | null;
};

export type PolldexCategoryFilter = CategoryCode | "all";

export type PolldexCoverage = {
	seen: number;
	total: number;
	percent: number;
};

const matchesCategory = (
	entry: PolldexEntry,
	category: PolldexCategoryFilter
): boolean => category === "all" || entry.categoryCode === category;

export const filterPolldexEntries = (
	entries: PolldexEntry[],
	category: PolldexCategoryFilter
): PolldexEntry[] =>
	entries.filter((entry) => matchesCategory(entry, category));

export const polldexCoverage = (entries: PolldexEntry[]): PolldexCoverage => {
	const total = entries.length;
	const seen = entries.filter((entry) => entry.seen).length;
	const percent = total > 0 ? Math.round((seen / total) * 100) : 0;
	return { seen, total, percent };
};

/** The Pokédex number: an explicit poll_number, else the id as fallback. */
export const dexNumber = (
	entry: Pick<PolldexEntry, "pollNumber" | "id">
): number => entry.pollNumber ?? entry.id;

export const formatDexNumber = (entry: PolldexEntry): string =>
	`#${String(dexNumber(entry)).padStart(3, "0")}`;

export const sortByDexNumber = (entries: PolldexEntry[]): PolldexEntry[] =>
	[...entries].sort((a, b) => dexNumber(a) - dexNumber(b));

/** Distinct categories present in the set, in canonical `CATEGORY_CODES` order. */
export const presentCategories = (entries: PolldexEntry[]): CategoryCode[] => {
	const present = new Set(entries.map((entry) => entry.categoryCode));
	return CATEGORY_CODES.filter((code) => present.has(code));
};

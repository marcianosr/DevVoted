import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

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

/**
 * The second filter axis. Category asks "what is this poll about"; this one asks
 * how well you know it — the question a collection screen is actually opened
 * with, whether that is "show me the whole roster" or "let me re-read the ones
 * I keep getting wrong".
 *
 * `all` is the only band that admits a poll you have never been served: the
 * others are all statements about answers you have given.
 */
export type PolldexFilter = "all" | "seen" | "mastered" | "fumbled";

/**
 * Where an accuracy stops being a fumble and starts being mastery. The same two
 * numbers colour the accuracy column in the kit, which cannot import them: a
 * band a player can filter on and a band they can see must agree, so changing
 * one here means changing `accuracyTone` in `PollsPanel.ui.tsx` too.
 */
export const MASTERED_ACCURACY = 70;
export const FUMBLED_ACCURACY = 40;

export type PolldexCoverage = {
	seen: number;
	total: number;
	percent: number;
};

const matchesCategory = (
	entry: PolldexEntry,
	category: PolldexCategoryFilter
): boolean => category === "all" || entry.categoryCode === category;

/** Both bands read `accuracy`, not `seen`: a poll served but never answered has
 * no record to judge, so it is neither mastered nor fumbled. */
const isMastered = (entry: PolldexEntry): boolean =>
	entry.accuracy !== null && entry.accuracy >= MASTERED_ACCURACY;

const isFumbled = (entry: PolldexEntry): boolean =>
	entry.accuracy !== null && entry.accuracy < FUMBLED_ACCURACY;

const matchesKnowledge = (
	entry: PolldexEntry,
	filter: PolldexFilter
): boolean => {
	if (filter === "all") return true;
	if (!entry.seen) return false;
	if (filter === "seen") return true;
	return filter === "mastered" ? isMastered(entry) : isFumbled(entry);
};

/**
 * The two axes are independent and both narrow, so they are applied together
 * rather than as separate passes — "the CSS polls I keep fumbling" is the query
 * the screen exists to answer.
 */
export const filterPolldexEntries = (
	entries: PolldexEntry[],
	category: PolldexCategoryFilter,
	filter: PolldexFilter = "all"
): PolldexEntry[] =>
	entries.filter(
		(entry) =>
			matchesCategory(entry, category) && matchesKnowledge(entry, filter)
	);

/** How many entries each band holds, for the filter pills. Counted over the set
 * the caller hands in, so the pills answer "within this category" once one is
 * chosen rather than quietly reporting the whole roster. */
export const polldexTallies = (
	entries: PolldexEntry[]
): Record<PolldexFilter, number> => ({
	all: entries.length,
	seen: entries.filter((entry) => entry.seen).length,
	mastered: entries.filter(isMastered).length,
	fumbled: entries.filter(isFumbled).length,
});

export const unmetCount = (entries: PolldexEntry[]): number =>
	entries.filter((entry) => !entry.seen).length;

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

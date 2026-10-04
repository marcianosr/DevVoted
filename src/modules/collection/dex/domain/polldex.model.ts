import { CATEGORY_CODES, type CategoryCode } from "~/shared/lib/categories";

export type PolldexEntry = {
	id: number;
	pollNumber: number | null;
	categoryCode: CategoryCode;
	seen: boolean;
	question: string | null;
	timesSeen: number;
	answeredCount: number;
	correctCount: number;
	accuracy: number | null;
};

export type PollSighting = {
	readonly categoryCode: string;
	readonly timesSeen: number;
};

export const timesSeenOf = (viewCount: number, answeredCount: number): number =>
	Math.max(viewCount, answeredCount);

export const isSeenPoll = (
	sighting: Pick<PollSighting, "timesSeen">
): boolean => sighting.timesSeen > 0;

export type PollEntryState = "unseen" | "seen" | "caught";

export const entryStateOf = (
	entry: Pick<PolldexEntry, "seen" | "correctCount">
): PollEntryState => {
	if (!entry.seen) return "unseen";
	return entry.correctCount > 0 ? "caught" : "seen";
};

export const isCaughtPoll = (
	entry: Pick<PolldexEntry, "seen" | "correctCount">
): boolean => entryStateOf(entry) === "caught";

export type PolldexCategoryFilter = CategoryCode | "all";

export type PolldexFilter = "all" | "seen" | "mastered" | "fumbled";

export const MASTERED_ACCURACY = 70;
export const FUMBLED_ACCURACY = 40;

const matchesCategory = (
	entry: PolldexEntry,
	category: PolldexCategoryFilter
): boolean => category === "all" || entry.categoryCode === category;

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

export const filterPolldexEntries = (
	entries: PolldexEntry[],
	category: PolldexCategoryFilter,
	filter: PolldexFilter = "all"
): PolldexEntry[] =>
	entries.filter(
		(entry) =>
			matchesCategory(entry, category) && matchesKnowledge(entry, filter)
	);

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

export const dexNumber = (
	entry: Pick<PolldexEntry, "pollNumber" | "id">
): number => entry.pollNumber ?? entry.id;

export const formatDexNumber = (entry: PolldexEntry): string =>
	`#${String(dexNumber(entry)).padStart(3, "0")}`;

export const sortByDexNumber = (entries: PolldexEntry[]): PolldexEntry[] =>
	[...entries].sort((a, b) => dexNumber(a) - dexNumber(b));

export const presentCategories = (entries: PolldexEntry[]): CategoryCode[] => {
	const present = new Set(entries.map((entry) => entry.categoryCode));
	return CATEGORY_CODES.filter((code) => present.has(code));
};

import type { ObjectiveCount } from "~/modules/run/config/domain/configUnlock.model";
import { RANK_RUNGS } from "~/modules/account/profile/domain/rank.model";
import {
	findTitleById,
	isNamedOnlyWhenEarned,
	progressOf,
	titleGroupOf,
	visibleTitles,
	WORN_TITLE_CAP,
	type Title,
	type TitleGroup,
} from "~/modules/account/profile/domain/title.model";
import {
	CATEGORY_CODES,
	CATEGORY_METADATA,
	type CategoryCode,
} from "~/shared/lib/categories";
import type { Redactable } from "~/ui/kanto-theme/Redaction.ui";

export type TitleFilter = "all" | "earned" | "closest";

export const TITLE_FILTERS: readonly TitleFilter[] = [
	"all",
	"earned",
	"closest",
];

export const SHOWN_CATEGORIES = 8;

export const CLOSEST_COUNT = 5;

type ShelfTitleStated = {
	id: string;
	earnedWhen: string;
	count: number;
	target: number;
	earned: boolean;
	worn: boolean;
	blocked: boolean;
};

export type ShelfTitle = Redactable<{ name: string }, ShelfTitleStated>;

export type WornSlot = { id: string; name: string } | null;

export type LadderRung = {
	id: string;
	at: number;
	position: number;
	earned: boolean;
	next: boolean;
};

export type TitleLadder = {
	rungs: readonly LadderRung[];
	fill: number;
	top: number;
	pollsAnswered: number;
	next: { at: number; toGo: number } | null;
	earned: readonly ShelfTitle[];
	held: number;
	total: number;
};

export type CategoryRow = {
	code: CategoryCode;
	label: string;
	answered: ShelfTitle;
	correct: ShelfTitle;
};

export type TitleCategories = {
	rows: readonly CategoryRow[];
	overflow: number;
	expanded: boolean;
	held: number;
	total: number;
};

export type TitleSpecial = {
	titles: readonly ShelfTitle[];
	held: number;
	total: number;
};

export type TitleShelfView = {
	filter: TitleFilter;
	held: number;
	total: number;
	worn: readonly WornSlot[];
	ladder: TitleLadder;
	categories: TitleCategories;
	special: TitleSpecial;
	closest: readonly ShelfTitle[];
};

export type TitleShelfInput = {
	ownedTitleIds: readonly string[];
	equippedTitleIds: readonly string[];
	counts: readonly ObjectiveCount[];
	filter: TitleFilter;
	moreCategories: boolean;
};

const POLLS_ANSWERED = "polls-answered";

const TOP_RUNG_AT = RANK_RUNGS.at(-1)?.from ?? 1;

const ladderPositionOf = (polls: number): number =>
	polls <= 1 ? 0 : Math.min(1, Math.log(polls) / Math.log(TOP_RUNG_AT));

const shareOf = ({ count, target }: ShelfTitle): number => count / target;

const byShareDescending = (a: ShelfTitle, b: ShelfTitle) =>
	shareOf(b) - shareOf(a);

const earnedFirst = (a: ShelfTitle, b: ShelfTitle) =>
	Number(b.earned) - Number(a.earned);

const isStarted = (title: ShelfTitle) => !title.earned && title.count > 0;

const heldIn = (titles: readonly ShelfTitle[]) =>
	titles.filter((title) => title.earned).length;

const wornSlotsOf = (
	equippedTitleIds: readonly string[]
): readonly WornSlot[] =>
	Array.from({ length: WORN_TITLE_CAP }, (_, index) => {
		const title = findTitleById(equippedTitleIds[index] ?? "");
		return title ? { id: title.id, name: title.name } : null;
	});

const categoryRowOf =
	(shelfTitleOf: (titleId: string) => ShelfTitle) =>
	(code: CategoryCode): CategoryRow => ({
		code,
		label: CATEGORY_METADATA[code].name,
		answered: shelfTitleOf(`title-answered-${code}`),
		correct: shelfTitleOf(`title-maintainer-${code}`),
	});

const cellsOf = (row: CategoryRow) => [row.answered, row.correct];

const earnedCellsIn = (row: CategoryRow) =>
	cellsOf(row).filter((cell) => cell.earned).length;

const progressIn = (row: CategoryRow) =>
	cellsOf(row).reduce((sum, cell) => sum + shareOf(cell), 0);

const byCategoryStanding = (a: CategoryRow, b: CategoryRow) =>
	earnedCellsIn(b) - earnedCellsIn(a) || progressIn(b) - progressIn(a);

const categoriesOf = (
	rows: readonly CategoryRow[],
	filter: TitleFilter,
	moreCategories: boolean
): TitleCategories => {
	const cells = rows.flatMap(cellsOf);
	const listed =
		filter === "earned" ? rows.filter((row) => earnedCellsIn(row) > 0) : rows;
	const ranked = [...listed].sort(byCategoryStanding);
	const shown = moreCategories ? ranked : ranked.slice(0, SHOWN_CATEGORIES);
	return {
		rows: shown,
		overflow: ranked.length - shown.length,
		expanded: moreCategories,
		held: heldIn(cells),
		total: cells.length,
	};
};

const ladderOf = (
	rungTitles: readonly ShelfTitle[],
	pollsAnswered: number
): TitleLadder => {
	const nextRung = RANK_RUNGS.find((rung) => rung.from > pollsAnswered);
	const rungs = RANK_RUNGS.map((rung, index) => ({
		id: rungTitles[index].id,
		at: rung.from,
		position: ladderPositionOf(rung.from),
		earned: rungTitles[index].earned,
		next: rung === nextRung,
	}));
	return {
		rungs,
		fill: ladderPositionOf(pollsAnswered),
		top: TOP_RUNG_AT,
		pollsAnswered,
		next: nextRung
			? { at: nextRung.from, toGo: nextRung.from - pollsAnswered }
			: null,
		earned: rungTitles.filter((title) => title.earned),
		held: heldIn(rungTitles),
		total: rungTitles.length,
	};
};

const specialOf = (
	titles: readonly ShelfTitle[],
	filter: TitleFilter
): TitleSpecial => ({
	titles: [...titles]
		.filter((title) => filter !== "earned" || title.earned)
		.sort((a, b) => earnedFirst(a, b) || byShareDescending(a, b)),
	held: heldIn(titles),
	total: titles.length,
});

const closestOf = (
	nextRung: ShelfTitle | undefined,
	others: readonly ShelfTitle[]
): readonly ShelfTitle[] =>
	[...(nextRung ? [nextRung] : []), ...others]
		.filter(isStarted)
		.sort(byShareDescending)
		.slice(0, CLOSEST_COUNT);

export const titleShelfFor = ({
	ownedTitleIds,
	equippedTitleIds,
	counts,
	filter,
	moreCategories,
}: TitleShelfInput): TitleShelfView => {
	const owned = new Set(ownedTitleIds);
	const worn = new Set(equippedTitleIds);
	const atCap = worn.size >= WORN_TITLE_CAP;
	const countByMetric = new Map(counts.map((row) => [row.metric, row.count]));
	const countOf = (metric: string) => countByMetric.get(metric) ?? 0;
	const roster = visibleTitles(ownedTitleIds);

	const shelfTitleOfTitle = (title: Title): ShelfTitle => {
		const stated = {
			id: title.id,
			earnedWhen: title.earnedWhen,
			...progressOf(title, countOf),
			earned: owned.has(title.id),
			worn: worn.has(title.id),
			blocked: atCap && !worn.has(title.id),
		};
		return isNamedOnlyWhenEarned(title) && !stated.earned
			? { ...stated, locked: true }
			: { ...stated, name: title.name };
	};

	const shelfTitles = roster.map(shelfTitleOfTitle);
	const shelfTitleById = new Map(shelfTitles.map((title) => [title.id, title]));
	const shelfTitleOf = (titleId: string): ShelfTitle => {
		const title = shelfTitleById.get(titleId);
		if (!title) throw new Error(`Unknown title ${titleId}`);
		return title;
	};
	const inGroup = (group: TitleGroup) =>
		roster
			.filter((title) => titleGroupOf(title) === group)
			.map((title) => shelfTitleOf(title.id));

	const rungTitles = inGroup("poll-count");
	const pollsAnswered = countOf(POLLS_ANSWERED);
	const ladder = ladderOf(rungTitles, pollsAnswered);
	const categoryRows = CATEGORY_CODES.map(categoryRowOf(shelfTitleOf));
	const specialTitles = inGroup("special");
	const nextRungId = ladder.rungs.find((rung) => rung.next)?.id;
	const nextRungTitle = nextRungId ? shelfTitleOf(nextRungId) : undefined;

	return {
		filter,
		held: heldIn(shelfTitles),
		total: shelfTitles.length,
		worn: wornSlotsOf(equippedTitleIds),
		ladder,
		categories: categoriesOf(categoryRows, filter, moreCategories),
		special: specialOf(specialTitles, filter),
		closest: closestOf(nextRungTitle, [
			...categoryRows.flatMap(cellsOf),
			...specialTitles,
		]),
	};
};

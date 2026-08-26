import { useState } from "react";

import {
	dexNumber,
	filterPolldexEntries,
	polldexTallies,
	presentCategories,
	sortByDexNumber,
	unmetCount,
	type PolldexCategoryFilter,
	type PolldexEntry,
	type PolldexFilter,
} from "~/modules/collection/dex/domain/polldex.model";
import { getCategoryMetadata, isCategoryCode } from "~/shared/lib/categories";
import type { FilterOption } from "~/ui/modern-theme/Filter.ui";
import {
	PollsPanel,
	type DexPoll,
} from "~/ui/modern-theme/screens/PollsPanel.ui";

/** Reading order, not the type's order: the bands a player has something in
 * come first, and the whole roster last. */
const FILTER_ORDER = [
	"seen",
	"mastered",
	"fumbled",
	"all",
] as const satisfies readonly PolldexFilter[];

const ANY_CATEGORY = "all";

const isPolldexFilter = (value: string): value is PolldexFilter =>
	FILTER_ORDER.some((filter) => filter === value);

const toCategoryFilter = (value: string): PolldexCategoryFilter =>
	isCategoryCode(value) ? value : ANY_CATEGORY;

const toDexPoll = (entry: PolldexEntry): DexPoll => {
	const number = dexNumber(entry);
	// `question` is null on an unseen row by construction — the text never
	// crosses the wire — so the narrowing is the redaction, not a fallback.
	if (!entry.seen || entry.question === null)
		return { id: String(entry.id), number, seen: false };

	return {
		id: String(entry.id),
		number,
		seen: true,
		question: entry.question,
		category: getCategoryMetadata(entry.categoryCode).name,
		timesSeen: entry.timesSeen,
		accuracy: entry.accuracy,
	};
};

export type PollsViewProps = { entries: PolldexEntry[] };

/**
 * Two controls that look like one axis but are not: the pills say how well you
 * know a poll, and only `all` admits one you have never been served. The reveal
 * is what draws those rows, so it is offered only where there is something for
 * it to draw.
 */
export const PollsView = ({ entries }: PollsViewProps) => {
	const [filter, setFilter] = useState<PolldexFilter>("seen");
	const [category, setCategory] = useState<PolldexCategoryFilter>(ANY_CATEGORY);
	const [revealUnmet, setRevealUnmet] = useState(true);

	// The category narrows first and everything else counts off the result, so
	// the pills and the footer answer "within this category" once one is chosen.
	const inCategory = filterPolldexEntries(entries, category);
	const tallies = polldexTallies(inCategory);

	const filters: readonly FilterOption[] = FILTER_ORDER.map((id) => ({
		id,
		label: id,
		count: String(tallies[id]),
	}));

	const visible = sortByDexNumber(
		filterPolldexEntries(inCategory, ANY_CATEGORY, filter)
	).filter((entry) => entry.seen || revealUnmet);

	const unmet = unmetCount(inCategory);

	return (
		<PollsPanel
			filters={filters}
			activeFilter={filter}
			onFilter={(id) => isPolldexFilter(id) && setFilter(id)}
			categories={[
				{ id: ANY_CATEGORY, label: "any category" },
				...presentCategories(entries).map((code) => ({
					id: code,
					label: getCategoryMetadata(code).name,
				})),
			]}
			category={category}
			onCategory={(value) => setCategory(toCategoryFilter(value))}
			polls={visible.map(toDexPoll)}
			unmet={
				filter === "all" && unmet > 0
					? {
							count: unmet,
							shown: revealUnmet,
							onToggle: () => setRevealUnmet((shown) => !shown),
						}
					: undefined
			}
		/>
	);
};

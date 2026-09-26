import type {
	ObjectiveCount,
	ObjectiveMetric,
} from "~/modules/run/config/domain/configUnlock.model";
import {
	CATEGORY_CODES,
	CATEGORY_METADATA,
	type CategoryCode,
} from "~/shared/lib/categories";

export type TitleEarn =
	| {
			readonly kind: "threshold";
			readonly metric: ObjectiveMetric;
			readonly target: number;
	  }
	| { readonly kind: "every-category" }
	| {
			readonly kind: "race";
			readonly metric: ObjectiveMetric;
			readonly target: number;
	  }
	| { readonly kind: "granted" };

export type Title = {
	readonly id: string;
	readonly name: string;
	readonly earnedWhen: string;
	readonly earn: TitleEarn;
};

const MAINTAINER_CORRECT = 25;
const FLAWLESS_WINDOWS = 20;

const maintainerFor = (code: CategoryCode): Title => ({
	id: `title-maintainer-${code}`,
	name: `${CATEGORY_METADATA[code].name} Maintainer`,
	earnedWhen: `${MAINTAINER_CORRECT} correct ${CATEGORY_METADATA[code].name} answers`,
	earn: {
		kind: "threshold",
		metric: `category-correct:${code}`,
		target: MAINTAINER_CORRECT,
	},
});

export const TITLES: readonly Title[] = [
	...CATEGORY_CODES.map(maintainerFor),
	{
		id: "title-completer",
		name: "Completer",
		earnedWhen: "A correct answer in every category",
		earn: { kind: "every-category" },
	},
	{
		id: "title-summit",
		name: "Summit",
		earnedWhen: "Clear all thirteen gates in one run",
		earn: { kind: "threshold", metric: "runs-won", target: 1 },
	},
	{
		id: "title-flawless",
		name: "Flawless",
		earnedWhen: `${FLAWLESS_WINDOWS} perfect windows`,
		earn: {
			kind: "threshold",
			metric: "perfect-windows",
			target: FLAWLESS_WINDOWS,
		},
	},
	{
		id: "title-first-ascent",
		name: "First Ascent",
		earnedWhen: "The first account to clear all thirteen gates",
		earn: { kind: "race", metric: "runs-won", target: 1 },
	},
	{
		id: "title-legacy-tester",
		name: "Legacy Tester",
		earnedWhen: "Played before the rebuild. Cannot be earned.",
		earn: { kind: "granted" },
	},
	{
		id: "title-legacy-active",
		name: "Legacy Climber",
		earnedWhen: "Still climbing when the rebuild landed. Cannot be earned.",
		earn: { kind: "granted" },
	},
];

export const findTitleById = (titleId: string): Title | undefined =>
	TITLES.find((title) => title.id === titleId);

export const visibleTitles = (
	ownedTitleIds: readonly string[]
): readonly Title[] => {
	const owned = new Set(ownedTitleIds);
	return TITLES.filter(
		(title) => title.earn.kind !== "granted" || owned.has(title.id)
	);
};

export const isExclusive = (title: Title): boolean =>
	title.earn.kind === "race";

export const TITLE_METRICS: readonly string[] = [
	...new Set(
		TITLES.flatMap((title) =>
			title.earn.kind === "threshold" || title.earn.kind === "race"
				? [title.earn.metric]
				: title.earn.kind === "every-category"
					? CATEGORY_CODES.map((code) => `category-correct:${code}`)
					: []
		)
	),
];

const isSatisfied = (
	earn: TitleEarn,
	countOf: (metric: string) => number
): boolean => {
	if (earn.kind === "granted") return false;
	if (earn.kind === "every-category")
		return CATEGORY_CODES.every(
			(code) => countOf(`category-correct:${code}`) > 0
		);
	return countOf(earn.metric) >= earn.target;
};

export const titlesEarnedBy = (
	counts: readonly ObjectiveCount[]
): readonly Title[] => {
	const countByMetric = new Map(
		counts.map((row) => [row.metric, row.count] as const)
	);
	const countOf = (metric: string): number => countByMetric.get(metric) ?? 0;
	return TITLES.filter((title) => isSatisfied(title.earn, countOf));
};

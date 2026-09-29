import type {
	ObjectiveCount,
	ObjectiveMetric,
} from "~/modules/run/config/domain/configUnlock.model";
import { RANK_RUNGS } from "~/modules/account/profile/domain/rank.model";
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
	| { readonly kind: "granted" };

export type Title = {
	readonly id: string;
	readonly name: string;
	readonly earnedWhen: string;
	readonly earn: TitleEarn;
};

const CATEGORY_CORRECT_TARGET = 25;
const CATEGORY_ANSWERED_TARGET = 10;

const CATEGORY_TITLE_NAMES = {
	html: { entry: "HTML Hobbyist", mastery: "Markup Master" },
	css: { entry: "CSS Carrier", mastery: "CSS Connoisseur" },
	js: { entry: "Const(ant) Voter", mastery: "every()thing Correct" },
	ts: { entry: "TypeScript Tinkerer", mastery: "Type Specialist" },
	react: { entry: "React 4 U", mastery: "React Rocket" },
	git: { entry: "Git Contributor", mastery: "Git GOAT" },
	"general-frontend": { entry: "Frontend Fury", mastery: "Forza Frontend" },
	java: { entry: "Java Jockey", mastery: "Checked Exception" },
	python: { entry: "Pythonista", mastery: "Snake Charmer" },
	ruby: { entry: "Ruby Rookie", mastery: "Ruby Royale" },
	"general-backend": { entry: "Server Scout", mastery: "Pipeline Veteran" },
	vue: { entry: "Point of Vue", mastery: "Vue Virtuoso" },
} as const satisfies Record<CategoryCode, { entry: string; mastery: string }>;

const answeredTitleFor = (code: CategoryCode): Title => ({
	id: `title-answered-${code}`,
	name: CATEGORY_TITLE_NAMES[code].entry,
	earnedWhen: `${CATEGORY_ANSWERED_TARGET} ${CATEGORY_METADATA[code].name} polls answered`,
	earn: {
		kind: "threshold",
		metric: `category-answered:${code}`,
		target: CATEGORY_ANSWERED_TARGET,
	},
});

const correctTitleFor = (code: CategoryCode): Title => ({
	id: `title-maintainer-${code}`,
	name: CATEGORY_TITLE_NAMES[code].mastery,
	earnedWhen: `${CATEGORY_CORRECT_TARGET} correct ${CATEGORY_METADATA[code].name} answers`,
	earn: {
		kind: "threshold",
		metric: `category-correct:${code}`,
		target: CATEGORY_CORRECT_TARGET,
	},
});

type BehaviourTitle = {
	readonly name: string;
	readonly earnedWhen: string;
	readonly metric: ObjectiveMetric;
	readonly target: number;
};

const once = (
	name: string,
	earnedWhen: string,
	metric: ObjectiveMetric
): BehaviourTitle => ({ name, earnedWhen, metric, target: 1 });

const BEHAVIOUR_TITLES: readonly BehaviourTitle[] = [
	once("Vanilla JS", "Clear a gate with nothing installed", "bare-build-clear"),
	once("Tree Shaken", "Reach gate 4 under 16 KB", "lean-gate-four"),
	once(
		"Breaking Change",
		"Clear a gate holding two upgraded configs",
		"double-v2-clear"
	),
	{
		name: "Peer Dependency",
		earnedWhen: "Vendor-lock 3 configs",
		metric: "configs-vendor-locked",
		target: 3,
	},
	once(
		"Works On My Machine",
		"A perfect window past gate 3",
		"perfect-window-deep"
	),
	once(
		"Ship It",
		"Finish a run still holding a config you were dealt",
		"finished-holding-a-dealt-config"
	),
	{
		name: "Bikeshedder",
		earnedWhen: "Reorder the gates 25 times",
		metric: "gates-reordered",
		target: 25,
	},
	{
		name: "Stack Overflow",
		earnedWhen: "Peek at the room 50 times",
		metric: "community-peeks",
		target: 50,
	},
];

const kebab = (name: string): string =>
	name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

const behaviourTitleOf = (behaviour: BehaviourTitle): Title => ({
	id: `title-${kebab(behaviour.name)}`,
	name: behaviour.name,
	earnedWhen: behaviour.earnedWhen,
	earn: {
		kind: "threshold",
		metric: behaviour.metric,
		target: behaviour.target,
	},
});

const pollsAnsweredPhrase = (polls: number): string =>
	polls === 1 ? "1 poll answered" : `${polls} polls answered`;

const pollCountTitles: readonly Title[] = RANK_RUNGS.map((rung) => ({
	id: `title-rank-${kebab(rung.name)}`,
	name: rung.name,
	earnedWhen: pollsAnsweredPhrase(rung.from),
	earn: { kind: "threshold", metric: "polls-answered", target: rung.from },
}));

export const TITLES: readonly Title[] = [
	...pollCountTitles,
	...CATEGORY_CODES.flatMap((code) => [
		answeredTitleFor(code),
		correctTitleFor(code),
	]),
	...BEHAVIOUR_TITLES.map(behaviourTitleOf),
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

export const isGrantedTitleId = (titleId: string): boolean =>
	findTitleById(titleId)?.earn.kind === "granted";

export const wornTitleNames = (
	equippedTitleIds: readonly string[]
): readonly string[] =>
	equippedTitleIds.flatMap((titleId) => {
		const title = findTitleById(titleId);
		return title ? [title.name] : [];
	});

export const primaryTitleName = (
	equippedTitleIds: readonly string[]
): string | null => wornTitleNames(equippedTitleIds)[0] ?? null;

export const visibleTitles = (
	ownedTitleIds: readonly string[]
): readonly Title[] => {
	const owned = new Set(ownedTitleIds);
	return TITLES.filter(
		(title) => title.earn.kind !== "granted" || owned.has(title.id)
	);
};

export type TitleGroup = "poll-count" | "category" | "special";

export const TITLE_GROUPS: readonly TitleGroup[] = [
	"poll-count",
	"category",
	"special",
];

export const titleGroupOf = (title: Title): TitleGroup => {
	if (title.earn.kind === "granted") return "special";
	if (title.earn.metric === "polls-answered") return "poll-count";
	if (title.earn.metric.startsWith("category-")) return "category";
	return "special";
};

export const isNamedOnlyWhenEarned = (title: Title): boolean =>
	titleGroupOf(title) !== "category";

export type TitleProgress = { readonly count: number; readonly target: number };

const GRANTED_PROGRESS: TitleProgress = { count: 0, target: 1 };

export const progressOf = (
	title: Title,
	countOf: (metric: string) => number
): TitleProgress =>
	title.earn.kind === "granted"
		? GRANTED_PROGRESS
		: {
				count: Math.min(countOf(title.earn.metric), title.earn.target),
				target: title.earn.target,
			};

export const WORN_TITLE_CAP = 3;

export type WearRefusal = "unknown" | "not-owned" | "already-worn" | "at-cap";

export type WearDecision =
	| { readonly kind: "worn"; readonly worn: readonly string[] }
	| { readonly kind: "refused"; readonly reason: WearRefusal };

const refuse = (reason: WearRefusal): WearDecision => ({
	kind: "refused",
	reason,
});

export const wearTitle = (
	worn: readonly string[],
	titleId: string,
	ownedTitleIds: readonly string[]
): WearDecision => {
	if (!findTitleById(titleId)) return refuse("unknown");
	if (!ownedTitleIds.includes(titleId)) return refuse("not-owned");
	if (worn.includes(titleId)) return refuse("already-worn");
	if (worn.length >= WORN_TITLE_CAP) return refuse("at-cap");

	return { kind: "worn", worn: [...worn, titleId] };
};

export const wearEach = (
	worn: readonly string[],
	titleIds: readonly string[],
	ownedTitleIds: readonly string[]
): readonly string[] =>
	titleIds.reduce<readonly string[]>((wearing, titleId) => {
		const decision = wearTitle(wearing, titleId, ownedTitleIds);
		return decision.kind === "worn" ? decision.worn : wearing;
	}, worn);

export const removeTitle = (
	worn: readonly string[],
	titleId: string
): readonly string[] => worn.filter((id) => id !== titleId);

export const TITLE_METRICS: readonly string[] = [
	...new Set(
		TITLES.flatMap((title) =>
			title.earn.kind === "threshold" ? [title.earn.metric] : []
		)
	),
];

const isSatisfied = (
	earn: TitleEarn,
	countOf: (metric: string) => number
): boolean => {
	if (earn.kind === "granted") return false;
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

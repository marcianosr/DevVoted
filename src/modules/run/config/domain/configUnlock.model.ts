import type { CategoryCode } from "~/shared/lib/categories";

export const ONE_SHOT_METRICS = [
	"perfect-window-deep",
	"full-build-clear",
	"double-v2-clear",
	"mirror-clear-no-miss",
	"sold-three-one-shop",
	"lean-gate-four",
] as const;

export type OneShotMetric = (typeof ONE_SHOT_METRICS)[number];

export type CumulativeMetric =
	| "polls-answered"
	| "polls-correct"
	| `category-correct:${CategoryCode}`
	| "gates-cleared"
	| "audited-gates-cleared"
	| "rebuilds"
	| "perfect-windows"
	| "configs-sold"
	| "community-peeks"
	| "offers-locked"
	| "exact-estimates"
	| "arms-switched"
	| "cache-hits"
	| "gates-reordered";

export type ObjectiveMetric = CumulativeMetric | OneShotMetric;

export type ThematicObjective = {
	readonly metric: ObjectiveMetric;
	readonly target: number;
	readonly caption: string;
	readonly earned: string;
};

export type ConfigUnlock =
	| { readonly kind: "free" }
	| {
			readonly kind: "earned";
			readonly objective: ThematicObjective;
			readonly fallbackPollsAnswered: number;
	  };

export type EarnedConfigUnlock = Extract<ConfigUnlock, { kind: "earned" }>;

export type ObjectiveCount = {
	readonly metric: string;
	readonly count: number;
};

export type UnlockGrant = {
	readonly configId: string;
	readonly viaMetric: ObjectiveMetric;
};

const free = (): ConfigUnlock => ({ kind: "free" });

const earned = (
	metric: ObjectiveMetric,
	target: number,
	caption: string,
	earnedCaption: string,
	fallbackPollsAnswered: number
): ConfigUnlock => ({
	kind: "earned",
	objective: { metric, target, caption, earned: earnedCaption },
	fallbackPollsAnswered,
});

export const CONFIG_UNLOCKS: Readonly<Record<string, ConfigUnlock>> = {
	js: free(),
	ts: free(),
	css: free(),
	eslint: free(),
	"unit-tests": free(),
	"code-coverage": free(),
	"indexed-db": free(),
	"cold-start": free(),
	html: earned(
		"category-correct:html",
		10,
		"Answer 10 HTML polls correctly",
		"answered 10 HTML polls correctly",
		25
	),
	jsx: earned(
		"category-correct:react",
		10,
		"Answer 10 React polls correctly",
		"answered 10 React polls correctly",
		50
	),
	stylelint: earned(
		"category-correct:css",
		10,
		"Answer 10 CSS polls correctly",
		"answered 10 CSS polls correctly",
		75
	),
	telemetry: earned(
		"community-peeks",
		5,
		"Peek the community split 5 times",
		"peeked the community split 5 times",
		100
	),
	length: earned(
		"perfect-windows",
		3,
		"Close 3 perfect windows",
		"closed 3 perfect windows",
		125
	),
	git: earned(
		"category-correct:git",
		10,
		"Answer 10 Git polls correctly",
		"answered 10 Git polls correctly",
		150
	),
	"package.json-config": earned(
		"category-correct:general-frontend",
		10,
		"Answer 10 General Frontend polls correctly",
		"answered 10 General Frontend polls correctly",
		175
	),
	".vue": earned(
		"category-correct:vue",
		10,
		"Answer 10 Vue polls correctly",
		"answered 10 Vue polls correctly",
		200
	),
	java: earned(
		"category-correct:java",
		10,
		"Answer 10 Java polls correctly",
		"answered 10 Java polls correctly",
		225
	),
	py: earned(
		"category-correct:python",
		10,
		"Answer 10 Python polls correctly",
		"answered 10 Python polls correctly",
		250
	),
	rb: earned(
		"category-correct:ruby",
		10,
		"Answer 10 Ruby polls correctly",
		"answered 10 Ruby polls correctly",
		275
	),
	prefetch: earned(
		"audited-gates-cleared",
		5,
		"Clear 5 audited gates",
		"cleared 5 audited gates",
		300
	),
	intellisense: earned(
		"polls-correct",
		75,
		"Answer 75 polls correctly",
		"answered 75 polls correctly",
		325
	),
	"moores-law": earned(
		"gates-cleared",
		15,
		"Clear 15 gates",
		"cleared 15 gates",
		350
	),
	deprecated: earned(
		"configs-sold",
		10,
		"Sell 10 configs",
		"sold 10 configs",
		375
	),
	overclock: earned(
		"perfect-window-deep",
		1,
		"Perfect window at gate 3 or deeper",
		"closed a perfect window at gate 3 or deeper",
		400
	),
	dependabot: earned(
		"double-v2-clear",
		1,
		"Clear a gate holding two configs at level 2",
		"cleared a gate holding two configs at level 2",
		425
	),
	wtfpl: earned(
		"sold-three-one-shop",
		1,
		"Sell 3 configs in a single shop",
		"sold 3 configs in a single shop",
		450
	),
	"volkswagen-ci": earned(
		"mirror-clear-no-miss",
		1,
		"Clear Marsh's Mirror audit without a miss",
		"cleared Marsh's Mirror audit without a miss",
		475
	),
	freemium: earned(
		"lean-gate-four",
		1,
		"Reach gate 4 holding under 16 KB",
		"reached gate 4 holding under 16 KB",
		500
	),
	"agents-md": earned(
		"full-build-clear",
		1,
		"Clear a gate with every slot filled",
		"cleared a gate with every slot filled",
		525
	),
	"yarn-lock": earned(
		"offers-locked",
		5,
		"Lock 5 shop offers",
		"locked 5 shop offers",
		550
	),
	"planning-poker": earned(
		"exact-estimates",
		3,
		"Land 3 exact estimates",
		"landed 3 exact estimates",
		575
	),
	"ab-test": earned(
		"arms-switched",
		3,
		"Switch arms 3 times",
		"switched arms 3 times",
		600
	),
	"garbage-collection": earned(
		"configs-sold",
		20,
		"Sell 20 configs",
		"sold 20 configs",
		625
	),
	cache: earned(
		"cache-hits",
		15,
		"Land 15 cached hits",
		"landed 15 cached hits",
		650
	),
	"git-rebase": earned(
		"gates-reordered",
		3,
		"Reorder 3 gates' polls",
		"reordered 3 gates' polls",
		675
	),
};

export const FREE_CONFIG_IDS: readonly string[] = Object.entries(CONFIG_UNLOCKS)
	.filter(([, unlock]) => unlock.kind === "free")
	.map(([configId]) => configId);

export const isOneShotMetric = (
	metric: ObjectiveMetric
): metric is OneShotMetric =>
	ONE_SHOT_METRICS.some((oneShot) => oneShot === metric);

export const isUnlockSatisfied = (
	unlock: ConfigUnlock,
	countOf: (metric: string) => number
): boolean => {
	if (unlock.kind === "free") return true;
	if (countOf(unlock.objective.metric) >= unlock.objective.target) return true;
	return countOf("polls-answered") >= unlock.fallbackPollsAnswered;
};

export const configsUnlockedBy = (
	counts: readonly ObjectiveCount[]
): readonly UnlockGrant[] => {
	const countByMetric = new Map(
		counts.map((row) => [row.metric, row.count] as const)
	);
	const countOf = (metric: string): number => countByMetric.get(metric) ?? 0;
	return Object.entries(CONFIG_UNLOCKS).flatMap(([configId, unlock]) => {
		if (unlock.kind === "free") return [];
		if (countOf(unlock.objective.metric) >= unlock.objective.target) {
			return [{ configId, viaMetric: unlock.objective.metric }];
		}
		if (countOf("polls-answered") >= unlock.fallbackPollsAnswered) {
			return [{ configId, viaMetric: "polls-answered" as const }];
		}
		return [];
	});
};

import { describe, expect, it } from "vitest";

import {
	findTitleById,
	isNamedOnlyWhenEarned,
	progressOf,
	isGrantedTitleId,
	removeTitle,
	TITLE_METRICS,
	TITLES,
	titleGroupOf,
	titlesEarnedBy,
	visibleTitles,
	wearEach,
	wearTitle,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import {
	CONFIG_UNLOCKS,
	ONE_SHOT_METRICS,
} from "~/modules/run/config/domain/configUnlock.model";
import { CONFIG_LIST } from "~/modules/run/config/domain/configRoster.model";
import { REGISTRY_CONTROL_LIST } from "~/modules/run/shop/domain/registryControl.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

const countsFor = (
	entries: Record<string, number>
): readonly { metric: string; count: number }[] =>
	Object.entries(entries).map(([metric, count]) => ({ metric, count }));

const idsOf = (titles: readonly { id: string }[]) =>
	titles.map((title) => title.id);

describe("titlesEarnedBy", () => {
	it("grants the category mastery title at fifty distinct polls answered correctly", () => {
		const earned = titlesEarnedBy(countsFor({ "category-mastered:git": 50 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("withholds the mastery title one distinct correct poll short of the target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-mastered:git": 49 }));

		expect(idsOf(earned)).not.toContain("title-maintainer-git");
	});

	it("keeps the mastery title granted past its target, because a title is permanent", () => {
		const earned = titlesEarnedBy(countsFor({ "category-mastered:git": 900 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("grants the entry title at fifty distinct polls seen, whether or not any were right", () => {
		const earned = titlesEarnedBy(countsFor({ "category-seen:css": 50 }));

		expect(idsOf(earned)).toEqual(["title-answered-css"]);
	});

	it("withholds the entry title one distinct poll short of the target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-seen:css": 49 }));

		expect(idsOf(earned)).toEqual([]);
	});

	it("grants no category title for answering the same polls over and over", () => {
		const earned = titlesEarnedBy(
			countsFor({ "category-answered:css": 900, "category-correct:css": 900 })
		);

		expect(idsOf(earned)).toEqual([]);
	});

	it("grants both rungs of a category to a record that clears both bars", () => {
		const earned = titlesEarnedBy(
			countsFor({ "category-seen:react": 60, "category-mastered:react": 50 })
		);

		expect(idsOf(earned)).toEqual([
			"title-answered-react",
			"title-maintainer-react",
		]);
	});

	it.each([
		["first-poll-correct", "title-hello-world"],
		["won-every-answer-correct", "title-and-now-it-s-green"],
		["runs-won", "title-it-compiles"],
		["audited-clear-ok", "title-ship-it"],
		["ten-unit-answer", "title-10x-engineer"],
		["gate-over-full", "title-stack-overflow"],
		["cleared-after-two-misses", "title-tested-in-production"],
		["eight-configs-held", "title-dependency-hell"],
		["install-after-three-rebuilds", "title-clean-install"],
		["storage-418", "title-i-m-a-teapot"],
		["refused-shaky-peel", "title-wontfix"],
	])(
		"grants the special title %s earns the first time it counts",
		(metric, titleId) => {
			expect(idsOf(titlesEarnedBy(countsFor({ [metric]: 1 })))).toEqual([
				titleId,
			]);
		}
	);

	it("grants no special title for the metrics the retired roster read", () => {
		const earned = titlesEarnedBy(
			countsFor({
				"gates-reordered": 900,
				"community-peeks": 900,
				"configs-vendor-locked": 900,
				"lean-gate-four": 1,
				"double-v2-clear": 1,
				"perfect-window-deep": 1,
				"finished-holding-a-dealt-config": 1,
			})
		);

		expect(idsOf(earned)).toEqual([]);
	});

	it("grants only the category that was answered", () => {
		const earned = titlesEarnedBy(countsFor({ "category-mastered:git": 50 }));

		expect(idsOf(earned)).not.toContain("title-maintainer-css");
	});

	it("grants Poll Newbie on the first poll answered", () => {
		expect(idsOf(titlesEarnedBy(countsFor({ "polls-answered": 1 })))).toEqual([
			"title-rank-poll-newbie",
		]);
	});

	it("grants a rung the poll after the previous rank's ceiling, keeping every rung below it", () => {
		const earned = idsOf(titlesEarnedBy(countsFor({ "polls-answered": 71 })));

		expect(earned).toEqual([
			"title-rank-poll-newbie",
			"title-rank-poll-acquaintance",
			"title-rank-no-stopping-me-now",
		]);
	});

	it("withholds a rung on its previous rank's ceiling", () => {
		const earned = idsOf(titlesEarnedBy(countsFor({ "polls-answered": 70 })));

		expect(earned).not.toContain("title-rank-no-stopping-me-now");
	});

	it("grants Polls Galore! one poll past the last ladder rung", () => {
		expect(
			idsOf(titlesEarnedBy(countsFor({ "polls-answered": 786 })))
		).toContain("title-rank-polls-galore");
		expect(
			idsOf(titlesEarnedBy(countsFor({ "polls-answered": 785 })))
		).not.toContain("title-rank-polls-galore");
	});

	it("never derives a granted title from the ledger, however much was played", () => {
		const everything = countsFor({
			"polls-answered": 10_000,
			"polls-correct": 10_000,
			"perfect-windows": 500,
			"runs-won": 9,
		});

		expect(idsOf(titlesEarnedBy(everything))).not.toContain(
			"title-legacy-tester"
		);
		expect(idsOf(titlesEarnedBy(everything))).not.toContain(
			"title-legacy-active"
		);
	});

	it("earns nothing on an account that has answered nothing", () => {
		expect(titlesEarnedBy([])).toEqual([]);
	});
});

describe("the title catalogue", () => {
	it("holds both rungs for every category, so no category is unrepresented", () => {
		for (const code of CATEGORY_CODES) {
			expect(findTitleById(`title-answered-${code}`)).toBeDefined();
			expect(findTitleById(`title-maintainer-${code}`)).toBeDefined();
		}
	});

	it("keeps the mastery ids it shipped with, which accounts already wear", () => {
		expect(idsOf(TITLES)).toEqual(
			expect.arrayContaining(
				CATEGORY_CODES.map((code) => `title-maintainer-${code}`)
			)
		);
	});

	it("names each rung rather than deriving it from the category", () => {
		expect(findTitleById("title-maintainer-git")?.name).toBe("Git GOAT");
		expect(findTitleById("title-answered-git")?.name).toBe("Git Contributor");
		expect(findTitleById("title-maintainer-css")?.name).toBe("CSS Connoisseur");
	});

	it("never reuses a config's label, which reads as the same object to a player", () => {
		const configLabels = new Set(
			CONFIG_LIST.map((config) => config.label.toLowerCase())
		);
		const collisions = TITLES.filter((title) =>
			configLabels.has(title.name.toLowerCase())
		).map((title) => title.name);

		expect(collisions).toEqual([]);
	});

	it("gives every behaviour title a metric the run engine actually emits", () => {
		const emitted = new Set<string>([
			...ONE_SHOT_METRICS,
			"polls-answered",
			"polls-correct",
			"gates-cleared",
			"runs-won",
			"audited-gates-cleared",
			"rebuilds",
			"perfect-windows",
			"configs-sold",
			"community-peeks",
			"offers-locked",
			"exact-estimates",
			"arms-switched",
			"cache-hits",
			"gates-reordered",
			"partials-paid",
			"configs-vendor-locked",
			"slas-met",
			...CATEGORY_CODES.flatMap((code) => [
				`category-seen:${code}`,
				`category-mastered:${code}`,
			]),
		]);
		const orphans = TITLES.filter(
			(title) =>
				title.earn.kind === "threshold" && !emitted.has(title.earn.metric)
		).map((title) => title.name);

		expect(orphans).toEqual([]);
	});

	it("claims every one-shot metric no unlock does, so none is counted for nothing", () => {
		const unlockMetrics = [
			...Object.values(CONFIG_UNLOCKS).flatMap((unlock) =>
				unlock.kind === "earned" ? [unlock.objective.metric] : []
			),
			...REGISTRY_CONTROL_LIST.flatMap((control) =>
				control.unlock.kind === "earned"
					? [control.unlock.objective.metric]
					: []
			),
		];
		const claimed = new Set<string>([...unlockMetrics, ...TITLE_METRICS]);
		const unclaimed = ONE_SHOT_METRICS.filter((metric) => !claimed.has(metric));

		expect(unclaimed).toEqual([]);
	});

	it("gives every title a distinct name, so the shelf never shows the same label twice", () => {
		const names = TITLES.map((title) => title.name);

		expect(new Set(names).size).toBe(names.length);
	});

	it("reads a different metric for each rung, so turning up is not getting it right", () => {
		expect(findTitleById("title-answered-ts")?.earn).toMatchObject({
			metric: "category-seen:ts",
		});
		expect(findTitleById("title-maintainer-ts")?.earn).toMatchObject({
			metric: "category-mastered:ts",
		});
	});

	it("gives every title a distinct id, because the id is what the ledger stores", () => {
		const ids = TITLES.map((title) => title.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("returns nothing for an id no catalogue entry claims", () => {
		expect(findTitleById("title-does-not-exist")).toBeUndefined();
	});

	it("lists every metric a title reads, so the grant path knows when to look", () => {
		expect(TITLE_METRICS).toContain("category-mastered:git");
		expect(TITLE_METRICS).toContain("category-seen:git");
		expect(TITLE_METRICS).toContain("polls-answered");
		expect(TITLE_METRICS).toContain("storage-418");
	});

	it("names no metric twice, since the read is one IN clause", () => {
		expect(new Set(TITLE_METRICS).size).toBe(TITLE_METRICS.length);
	});
});

describe("titleGroupOf", () => {
	it("files a poll-count rung under poll count", () => {
		const newbie = findTitleById("title-rank-poll-newbie");

		expect(newbie && titleGroupOf(newbie)).toBe("poll-count");
	});

	it("files both rungs of a category under category", () => {
		const entry = findTitleById("title-answered-vue");
		const mastery = findTitleById("title-maintainer-vue");

		expect(entry && titleGroupOf(entry)).toBe("category");
		expect(mastery && titleGroupOf(mastery)).toBe("category");
	});

	it("files a behaviour title and a granted title under special", () => {
		const behaviour = findTitleById("title-it-compiles");
		const granted = findTitleById("title-legacy-tester");

		expect(behaviour && titleGroupOf(behaviour)).toBe("special");
		expect(granted && titleGroupOf(granted)).toBe("special");
	});

	it("names a poll-count rung and a special title only once earned, a category title always", () => {
		const newbie = findTitleById("title-rank-poll-newbie");
		const itCompiles = findTitleById("title-it-compiles");
		const git = findTitleById("title-maintainer-git");

		expect(newbie && isNamedOnlyWhenEarned(newbie)).toBe(true);
		expect(itCompiles && isNamedOnlyWhenEarned(itCompiles)).toBe(true);
		expect(git && isNamedOnlyWhenEarned(git)).toBe(false);
	});
});

describe("progressOf", () => {
	const COUNTS = new Map([
		["runs-won", 3],
		["category-mastered:css", 14],
	]);
	const countOf = (metric: string) => COUNTS.get(metric) ?? 0;

	it("reads a threshold title's count against its target", () => {
		const connoisseur = findTitleById("title-maintainer-css");

		expect(connoisseur && progressOf(connoisseur, countOf)).toEqual({
			count: 14,
			target: 50,
		});
	});

	it("caps the count at the target once the bar is passed", () => {
		const itCompiles = findTitleById("title-it-compiles");

		expect(itCompiles && progressOf(itCompiles, countOf)).toEqual({
			count: 1,
			target: 1,
		});
	});

	it("reads a granted title as one step never taken, since no play earns it", () => {
		const tester = findTitleById("title-legacy-tester");

		expect(tester && progressOf(tester, countOf)).toEqual({
			count: 0,
			target: 1,
		});
	});
});

describe("visibleTitles", () => {
	it("hides a granted title from an account that does not hold it", () => {
		expect(idsOf(visibleTitles([]))).not.toContain("title-legacy-tester");
	});

	it("shows a granted title to the account that holds it", () => {
		expect(idsOf(visibleTitles(["title-legacy-tester"]))).toContain(
			"title-legacy-tester"
		);
	});

	it("hides the mid-climb title from someone holding only the wider one", () => {
		const visible = idsOf(visibleTitles(["title-legacy-tester"]));

		expect(visible).not.toContain("title-legacy-active");
	});

	it("keeps an unearned threshold title listed, because its line is the bar", () => {
		expect(idsOf(visibleTitles([]))).toContain("title-it-compiles");
	});

	it("hides only the granted titles, so the roster is otherwise whole", () => {
		const granted = TITLES.filter(
			(title) => title.earn.kind === "granted"
		).length;

		expect(visibleTitles([]).length).toBe(TITLES.length - granted);
	});
});

const OWNED = [
	"title-it-compiles",
	"title-ship-it",
	"title-hello-world",
	"title-stack-overflow",
] as const;

describe("wearTitle", () => {
	it("wears a title the account owns", () => {
		expect(wearTitle([], "title-it-compiles", OWNED)).toEqual({
			kind: "worn",
			worn: ["title-it-compiles"],
		});
	});

	it("appends behind what is already worn, so the first stays primary", () => {
		const decision = wearTitle(["title-it-compiles"], "title-ship-it", OWNED);

		expect(decision).toEqual({
			kind: "worn",
			worn: ["title-it-compiles", "title-ship-it"],
		});
	});

	it("refuses a title the account has not earned", () => {
		expect(wearTitle([], "title-it-compiles", [])).toEqual({
			kind: "refused",
			reason: "not-owned",
		});
	});

	it("refuses an id no catalogue entry claims", () => {
		expect(wearTitle([], "title-does-not-exist", OWNED)).toEqual({
			kind: "refused",
			reason: "unknown",
		});
	});

	it("refuses a title already worn, so the worn set never repeats one", () => {
		expect(
			wearTitle(["title-it-compiles"], "title-it-compiles", OWNED)
		).toEqual({
			kind: "refused",
			reason: "already-worn",
		});
	});

	it("refuses one past the cap", () => {
		const full = OWNED.slice(0, WORN_TITLE_CAP);

		expect(wearTitle(full, "title-stack-overflow", OWNED)).toEqual({
			kind: "refused",
			reason: "at-cap",
		});
	});

	it("leaves the worn set untouched when it refuses", () => {
		const worn = ["title-it-compiles"];
		wearTitle(worn, "title-ship-it", []);

		expect(worn).toEqual(["title-it-compiles"]);
	});
});

describe("removeTitle", () => {
	it("takes off a worn title", () => {
		expect(removeTitle(["title-it-compiles"], "title-it-compiles")).toEqual([]);
	});

	it("keeps the order of the titles still worn", () => {
		const worn = ["title-it-compiles", "title-ship-it", "title-hello-world"];

		expect(removeTitle(worn, "title-ship-it")).toEqual([
			"title-it-compiles",
			"title-hello-world",
		]);
	});

	it("promotes the second title to primary when the first comes off", () => {
		const worn = ["title-it-compiles", "title-ship-it"];

		expect(removeTitle(worn, "title-it-compiles")[0]).toBe("title-ship-it");
	});

	it("changes nothing when the title is not worn", () => {
		const worn = ["title-it-compiles"];

		expect(removeTitle(worn, "title-hello-world")).toEqual([
			"title-it-compiles",
		]);
	});
});

describe("wearEach", () => {
	const owned = [
		"title-maintainer-git",
		"title-it-compiles",
		"title-ship-it",
		"title-hello-world",
	];

	it("wears every listed title there is room for, in the order listed", () => {
		expect(wearEach([], ["title-it-compiles", "title-ship-it"], owned)).toEqual(
			["title-it-compiles", "title-ship-it"]
		);
	});

	it("stops at the cap and leaves the rest unworn rather than swapping", () => {
		expect(
			wearEach(
				["title-maintainer-git", "title-it-compiles"],
				["title-ship-it", "title-hello-world"],
				owned
			)
		).toEqual(["title-maintainer-git", "title-it-compiles", "title-ship-it"]);
	});

	it("skips a title already worn and carries on", () => {
		expect(
			wearEach(
				["title-it-compiles"],
				["title-it-compiles", "title-ship-it"],
				owned
			)
		).toEqual(["title-it-compiles", "title-ship-it"]);
	});

	it("wears nothing the account has not earned", () => {
		expect(wearEach([], ["title-legacy-tester"], owned)).toEqual([]);
	});
});

describe("isGrantedTitleId", () => {
	it("knows a granted title from an earned one", () => {
		expect(isGrantedTitleId("title-legacy-tester")).toBe(true);
		expect(isGrantedTitleId("title-legacy-active")).toBe(true);
		expect(isGrantedTitleId("title-it-compiles")).toBe(false);
	});

	it("treats an id no catalogue entry claims as not granted", () => {
		expect(isGrantedTitleId("title-nothing")).toBe(false);
	});
});

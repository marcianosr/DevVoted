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
	it("grants the category mastery title once the correct count reaches its target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 25 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("withholds the mastery title one correct answer short of the target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 24 }));

		expect(idsOf(earned)).not.toContain("title-maintainer-git");
	});

	it("keeps the mastery title granted past its target, because a title is permanent", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 900 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("grants the entry title at ten answered, whether or not any were right", () => {
		const earned = titlesEarnedBy(countsFor({ "category-answered:css": 10 }));

		expect(idsOf(earned)).toEqual(["title-answered-css"]);
	});

	it("withholds the entry title one poll short of the target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-answered:css": 9 }));

		expect(idsOf(earned)).toEqual([]);
	});

	it("grants both rungs of a category to a record that clears both bars", () => {
		const earned = titlesEarnedBy(
			countsFor({ "category-answered:react": 40, "category-correct:react": 25 })
		);

		expect(idsOf(earned)).toEqual([
			"title-answered-react",
			"title-maintainer-react",
		]);
	});

	it("grants only the category that was answered", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 25 }));

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
				`category-correct:${code}`,
				`category-answered:${code}`,
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
			metric: "category-answered:ts",
		});
		expect(findTitleById("title-maintainer-ts")?.earn).toMatchObject({
			metric: "category-correct:ts",
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
		expect(TITLE_METRICS).toContain("category-correct:git");
		expect(TITLE_METRICS).toContain("category-answered:git");
		expect(TITLE_METRICS).toContain("polls-answered");
		expect(TITLE_METRICS).toContain("gates-reordered");
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
		const behaviour = findTitleById("title-bikeshedder");
		const granted = findTitleById("title-legacy-tester");

		expect(behaviour && titleGroupOf(behaviour)).toBe("special");
		expect(granted && titleGroupOf(granted)).toBe("special");
	});

	it("names a poll-count rung and a special title only once earned, a category title always", () => {
		const newbie = findTitleById("title-rank-poll-newbie");
		const bikeshedder = findTitleById("title-bikeshedder");
		const git = findTitleById("title-maintainer-git");

		expect(newbie && isNamedOnlyWhenEarned(newbie)).toBe(true);
		expect(bikeshedder && isNamedOnlyWhenEarned(bikeshedder)).toBe(true);
		expect(git && isNamedOnlyWhenEarned(git)).toBe(false);
	});
});

describe("progressOf", () => {
	const COUNTS = new Map([
		["gates-reordered", 30],
		["category-correct:css", 14],
	]);
	const countOf = (metric: string) => COUNTS.get(metric) ?? 0;

	it("reads a threshold title's count against its target", () => {
		const connoisseur = findTitleById("title-maintainer-css");

		expect(connoisseur && progressOf(connoisseur, countOf)).toEqual({
			count: 14,
			target: 25,
		});
	});

	it("caps the count at the target once the bar is passed", () => {
		const bikeshedder = findTitleById("title-bikeshedder");

		expect(bikeshedder && progressOf(bikeshedder, countOf)).toEqual({
			count: 25,
			target: 25,
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
		expect(idsOf(visibleTitles([]))).toContain("title-bikeshedder");
	});

	it("hides only the granted titles, so the roster is otherwise whole", () => {
		const granted = TITLES.filter(
			(title) => title.earn.kind === "granted"
		).length;

		expect(visibleTitles([]).length).toBe(TITLES.length - granted);
	});
});

const OWNED = [
	"title-bikeshedder",
	"title-ship-it",
	"title-tree-shaken",
	"title-stack-overflow",
] as const;

describe("wearTitle", () => {
	it("wears a title the account owns", () => {
		expect(wearTitle([], "title-bikeshedder", OWNED)).toEqual({
			kind: "worn",
			worn: ["title-bikeshedder"],
		});
	});

	it("appends behind what is already worn, so the first stays primary", () => {
		const decision = wearTitle(["title-bikeshedder"], "title-ship-it", OWNED);

		expect(decision).toEqual({
			kind: "worn",
			worn: ["title-bikeshedder", "title-ship-it"],
		});
	});

	it("refuses a title the account has not earned", () => {
		expect(wearTitle([], "title-bikeshedder", [])).toEqual({
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
			wearTitle(["title-bikeshedder"], "title-bikeshedder", OWNED)
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
		const worn = ["title-bikeshedder"];
		wearTitle(worn, "title-ship-it", []);

		expect(worn).toEqual(["title-bikeshedder"]);
	});
});

describe("removeTitle", () => {
	it("takes off a worn title", () => {
		expect(removeTitle(["title-bikeshedder"], "title-bikeshedder")).toEqual([]);
	});

	it("keeps the order of the titles still worn", () => {
		const worn = ["title-bikeshedder", "title-ship-it", "title-tree-shaken"];

		expect(removeTitle(worn, "title-ship-it")).toEqual([
			"title-bikeshedder",
			"title-tree-shaken",
		]);
	});

	it("promotes the second title to primary when the first comes off", () => {
		const worn = ["title-bikeshedder", "title-ship-it"];

		expect(removeTitle(worn, "title-bikeshedder")[0]).toBe("title-ship-it");
	});

	it("changes nothing when the title is not worn", () => {
		const worn = ["title-bikeshedder"];

		expect(removeTitle(worn, "title-tree-shaken")).toEqual([
			"title-bikeshedder",
		]);
	});
});

describe("wearEach", () => {
	const owned = [
		"title-maintainer-git",
		"title-bikeshedder",
		"title-ship-it",
		"title-tree-shaken",
	];

	it("wears every listed title there is room for, in the order listed", () => {
		expect(wearEach([], ["title-bikeshedder", "title-ship-it"], owned)).toEqual(
			["title-bikeshedder", "title-ship-it"]
		);
	});

	it("stops at the cap and leaves the rest unworn rather than swapping", () => {
		expect(
			wearEach(
				["title-maintainer-git", "title-bikeshedder"],
				["title-ship-it", "title-tree-shaken"],
				owned
			)
		).toEqual(["title-maintainer-git", "title-bikeshedder", "title-ship-it"]);
	});

	it("skips a title already worn and carries on", () => {
		expect(
			wearEach(
				["title-bikeshedder"],
				["title-bikeshedder", "title-ship-it"],
				owned
			)
		).toEqual(["title-bikeshedder", "title-ship-it"]);
	});

	it("wears nothing the account has not earned", () => {
		expect(wearEach([], ["title-legacy-tester"], owned)).toEqual([]);
	});
});

describe("isGrantedTitleId", () => {
	it("knows a granted title from an earned one", () => {
		expect(isGrantedTitleId("title-legacy-tester")).toBe(true);
		expect(isGrantedTitleId("title-legacy-active")).toBe(true);
		expect(isGrantedTitleId("title-bikeshedder")).toBe(false);
	});

	it("treats an id no catalogue entry claims as not granted", () => {
		expect(isGrantedTitleId("title-nothing")).toBe(false);
	});
});

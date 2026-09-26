import { describe, expect, it } from "vitest";

import {
	findTitleById,
	isExclusive,
	removeTitle,
	TITLE_METRICS,
	TITLES,
	titlesEarnedBy,
	visibleTitles,
	wearTitle,
	WORN_TITLE_CAP,
} from "~/modules/account/profile/domain/title.model";
import { CATEGORY_CODES } from "~/shared/lib/categories";

const countsFor = (
	entries: Record<string, number>
): readonly { metric: string; count: number }[] =>
	Object.entries(entries).map(([metric, count]) => ({ metric, count }));

const everyCategoryCorrect = countsFor(
	Object.fromEntries(
		CATEGORY_CODES.map((code) => [`category-correct:${code}`, 1])
	)
);

const idsOf = (titles: readonly { id: string }[]) =>
	titles.map((title) => title.id);

describe("titlesEarnedBy", () => {
	it("grants the category maintainer once the count reaches its target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 25 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("withholds the maintainer one answer short of the target", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 24 }));

		expect(idsOf(earned)).not.toContain("title-maintainer-git");
	});

	it("keeps the maintainer granted past its target, because a title is permanent", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 900 }));

		expect(idsOf(earned)).toContain("title-maintainer-git");
	});

	it("grants only the category that was answered", () => {
		const earned = titlesEarnedBy(countsFor({ "category-correct:git": 25 }));

		expect(idsOf(earned)).not.toContain("title-maintainer-css");
	});

	it("grants Completer for one correct answer in every category", () => {
		expect(idsOf(titlesEarnedBy(everyCategoryCorrect))).toContain(
			"title-completer"
		);
	});

	it("withholds Completer while one category is still untouched", () => {
		const allButVue = everyCategoryCorrect.filter(
			(row) => row.metric !== "category-correct:vue"
		);

		expect(idsOf(titlesEarnedBy(allButVue))).not.toContain("title-completer");
	});

	it("withholds Completer when a category is present but zero", () => {
		const vueAtZero = everyCategoryCorrect.map((row) =>
			row.metric === "category-correct:vue" ? { ...row, count: 0 } : row
		);

		expect(idsOf(titlesEarnedBy(vueAtZero))).not.toContain("title-completer");
	});

	it("grants Summit to a run that reached the top", () => {
		expect(idsOf(titlesEarnedBy(countsFor({ "runs-won": 1 })))).toContain(
			"title-summit"
		);
	});

	it("offers First Ascent on the same clear, leaving the database to settle who gets it", () => {
		expect(idsOf(titlesEarnedBy(countsFor({ "runs-won": 1 })))).toContain(
			"title-first-ascent"
		);
	});

	it("grants Flawless at twenty perfect windows", () => {
		expect(
			idsOf(titlesEarnedBy(countsFor({ "perfect-windows": 20 })))
		).toContain("title-flawless");
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
	it("holds one maintainer per category, so no category is unrepresented", () => {
		for (const code of CATEGORY_CODES) {
			expect(findTitleById(`title-maintainer-${code}`)).toBeDefined();
		}
	});

	it("gives every title a distinct id, because the id is what the ledger stores", () => {
		const ids = TITLES.map((title) => title.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("marks First Ascent exclusive, which is what the unique index reads", () => {
		const firstAscent = findTitleById("title-first-ascent");

		expect(firstAscent && isExclusive(firstAscent)).toBe(true);
	});

	it("leaves a threshold title open to everyone who reaches it", () => {
		const summit = findTitleById("title-summit");

		expect(summit && isExclusive(summit)).toBe(false);
	});

	it("returns nothing for an id no catalogue entry claims", () => {
		expect(findTitleById("title-does-not-exist")).toBeUndefined();
	});

	it("lists every metric a title reads, so the grant path knows when to look", () => {
		expect(TITLE_METRICS).toContain("category-correct:git");
		expect(TITLE_METRICS).toContain("perfect-windows");
		expect(TITLE_METRICS).toContain("runs-won");
	});

	it("names no metric twice, since the read is one IN clause", () => {
		expect(new Set(TITLE_METRICS).size).toBe(TITLE_METRICS.length);
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
		expect(idsOf(visibleTitles([]))).toContain("title-summit");
	});

	it("hides only the granted titles, so the roster is otherwise whole", () => {
		const granted = TITLES.filter(
			(title) => title.earn.kind === "granted"
		).length;

		expect(visibleTitles([]).length).toBe(TITLES.length - granted);
	});
});

const OWNED = [
	"title-summit",
	"title-completer",
	"title-flawless",
	"title-first-ascent",
] as const;

describe("wearTitle", () => {
	it("wears a title the account owns", () => {
		expect(wearTitle([], "title-summit", OWNED)).toEqual({
			kind: "worn",
			worn: ["title-summit"],
		});
	});

	it("appends behind what is already worn, so the first stays primary", () => {
		const decision = wearTitle(["title-summit"], "title-completer", OWNED);

		expect(decision).toEqual({
			kind: "worn",
			worn: ["title-summit", "title-completer"],
		});
	});

	it("refuses a title the account has not earned", () => {
		expect(wearTitle([], "title-summit", [])).toEqual({
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
		expect(wearTitle(["title-summit"], "title-summit", OWNED)).toEqual({
			kind: "refused",
			reason: "already-worn",
		});
	});

	it("refuses one past the cap", () => {
		const full = OWNED.slice(0, WORN_TITLE_CAP);

		expect(wearTitle(full, "title-first-ascent", OWNED)).toEqual({
			kind: "refused",
			reason: "at-cap",
		});
	});

	it("leaves the worn set untouched when it refuses", () => {
		const worn = ["title-summit"];
		wearTitle(worn, "title-completer", []);

		expect(worn).toEqual(["title-summit"]);
	});
});

describe("removeTitle", () => {
	it("takes off a worn title", () => {
		expect(removeTitle(["title-summit"], "title-summit")).toEqual([]);
	});

	it("keeps the order of the titles still worn", () => {
		const worn = ["title-summit", "title-completer", "title-flawless"];

		expect(removeTitle(worn, "title-completer")).toEqual([
			"title-summit",
			"title-flawless",
		]);
	});

	it("promotes the second title to primary when the first comes off", () => {
		const worn = ["title-summit", "title-completer"];

		expect(removeTitle(worn, "title-summit")[0]).toBe("title-completer");
	});

	it("changes nothing when the title is not worn", () => {
		const worn = ["title-summit"];

		expect(removeTitle(worn, "title-flawless")).toEqual(["title-summit"]);
	});
});

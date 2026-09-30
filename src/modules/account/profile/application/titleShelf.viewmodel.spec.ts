import { describe, expect, it } from "vitest";

import {
	CLOSEST_COUNT,
	SHOWN_CATEGORIES,
	titleShelfFor,
	type ShelfTitle,
	type TitleShelfInput,
} from "~/modules/account/profile/application/titleShelf.viewmodel";

const NEWBIE = "title-rank-poll-newbie";
const ACQUAINTANCE = "title-rank-poll-acquaintance";
const CSS_CARRIER = "title-answered-css";
const CSS_CONNOISSEUR = "title-maintainer-css";
const IT_COMPILES = "title-it-compiles";
const TESTER = "title-legacy-tester";

const count = (metric: string, value: number) => ({ metric, count: value });

const shelfOf = (input: Partial<TitleShelfInput> = {}) =>
	titleShelfFor({
		ownedTitleIds: [],
		counts: [],
		filter: "all",
		moreCategories: false,
		...input,
	});

const MOCK_ACCOUNT: Partial<TitleShelfInput> = {
	ownedTitleIds: [NEWBIE, CSS_CARRIER, TESTER],
	counts: [
		count("polls-answered", 34),
		count("category-seen:css", 50),
		count("category-mastered:css", 28),
		count("category-seen:js", 35),
	],
};

const nameOf = (title: ShelfTitle) => (title.locked ? null : title.name);

describe("titleShelfFor", () => {
	describe("header", () => {
		it("counts held titles against every title the account can see", () => {
			const shelf = shelfOf(MOCK_ACCOUNT);

			expect(shelf.held).toBe(3);
			expect(shelf.total).toBe(50);
		});
	});

	describe("ladder", () => {
		it("names the next rung's threshold and how many polls are still owed", () => {
			const { ladder } = shelfOf(MOCK_ACCOUNT);

			expect(ladder.next).toEqual({ at: 36, toGo: 2 });
			expect(ladder.pollsAnswered).toBe(34);
			expect(ladder.held).toBe(1);
			expect(ladder.total).toBe(14);
		});

		it("places rungs on a log scale, so the first rungs are not crushed against the start", () => {
			const { ladder } = shelfOf(MOCK_ACCOUNT);
			const [first, second] = ladder.rungs;

			expect(first.position).toBe(0);
			expect(second.position).toBeCloseTo(Math.log(36) / Math.log(786));
			expect(ladder.rungs.at(-1)?.position).toBe(1);
			expect(ladder.top).toBe(786);
		});

		it("fills the track up to the polls answered on the same scale as the rungs", () => {
			const { ladder } = shelfOf(MOCK_ACCOUNT);

			expect(ladder.fill).toBeCloseTo(Math.log(34) / Math.log(786));
		});

		it("rings only the next rung", () => {
			const { ladder } = shelfOf(MOCK_ACCOUNT);

			expect(ladder.rungs.filter((rung) => rung.next)).toHaveLength(1);
			expect(ladder.rungs[1].next).toBe(true);
		});

		it("starts an account with no polls on an empty track, owing one poll", () => {
			const { ladder } = shelfOf();

			expect(ladder.fill).toBe(0);
			expect(ladder.next).toEqual({ at: 1, toGo: 1 });
			expect(ladder.earned).toEqual([]);
		});

		it("owes nothing and fills the whole track past the top rung", () => {
			const { ladder } = shelfOf({
				counts: [count("polls-answered", 900)],
			});

			expect(ladder.next).toBeNull();
			expect(ladder.fill).toBe(1);
		});

		it("offers every earned rung by name, earliest first", () => {
			const { ladder } = shelfOf({
				ownedTitleIds: [NEWBIE, ACQUAINTANCE],
				counts: [count("polls-answered", 40)],
			});

			expect(ladder.earned.map(nameOf)).toEqual([
				"Poll Newbie",
				"Poll Acquaintance",
			]);
		});
	});

	describe("categories", () => {
		it("pairs each category's answered title with its correct title and their counts", () => {
			const { categories } = shelfOf(MOCK_ACCOUNT);
			const css = categories.rows.find((row) => row.code === "css");

			expect(css?.answered).toMatchObject({
				id: CSS_CARRIER,
				count: 50,
				target: 50,
				earned: true,
			});
			expect(css?.correct).toMatchObject({
				id: CSS_CONNOISSEUR,
				count: 28,
				target: 50,
				earned: false,
			});
		});

		it("leads with an earned category, then the furthest along", () => {
			const { categories } = shelfOf(MOCK_ACCOUNT);

			expect(categories.rows.slice(0, 2).map((row) => row.code)).toEqual([
				"css",
				"js",
			]);
		});

		it("shows a set number of categories and states how many are held back", () => {
			const { categories } = shelfOf(MOCK_ACCOUNT);

			expect(categories.rows).toHaveLength(SHOWN_CATEGORIES);
			expect(categories.overflow).toBe(12 - SHOWN_CATEGORIES);
		});

		it("shows every category once the player asks for more", () => {
			const { categories } = shelfOf({ ...MOCK_ACCOUNT, moreCategories: true });

			expect(categories.rows).toHaveLength(12);
			expect(categories.overflow).toBe(0);
			expect(categories.expanded).toBe(true);
		});

		it("counts held category titles against both titles of every category", () => {
			const { categories } = shelfOf(MOCK_ACCOUNT);

			expect(categories.held).toBe(1);
			expect(categories.total).toBe(24);
		});
	});

	describe("special", () => {
		it("hides an unearned special title's name but states how to earn it", () => {
			const { special } = shelfOf(MOCK_ACCOUNT);
			const itCompiles = special.titles.find(
				(title) => title.id === IT_COMPILES
			);

			expect(itCompiles?.locked).toBe(true);
			expect(itCompiles?.earnedWhen).toBe("Win a run");
			expect(itCompiles?.count).toBe(0);
		});

		it("leads with an earned special title", () => {
			const { special } = shelfOf(MOCK_ACCOUNT);

			expect(nameOf(special.titles[0])).toBe("Legacy Tester");
		});
	});

	describe("filter", () => {
		it("keeps only earned special titles under earned", () => {
			const { special } = shelfOf({ ...MOCK_ACCOUNT, filter: "earned" });

			expect(special.titles.map((title) => title.id)).toEqual([TESTER]);
		});

		it("keeps only categories holding an earned title under earned", () => {
			const { categories } = shelfOf({ ...MOCK_ACCOUNT, filter: "earned" });

			expect(categories.rows.map((row) => row.code)).toEqual(["css"]);
			expect(categories.overflow).toBe(0);
		});

		it("ranks the unearned titles already started by share complete under closest", () => {
			const { closest } = shelfOf(MOCK_ACCOUNT);

			expect(closest.map((title) => title.id)).toEqual([
				"title-rank-poll-acquaintance",
				"title-answered-js",
				CSS_CONNOISSEUR,
			]);
		});

		it("lists at most a set number of closest titles", () => {
			const { closest } = shelfOf({
				counts: ["html", "css", "js", "ts", "react", "git", "java"].map(
					(code) => count(`category-seen:${code}`, 5)
				),
			});

			expect(closest).toHaveLength(CLOSEST_COUNT);
		});
	});
});

import { describe, expect, it } from "vitest";

import {
	answeredPairsOf,
	checkedPairsOf,
	pairShareOf,
	sideOf,
} from "~/modules/run/run/domain/pairPoll.model";

const SELECTORS = [
	["div + div", "the next sibling"],
	["div > div", "a direct child"],
	["div ~ div", "any later sibling"],
	["div div", "any descendant"],
];

const pairs = {
	answerType: "pairs",
	options: SELECTORS.flatMap((tiles, group) =>
		tiles.map((label) => ({ id: label, label, correct: true, group }))
	),
} as const;

const matched = (...groups: number[]) => ({
	matched: groups.flatMap((group) => SELECTORS[group]),
	missed: [],
});

describe("sideOf", () => {
	it("puts the first authored tile of a pair on the left and the second on the right", () => {
		expect(sideOf(pairs, "div > div")).toBe("left");
		expect(sideOf(pairs, "a direct child")).toBe("right");
	});

	it("knows no side for a tile outside the poll", () => {
		expect(sideOf(pairs, "div * div")).toBeUndefined();
	});
});

const linkedAsAuthored = SELECTORS.map(
	([left, right]) => [left, right] as const
);

const swapped = (
	links: readonly (readonly [string, string])[],
	first: number,
	second: number
) =>
	links.map(([left], index) => {
		if (index === first) return [left, links[second][1]] as const;
		if (index === second) return [left, links[first][1]] as const;
		return links[index];
	});

describe("checkedPairsOf", () => {
	it("keeps every tile of a fully right set of links", () => {
		expect(checkedPairsOf(pairs, linkedAsAuthored)).toEqual(SELECTORS.flat());
	});

	it("keeps only the pairs whose two tiles were linked to each other", () => {
		expect(checkedPairsOf(pairs, swapped(linkedAsAuthored, 0, 1))).toEqual([
			...SELECTORS[2],
			...SELECTORS[3],
		]);
	});

	it("keeps nothing when no link joins a real pair", () => {
		const shifted = SELECTORS.map(
			([left], index) => [left, SELECTORS[(index + 1) % 4][1]] as const
		);
		expect(checkedPairsOf(pairs, shifted)).toEqual([]);
	});

	it("refuses fewer than four links", () => {
		expect(checkedPairsOf(pairs, linkedAsAuthored.slice(0, 3))).toBeUndefined();
	});

	it("refuses a tile linked twice", () => {
		const twice = linkedAsAuthored.map(([left], index) =>
			index === 1 ? ([left, SELECTORS[0][1]] as const) : linkedAsAuthored[index]
		);
		expect(checkedPairsOf(pairs, twice)).toBeUndefined();
	});

	it("refuses a link that does not run from a left tile to a right tile", () => {
		const reversed = linkedAsAuthored.map(([left, right], index) =>
			index === 0 ? ([right, left] as const) : ([left, right] as const)
		);
		expect(checkedPairsOf(pairs, reversed)).toBeUndefined();
	});

	it("refuses a tile outside the poll", () => {
		const stranger = linkedAsAuthored.map(([left, right], index) =>
			index === 0 ? (["div * div", right] as const) : ([left, right] as const)
		);
		expect(checkedPairsOf(pairs, stranger)).toBeUndefined();
	});
});

describe("pairShareOf", () => {
	it("pays the full share for three matched pairs", () => {
		expect(pairShareOf(pairs, matched(0, 1, 2).matched)).toBe(1);
	});

	it("pays a third per matched pair", () => {
		expect(pairShareOf(pairs, matched(2).matched)).toBeCloseTo(1 / 3);
	});

	it("pays nothing when every pair was missed", () => {
		expect(pairShareOf(pairs, [])).toBe(0);
	});

	it("never pays more than the full share for a fourth pair", () => {
		expect(pairShareOf(pairs, matched(0, 1, 2, 3).matched)).toBe(1);
	});
});

describe("answeredPairsOf", () => {
	it("lists every pair left to right, marked matched only where the player matched it", () => {
		expect(answeredPairsOf(pairs, matched(1).matched)).toEqual([
			{ left: "div + div", right: "the next sibling", matched: false },
			{ left: "div > div", right: "a direct child", matched: true },
			{ left: "div ~ div", right: "any later sibling", matched: false },
			{ left: "div div", right: "any descendant", matched: false },
		]);
	});

	it("records the right tile the player linked to each pair's left tile", () => {
		const links = swapped(linkedAsAuthored, 0, 1);

		expect(
			answeredPairsOf(pairs, checkedPairsOf(pairs, links) ?? [], links).map(
				(pair) => pair.linked
			)
		).toEqual([
			"a direct child",
			"the next sibling",
			"any later sibling",
			"any descendant",
		]);
	});
});

describe("a pairs poll of six pairs", () => {
	const SIX = [
		...SELECTORS,
		["div:has(p)", "a div holding a p"],
		["div:not(p)", "any div at all"],
	];
	const six = {
		options: SIX.flatMap((tiles, group) =>
			tiles.map((label) => ({ id: label, label, correct: true, group }))
		),
	};
	const asAuthored = SIX.map(([left, right]) => [left, right] as const);

	it("takes six links as a full check", () => {
		expect(checkedPairsOf(six, asAuthored)).toEqual(SIX.flat());
	});

	it("refuses four links, leaving two pairs unlinked", () => {
		expect(checkedPairsOf(six, asAuthored.slice(0, 4))).toBeUndefined();
	});

	it("pays a fifth per right link, since the sixth is forced", () => {
		expect(pairShareOf(six, SIX.slice(0, 4).flat())).toBeCloseTo(4 / 5);
		expect(pairShareOf(six, SIX.flat())).toBe(1);
	});
});

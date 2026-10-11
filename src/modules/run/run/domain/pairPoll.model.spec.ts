import { describe, expect, it } from "vitest";

import {
	answeredPairsOf,
	matchPair,
	NO_PAIRS_RESOLVED,
	pairShareOf,
	pairsFinished,
	pairsProgressAfter,
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

describe("matchPair", () => {
	it("matches two tiles of one pair, from either side", () => {
		expect(
			matchPair(pairs, NO_PAIRS_RESOLVED, ["a direct child", "div > div"])
		).toEqual({ kind: "matched", pair: 1 });
	});

	it("misses the pair the player started from when the partner belongs elsewhere", () => {
		expect(
			matchPair(pairs, NO_PAIRS_RESOLVED, ["div + div", "any descendant"])
		).toEqual({ kind: "missed", pair: 0 });
	});

	it("refuses two tiles from the same side", () => {
		expect(
			matchPair(pairs, NO_PAIRS_RESOLVED, ["div + div", "div > div"])
		).toBeUndefined();
	});

	it("refuses a tile whose pair is already matched", () => {
		expect(
			matchPair(pairs, matched(0), ["div + div", "any later sibling"])
		).toBeUndefined();
	});

	it("refuses a tile whose pair was already missed", () => {
		expect(
			matchPair(pairs, { matched: [], missed: [3] }, [
				"div ~ div",
				"any descendant",
			])
		).toBeUndefined();
	});

	it("keeps a wrongly picked partner in play after the miss", () => {
		const missed = pairsProgressAfter(NO_PAIRS_RESOLVED, {
			kind: "missed",
			pair: 0,
		});

		expect(matchPair(pairs, missed, ["div div", "any descendant"])).toEqual({
			kind: "matched",
			pair: 3,
		});
	});

	it("refuses anything but two known tiles", () => {
		expect(matchPair(pairs, NO_PAIRS_RESOLVED, ["div + div"])).toBeUndefined();
		expect(
			matchPair(pairs, NO_PAIRS_RESOLVED, ["div + div", "div * div"])
		).toBeUndefined();
	});
});

describe("pairsFinished", () => {
	it("stays open while two pairs are still unresolved", () => {
		expect(pairsFinished({ ...matched(0), missed: [1] })).toBe(false);
	});

	it("finishes once three pairs are resolved, since the last is forced", () => {
		expect(pairsFinished({ ...matched(0), missed: [1, 2] })).toBe(true);
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
});

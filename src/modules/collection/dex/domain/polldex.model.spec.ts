import { describe, expect, it } from "vitest";

import type { CategoryCode } from "~/shared/lib/categories";

import {
	filterPolldexEntries,
	formatDexNumber,
	FUMBLED_ACCURACY,
	MASTERED_ACCURACY,
	polldexCoverage,
	polldexTallies,
	presentCategories,
	sortByDexNumber,
	unmetCount,
	type PolldexEntry,
} from "~/modules/collection/dex/domain/polldex.model";

const entry = (overrides: Partial<PolldexEntry> = {}): PolldexEntry => ({
	id: 1,
	pollNumber: null,
	categoryCode: "css",
	seen: true,
	question: "What does the box model describe?",
	timesSeen: 3,
	answeredCount: 2,
	accuracy: 100,
	...overrides,
});

const unseen = (overrides: Partial<PolldexEntry> = {}): PolldexEntry =>
	entry({
		seen: false,
		question: null,
		timesSeen: 0,
		answeredCount: 0,
		accuracy: null,
		...overrides,
	});

describe("filterPolldexEntries", () => {
	it("returns every entry when the filter is 'all'", () => {
		const entries = [entry({ id: 1 }), unseen({ id: 2, categoryCode: "js" })];

		expect(filterPolldexEntries(entries, "all")).toHaveLength(2);
	});

	it("keeps only entries whose category matches the selected category", () => {
		const cssEntry = entry({ id: 1, categoryCode: "css" });
		const jsEntry = entry({ id: 2, categoryCode: "js" });

		expect(filterPolldexEntries([cssEntry, jsEntry], "js")).toEqual([jsEntry]);
	});

	it("keeps unseen entries under their category (redacted rows still filter)", () => {
		const cssSeen = entry({ id: 1, categoryCode: "css" });
		const cssUnseen = unseen({ id: 2, categoryCode: "css" });
		const jsSeen = entry({ id: 3, categoryCode: "js" });

		expect(filterPolldexEntries([cssSeen, cssUnseen, jsSeen], "css")).toEqual([
			cssSeen,
			cssUnseen,
		]);
	});

	it("keeps only met polls under the 'seen' filter", () => {
		const met = entry({ id: 1 });
		const unmet = unseen({ id: 2 });

		expect(filterPolldexEntries([met, unmet], "all", "seen")).toEqual([met]);
	});

	it("keeps only entries at or above the mastery band under 'mastered'", () => {
		const mastered = entry({ id: 1, accuracy: MASTERED_ACCURACY });
		const middling = entry({ id: 2, accuracy: MASTERED_ACCURACY - 1 });

		expect(
			filterPolldexEntries([mastered, middling], "all", "mastered")
		).toEqual([mastered]);
	});

	it("keeps only entries below the fumble band under 'fumbled'", () => {
		const fumbled = entry({ id: 1, accuracy: FUMBLED_ACCURACY - 1 });
		const middling = entry({ id: 2, accuracy: FUMBLED_ACCURACY });

		expect(filterPolldexEntries([fumbled, middling], "all", "fumbled")).toEqual(
			[fumbled]
		);
	});

	it("counts a poll served but never answered as neither mastered nor fumbled", () => {
		const unanswered = entry({ id: 1, answeredCount: 0, accuracy: null });

		expect(filterPolldexEntries([unanswered], "all", "mastered")).toEqual([]);
		expect(filterPolldexEntries([unanswered], "all", "fumbled")).toEqual([]);
		expect(filterPolldexEntries([unanswered], "all", "seen")).toEqual([
			unanswered,
		]);
	});

	it("narrows on both axes at once — 'the CSS polls I keep fumbling'", () => {
		const cssFumbled = entry({ id: 1, categoryCode: "css", accuracy: 0 });
		const cssMastered = entry({ id: 2, categoryCode: "css", accuracy: 100 });
		const jsFumbled = entry({ id: 3, categoryCode: "js", accuracy: 0 });

		expect(
			filterPolldexEntries(
				[cssFumbled, cssMastered, jsFumbled],
				"css",
				"fumbled"
			)
		).toEqual([cssFumbled]);
	});

	it("defaults to every poll when no knowledge filter is given", () => {
		const met = entry({ id: 1 });
		const unmet = unseen({ id: 2 });

		expect(filterPolldexEntries([met, unmet], "all")).toHaveLength(2);
	});
});

describe("polldexTallies", () => {
	it("counts each band, with the roster total under 'all'", () => {
		const entries = [
			entry({ id: 1, accuracy: 100 }),
			entry({ id: 2, accuracy: 10 }),
			entry({ id: 3, accuracy: 55 }),
			unseen({ id: 4 }),
		];

		expect(polldexTallies(entries)).toEqual({
			all: 4,
			seen: 3,
			mastered: 1,
			fumbled: 1,
		});
	});

	it("tallies the set it is handed, so a chosen category narrows the pills", () => {
		const entries = [
			entry({ id: 1, categoryCode: "css", accuracy: 100 }),
			entry({ id: 2, categoryCode: "css", accuracy: 0 }),
		];

		expect(polldexTallies(filterPolldexEntries(entries, "css"))).toEqual({
			all: 2,
			seen: 2,
			mastered: 1,
			fumbled: 1,
		});
	});
});

describe("unmetCount", () => {
	it("counts the polls never served, which are the rows the reveal uncovers", () => {
		expect(
			unmetCount([entry({ id: 1 }), unseen({ id: 2 }), unseen({ id: 3 })])
		).toBe(2);
	});
});

describe("polldexCoverage", () => {
	it("counts seen entries and rounds the coverage percentage", () => {
		const entries = [
			entry({ id: 1, seen: true }),
			entry({ id: 2, seen: true }),
			unseen({ id: 3 }),
		];

		expect(polldexCoverage(entries)).toEqual({
			seen: 2,
			total: 3,
			percent: 67,
		});
	});

	it("reports zero coverage for an empty set without dividing by zero", () => {
		expect(polldexCoverage([])).toEqual({ seen: 0, total: 0, percent: 0 });
	});
});

describe("formatDexNumber", () => {
	it("uses poll_number when present, padded to three digits", () => {
		expect(formatDexNumber(entry({ id: 512, pollNumber: 7 }))).toBe("#007");
	});

	it("falls back to the id when poll_number is null", () => {
		expect(formatDexNumber(entry({ id: 42, pollNumber: null }))).toBe("#042");
	});
});

describe("sortByDexNumber", () => {
	it("orders ascending by poll_number, falling back to id, without mutating input", () => {
		const input = [
			entry({ id: 1, pollNumber: 322 }),
			entry({ id: 2, pollNumber: 31 }),
			entry({ id: 3, pollNumber: null }),
		];

		const sorted = sortByDexNumber(input);

		expect(sorted.map((e) => e.pollNumber ?? e.id)).toEqual([3, 31, 322]);
		expect(input[0].pollNumber).toBe(322); // original array untouched
	});
});

describe("presentCategories", () => {
	it("returns distinct categories in canonical CATEGORY_CODES order", () => {
		const entries = [
			entry({ id: 1, categoryCode: "js" }),
			entry({ id: 2, categoryCode: "css" }),
			entry({ id: 3, categoryCode: "js" }),
		];

		const expected: CategoryCode[] = ["css", "js"];
		expect(presentCategories(entries)).toEqual(expected);
	});
});

import { describe, expect, it } from "vitest";

import {
	redactPoll,
	REDACTED_LABEL,
} from "~/modules/run/run/application/pollView.viewmodel";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import {
	PAIR_TILES,
	pairsPoll,
	pairTiles,
} from "~/modules/run/run/domain/run.factory";

const poll: RunPoll = {
	id: "q1",
	category: "js",
	question: "Which one?",
	answerType: "single",
	options: [
		{ id: "a", label: "Array.prototype.map", correct: true },
		{ id: "b", label: "Array.prototype.forEach", correct: false },
		{ id: "c", label: "Array.prototype.push", correct: false },
	],
};

describe(redactPoll, () => {
	it("strips correctness from every option", () => {
		for (const option of redactPoll(poll).options)
			expect("correct" in option).toBe(false);
	});

	it("serves every label when the gate sealed nothing", () => {
		expect(redactPoll(poll).options.map((option) => option.label)).toEqual([
			"Array.prototype.map",
			"Array.prototype.forEach",
			"Array.prototype.push",
		]);
	});

	it("never puts a sealed option's text in the view", () => {
		const view = redactPoll(poll, ["a", "c"]);
		expect(JSON.stringify(view)).not.toContain("Array.prototype.map");
		expect(JSON.stringify(view)).not.toContain("Array.prototype.push");
		expect(JSON.stringify(view)).toContain("Array.prototype.forEach");
	});

	it("keeps a sealed option's id, so it stays pickable and buyable", () => {
		expect(redactPoll(poll, ["a"]).options.map((option) => option.id)).toEqual([
			"a",
			"b",
			"c",
		]);
		expect(redactPoll(poll, ["a"]).options[0].label).toBe(REDACTED_LABEL);
	});
});

describe("redactPoll on a matching pairs poll", () => {
	const pairs = pairsPoll("selectors");
	const leftOf = (view: ReturnType<typeof redactPoll>) =>
		view.pairs?.left.map((tile) => tile.label);
	const rightOf = (view: ReturnType<typeof redactPoll>) =>
		view.pairs?.right.map((tile) => tile.label);

	it("never tells the client which pair a tile belongs to", () => {
		expect(JSON.stringify(redactPoll(pairs))).not.toContain('group":');
	});

	it("puts every pair's first tile on the left and its second on the right", () => {
		const view = redactPoll(pairs);

		expect([...(leftOf(view) ?? [])].sort()).toEqual(
			["div + div", "div > div", "div ~ div", "div div"].sort()
		);
		expect(rightOf(view)).toHaveLength(4);
	});

	it("deals the columns so the rows do not line up with the pairs", () => {
		const view = redactPoll(pairs);
		const rows = (leftOf(view) ?? []).map(
			(left, index) => `${left}|${rightOf(view)?.[index]}`
		);

		expect(rows).not.toEqual(
			PAIR_TILES.map(([left, right]) => `${left}|${right}`)
		);
	});

	it("deals the same columns on every load of the same poll", () => {
		expect(redactPoll(pairs).pairs).toEqual(redactPoll(pairs).pairs);
	});

	it("marks a matched pair matched and a missed pair missed, in place", () => {
		const view = redactPoll(pairs, [], false, {
			matched: pairTiles("selectors", 1),
			missed: [2],
		});
		const stateOf = (label: string) =>
			[...(view.pairs?.left ?? []), ...(view.pairs?.right ?? [])].find(
				(tile) => tile.label === label
			)?.state;

		expect(stateOf("a direct child")).toBe("matched");
		expect(stateOf("div ~ div")).toBe("missed");
		expect(stateOf("any later sibling")).toBe("missed");
		expect(stateOf("div + div")).toBe("open");
		expect(view.options).toHaveLength(4);
	});

	it("keeps naming a pairs poll pairs under 207", () => {
		expect(redactPoll(pairs, [], true).answerType).toBe("pairs");
	});
});

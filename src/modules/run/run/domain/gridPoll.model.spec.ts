import { describe, expect, it } from "vitest";

import {
	gridGroupsOf,
	gridShareOf,
	lockInGroup,
	lockFinishesGrid,
	solvedGroupsOf,
} from "~/modules/run/run/domain/gridPoll.model";

const ARRAY_METHODS = ["filter", "reduce", "find", "map"];
const BOX_MODEL = ["margin", "padding", "content", "border"];
const GIT_ACTIONS = ["commit", "rebase", "merge", "cherry-pick"];

const grid = {
	answerType: "grid",
	options: [ARRAY_METHODS, BOX_MODEL, GIT_ACTIONS].flatMap((tiles, group) =>
		tiles.map((id) => ({ id, correct: true, group }))
	),
} as const;

describe("lockInGroup", () => {
	it("solves the group when the four tiles share one, in any order", () => {
		expect(lockInGroup(grid, [], ["map", "find", "reduce", "filter"])).toEqual({
			kind: "solved",
			group: 0,
		});
	});

	it("is wrong when the four tiles span two groups", () => {
		expect(
			lockInGroup(grid, [], ["filter", "reduce", "find", "margin"])
		).toEqual({ kind: "wrong" });
	});

	it("refuses fewer than four tiles", () => {
		expect(lockInGroup(grid, [], ["filter", "reduce", "find"])).toBeUndefined();
	});

	it("refuses the same tile picked twice", () => {
		expect(
			lockInGroup(grid, [], ["filter", "filter", "reduce", "find"])
		).toBeUndefined();
	});

	it("refuses a tile that is not on the poll", () => {
		expect(
			lockInGroup(grid, [], ["filter", "reduce", "find", "flatMap"])
		).toBeUndefined();
	});

	it("refuses a tile from a group already locked in", () => {
		expect(
			lockInGroup(grid, BOX_MODEL, ["filter", "reduce", "find", "margin"])
		).toBeUndefined();
	});
});

describe("lockFinishesGrid", () => {
	it("keeps the grid open after the first solved group", () => {
		expect(lockFinishesGrid([], { kind: "solved", group: 0 })).toBe(false);
	});

	it("finishes the grid once a second group is solved, since the last four are forced", () => {
		expect(lockFinishesGrid(BOX_MODEL, { kind: "solved", group: 0 })).toBe(
			true
		);
	});

	it("finishes the grid on a wrong lock-in", () => {
		expect(lockFinishesGrid(BOX_MODEL, { kind: "wrong" })).toBe(true);
	});
});

describe("gridShareOf", () => {
	it("pays nothing when no group was solved", () => {
		expect(gridShareOf(grid, ["filter", "reduce", "find", "margin"])).toBe(0);
	});

	it("pays a third for one solved group before a wrong lock-in", () => {
		expect(
			gridShareOf(grid, [...BOX_MODEL, "filter", "reduce", "find", "commit"])
		).toBeCloseTo(1 / 3);
	});

	it("pays in full when every tile is locked in", () => {
		expect(
			gridShareOf(grid, [...ARRAY_METHODS, ...BOX_MODEL, ...GIT_ACTIONS])
		).toBe(1);
	});
});

describe("solvedGroupsOf", () => {
	it("names the groups whose four tiles were all picked", () => {
		expect(solvedGroupsOf(grid, new Set([...GIT_ACTIONS, "map"]))).toEqual([2]);
	});
});

describe("gridGroupsOf", () => {
	const labelled = {
		groupLabels: ["Array methods", "Box model", "Git actions"],
		options: grid.options.map((option) => ({ ...option, label: option.id })),
	};

	it("names every group with its tiles and whether it was locked in", () => {
		const groups = gridGroupsOf(labelled, [...BOX_MODEL, "filter"]);

		expect(groups.map((group) => [group.label, group.solved])).toEqual([
			["Array methods", false],
			["Box model", true],
			["Git actions", false],
		]);
		expect(groups[1].tiles.map((tile) => tile.label)).toEqual(BOX_MODEL);
	});
});

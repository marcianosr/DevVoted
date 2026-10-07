import { describe, expect, it } from "vitest";

import {
	redactPoll,
	REDACTED_LABEL,
} from "~/modules/run/run/application/pollView.viewmodel";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";
import { gridPoll, gridTiles } from "~/modules/run/run/domain/run.factory";

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

describe("redactPoll on a dependency grid", () => {
	const grid = gridPoll("jigsaw");
	const authored = grid.options.map((option) => option.id);

	it("never tells the client which group a tile belongs to", () => {
		const view = redactPoll(grid);

		expect(JSON.stringify(view)).not.toContain('group":');
		expect(JSON.stringify(view)).not.toContain("Array methods");
	});

	it("deals the tiles out of authored order, which is group order", () => {
		const dealt = redactPoll(grid).options.map((option) => option.id);

		expect(dealt).not.toEqual(authored);
		expect([...dealt].sort()).toEqual([...authored].sort());
	});

	it("deals the same order on every load of the same poll", () => {
		expect(redactPoll(grid).options).toEqual(redactPoll(grid).options);
	});

	it("moves a locked-in group out of the tiles and names it", () => {
		const view = redactPoll(grid, [], false, {
			locked: gridTiles("jigsaw", 1),
			namesShown: false,
		});

		expect(view.options).toHaveLength(8);
		expect(view.grid?.solved).toEqual([
			{ label: "Box model", tiles: ["margin", "padding", "content", "border"] },
		]);
		expect(view.grid?.hints).toEqual([null, null]);
	});

	it("names the unsolved groups when the build names answer types", () => {
		const view = redactPoll(grid, [], false, { locked: [], namesShown: true });

		expect(view.grid?.hints).toEqual([
			"Array methods",
			"Box model",
			"Git actions",
		]);
	});

	it("keeps naming a grid a grid under 207", () => {
		expect(redactPoll(grid, [], true).answerType).toBe("grid");
	});
});

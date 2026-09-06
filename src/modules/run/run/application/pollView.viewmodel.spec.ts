import { describe, expect, it } from "vitest";

import {
	redactPoll,
	REDACTED_LABEL,
	revealedPoll,
} from "~/modules/run/run/application/pollView.viewmodel";
import type { RunPoll } from "~/modules/run/run/domain/runPoll.model";

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

	// The view is what crosses the wire, so a sealed label must not be in it at
	// all — hiding it in the UI would ship the answer inside the response.
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

describe(revealedPoll, () => {
	// Without this the reveal leaves a redacted poll reading ?????, and since
	// correctness is matched by label nothing lights up either: the player
	// gambles and is taught nothing.
	it("puts the real text back once the answer is in", () => {
		const sealed = redactPoll(poll, ["a", "c"]);
		const shown = revealedPoll(
			sealed,
			poll.options.map((option) => option.label)
		);
		expect(shown.options.map((option) => option.label)).toEqual([
			"Array.prototype.map",
			"Array.prototype.forEach",
			"Array.prototype.push",
		]);
	});

	it("leaves the poll alone when the answer carried no labels", () => {
		const sealed = redactPoll(poll, ["a"]);
		expect(revealedPoll(sealed, undefined)).toBe(sealed);
	});

	it("keeps every option id, so the reveal marks still land", () => {
		const shown = revealedPoll(redactPoll(poll, ["a"]), ["X", "Y", "Z"]);
		expect(shown.options.map((option) => option.id)).toEqual(["a", "b", "c"]);
	});
});

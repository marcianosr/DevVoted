import { describe, expect, it } from "vitest";

import {
	type AnsweredPoll,
	type AnswerOutcome,
	answerOutcome,
	cachedHitsFor,
} from "~/modules/run/run/domain/runPoll.model";

describe("answerOutcome grades the community board and the engine alike", () => {
	const enginePoll = {
		answerType: "multiple",
		options: [
			{ id: "a", correct: true },
			{ id: "b", correct: true },
			{ id: "c", correct: false },
		],
	} as const;

	// Same poll and picks, in each side's shape: numeric ids in a Set, string ids in an array.
	const boardPoll = {
		answerType: "multiple",
		options: [
			{ id: 1, correct: true },
			{ id: 2, correct: true },
			{ id: 3, correct: false },
		],
	} as const;

	const cases = [
		{ name: "the exact correct set", engine: ["a", "b"], board: [1, 2] },
		{ name: "half the correct set", engine: ["a"], board: [1] },
		{
			name: "the correct set plus a wrong pick",
			engine: ["a", "b", "c"],
			board: [1, 2, 3],
		},
		{ name: "only wrong picks", engine: ["c"], board: [3] },
	];

	cases.forEach(({ name, engine, board }) => {
		it(`agrees on ${name}`, () => {
			expect(answerOutcome(boardPoll, new Set(board))).toBe(
				answerOutcome(enginePoll, engine)
			);
		});
	});

	it("grades a single-answer poll on the correct pick, not on set equality", () => {
		// Malformed data is where the board's old set-equality copy disagreed with the engine.
		const single = {
			answerType: "single",
			options: [
				{ id: 1, correct: true },
				{ id: 2, correct: true },
				{ id: 3, correct: false },
			],
		} as const;
		expect(answerOutcome(single, new Set([1]))).toBe("correct");
	});

	it("never calls a single-answer poll partial", () => {
		const single = {
			answerType: "single",
			options: [
				{ id: "a", correct: true },
				{ id: "b", correct: false },
			],
		} as const;
		expect(answerOutcome(single, ["b"])).toBe("wrong");
	});
});

describe("cachedHitsFor counts a category's correct answers since its last wrong one", () => {
	const answered = (
		category: AnsweredPoll["category"],
		outcome: AnswerOutcome
	): AnsweredPoll => ({
		id: `${category}-${outcome}`,
		question: "",
		category,
		outcome,
		picked: [],
	});

	it("starts cold with no answers", () => {
		expect(cachedHitsFor([], "js")).toBe(0);
	});

	it("warms one hit per correct answer in the category", () => {
		const history = [answered("js", "correct"), answered("js", "correct")];
		expect(cachedHitsFor(history, "js")).toBe(2);
	});

	it("ignores other categories entirely", () => {
		const history = [
			answered("css", "correct"),
			answered("js", "correct"),
			answered("css", "wrong"),
		];
		expect(cachedHitsFor(history, "js")).toBe(1);
	});

	it("flushes to cold on a wrong answer in the category", () => {
		const history = [
			answered("js", "correct"),
			answered("js", "correct"),
			answered("js", "wrong"),
		];
		expect(cachedHitsFor(history, "js")).toBe(0);
	});

	it("rebuilds warmth after a flush", () => {
		const history = [
			answered("js", "correct"),
			answered("js", "wrong"),
			answered("js", "correct"),
		];
		expect(cachedHitsFor(history, "js")).toBe(1);
	});

	it("leaves warmth untouched on a partial answer", () => {
		const history = [answered("js", "correct"), answered("js", "partial")];
		expect(cachedHitsFor(history, "js")).toBe(1);
	});
});

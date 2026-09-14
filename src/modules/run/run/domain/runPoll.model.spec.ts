import { describe, expect, it } from "vitest";

import {
	type AnsweredPoll,
	type AnswerOutcome,
	answerOutcome,
	cachedHitsFor,
	coverageShare,
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

describe("coverageShare lands every partial on a quarter", () => {
	const SPARE_WRONG_OPTIONS = 2;

	const keyOf = (keySize: number) => ({
		answerType: "multiple" as const,
		options: [
			...Array.from({ length: keySize }, (_, index) => ({
				id: `right-${index}`,
				correct: true,
			})),
			...Array.from({ length: SPARE_WRONG_OPTIONS }, (_, index) => ({
				id: `wrong-${index}`,
				correct: false,
			})),
		],
	});

	const picking = (caught: number, missed = 0) => [
		...Array.from({ length: caught }, (_, index) => `right-${index}`),
		...Array.from({ length: missed }, (_, index) => `wrong-${index}`),
	];

	it.each([
		[2, 1, 0.5],
		[3, 1, 0.25],
		[3, 2, 0.75],
		[4, 1, 0.25],
		[4, 2, 0.5],
		[4, 3, 0.75],
		[5, 1, 0.25],
		[5, 2, 0.5],
		[5, 3, 0.5],
		[5, 4, 0.75],
	])(
		"pays a key of %i with %i caught cleanly a share of %f",
		(keySize, caught, share) => {
			expect(coverageShare(keyOf(keySize), picking(caught))).toBe(share);
		}
	);

	it("pays the whole key a full share, exactly as a single-answer poll earns", () => {
		expect(coverageShare(keyOf(4), picking(4))).toBe(1);
	});

	it("caps a near-miss on a long key below a full share", () => {
		expect(coverageShare(keyOf(8), picking(7))).toBe(0.75);
	});

	it("never pays under a quarter while the answer still nets a catch", () => {
		expect(coverageShare(keyOf(9), picking(1))).toBe(0.25);
	});

	it("pays nothing when a wrong pick cancels the only catch", () => {
		expect(coverageShare(keyOf(2), picking(1, 1))).toBe(0);
		expect(answerOutcome(keyOf(2), picking(1, 1))).toBe("wrong");
	});

	it("pays nothing when the wrong picks outnumber the right ones", () => {
		expect(coverageShare(keyOf(3), picking(1, 2))).toBe(0);
		expect(answerOutcome(keyOf(3), picking(1, 2))).toBe("wrong");
	});

	it("drops a rung for a wrong pick rather than ignoring it", () => {
		expect(coverageShare(keyOf(4), picking(3))).toBe(0.75);
		expect(coverageShare(keyOf(4), picking(3, 1))).toBe(0.5);
	});

	it("pays a single-answer poll all or nothing, never a rung", () => {
		const single = {
			answerType: "single" as const,
			options: [
				{ id: "a", correct: true },
				{ id: "b", correct: false },
			],
		};
		expect(coverageShare(single, ["a"])).toBe(1);
		expect(coverageShare(single, ["b"])).toBe(0);
	});
});

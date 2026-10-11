import { describe, it, expect } from "vitest";

import { KANTO_QUIZ } from "~/test/kanto";

import {
	createPollWithOptionsSchema,
	updatePollSchema,
} from "./poll.validation";

const [saffron] = KANTO_QUIZ;

const optionsFor = (quiz: (typeof KANTO_QUIZ)[number]) =>
	quiz.options.map((option) => ({
		option,
		correct: option === quiz.correctAnswer,
	}));

const validPoll = {
	question: saffron.question,
	status: "draft" as const,
	answerType: "single" as const,
	categoryCode: "js",
	codeBlock: null,
	codeSandboxExample: null,
	explanation: null,
};

describe("createPollWithOptionsSchema", () => {
	it("accepts a poll with four options and one correct", () => {
		const result = createPollWithOptionsSchema.parse({
			poll: validPoll,
			options: optionsFor(saffron),
		});

		expect(result.poll.question).toBe(saffron.question);
		expect(result.options.filter((option) => option.correct)).toHaveLength(1);
	});

	it("rejects a poll where no option is marked correct", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: validPoll,
				options: saffron.options.map((option) => ({
					option,
					correct: false,
				})),
			})
		).toThrow("At least one option must be marked as correct");
	});

	it("rejects fewer than three options", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: validPoll,
				options: optionsFor(saffron).slice(0, 2),
			})
		).toThrow("At least 3 options required");
	});

	it("rejects a question shorter than ten characters", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: { ...validPoll, question: "Too short" },
				options: optionsFor(saffron),
			})
		).toThrow("Question must be at least 10 characters");
	});

	it("rejects a codeSandboxExample that is not a URL", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: { ...validPoll, codeSandboxExample: "cerulean-cave" },
				options: optionsFor(saffron),
			})
		).toThrow();
	});
});

describe("updatePollSchema", () => {
	it("accepts a partial poll, leaving untouched fields absent", () => {
		const result = updatePollSchema.parse({
			id: 7,
			poll: { question: KANTO_QUIZ[1].question },
			options: optionsFor(KANTO_QUIZ[1]),
		});

		expect(result.poll.question).toBe(KANTO_QUIZ[1].question);
		expect(result.poll.status).toBeUndefined();
	});

	it("preserves the id of an existing option so it is updated, not replaced", () => {
		const result = updatePollSchema.parse({
			id: 7,
			poll: {},
			options: optionsFor(KANTO_QUIZ[1]).map((option, index) => ({
				...option,
				id: index + 1,
			})),
		});

		expect(result.options.map((option) => option.id)).toEqual([1, 2, 3, 4]);
	});

	it("rejects a non-positive poll id", () => {
		expect(() =>
			updatePollSchema.parse({
				id: 0,
				poll: {},
				options: optionsFor(KANTO_QUIZ[1]),
			})
		).toThrow();
	});

	it("rejects an update that leaves no correct option", () => {
		expect(() =>
			updatePollSchema.parse({
				id: 7,
				poll: {},
				options: KANTO_QUIZ[1].options.map((option) => ({
					option,
					correct: false,
				})),
			})
		).toThrow("At least one option must be marked as correct");
	});
});

describe("a matching pairs poll", () => {
	const PAIRS = [
		["div + div", "the very next sibling"],
		["div > div", "a direct child"],
		["div ~ div", "any later sibling"],
		["div div", "any descendant"],
	];
	const pairsOptions = PAIRS.flatMap((tiles, group) =>
		tiles.map((option) => ({ option, correct: true, group }))
	);
	const pairsPoll = { ...validPoll, answerType: "pairs" as const };

	it("accepts four pairs of two tiles", () => {
		const result = createPollWithOptionsSchema.parse({
			poll: pairsPoll,
			options: pairsOptions,
		});

		expect(result.options.map((option) => option.group)).toContain(3);
	});

	it("rejects a pair with three tiles and another with one", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: pairsPoll,
				options: pairsOptions.map((option, index) =>
					index === 0 ? { ...option, group: 1 } : option
				),
			})
		).toThrow("A pairs poll needs four pairs of two tiles");
	});

	it("rejects a pairs poll short of a pair", () => {
		expect(() =>
			updatePollSchema.parse({
				id: 1,
				poll: pairsPoll,
				options: pairsOptions.slice(0, 6),
			})
		).toThrow("A pairs poll needs four pairs of two tiles");
	});
});

describe("an option's own explanation", () => {
	const explained = optionsFor(saffron).map((option, index) => ({
		...option,
		explanation: index === 0 ? "The one that fits." : null,
	}));

	it("accepts an option explanation and keeps it beside the option", () => {
		const result = createPollWithOptionsSchema.parse({
			poll: validPoll,
			options: explained,
		});

		expect(result.options[0]?.explanation).toBe("The one that fits.");
		expect(result.options[1]?.explanation).toBeNull();
	});

	it("rejects an option explanation over its limit", () => {
		expect(() =>
			createPollWithOptionsSchema.parse({
				poll: validPoll,
				options: [
					{ ...explained[0], explanation: "x".repeat(501) },
					...explained.slice(1),
				],
			})
		).toThrow("Option explanation cannot exceed 500 characters");
	});

	it("accepts options that explain nothing", () => {
		const result = updatePollSchema.parse({
			id: 7,
			poll: {},
			options: optionsFor(saffron),
		});

		expect(result.options.every((option) => !("explanation" in option))).toBe(
			true
		);
	});
});

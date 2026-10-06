import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import { createMockPollOptionArray } from "~/modules/polls/poll/domain/pollOption.factory";
import { KANTO_QUIZ } from "~/test/kanto";

import {
	EMPTY_POLL_FORM,
	STATUS_CHOICES,
	addAnswer,
	answerRowsOf,
	answersCountOf,
	canAddAnswer,
	canRemoveAnswer,
	changeAnswer,
	changeGroupLabel,
	gridGroupRowsOf,
	markRight,
	pollFormStateOf,
	previewOf,
	questionCountOf,
	refusalOf,
	removeAnswer,
	toPollFormData,
	withAnswerType,
	withCategory,
	withStatus,
	type PollFormState,
} from "./pollForm.viewmodel";

const quiz = KANTO_QUIZ[0];

const filled: PollFormState = {
	...EMPTY_POLL_FORM,
	question: quiz.question,
	categoryCode: "css",
	answers: quiz.options.map((option, key) => ({
		key,
		text: option,
		right: option === quiz.correctAnswer,
	})),
};

const textsOf = (state: PollFormState) =>
	state.answers.map((answer) => answer.text);
const rightsOf = (state: PollFormState) =>
	state.answers.filter((answer) => answer.right).map((answer) => answer.key);

describe("EMPTY_POLL_FORM", () => {
	it("starts with the minimum of blank answers, none right, one right expected", () => {
		expect(EMPTY_POLL_FORM.answers).toHaveLength(3);
		expect(rightsOf(EMPTY_POLL_FORM)).toEqual([]);
		expect(EMPTY_POLL_FORM.answerType).toBe("single");
		expect(EMPTY_POLL_FORM.status).toBe("draft");
	});
});

describe("pollFormStateOf", () => {
	it("reads a stored poll and its options back into the form, keeping option ids", () => {
		const poll = createMockPoll({
			id: 7,
			question: quiz.question,
			explanation: null,
			codeSandboxExample: "https://codesandbox.io/s/x",
		});
		const state = pollFormStateOf(poll, createMockPollOptionArray(7));

		expect(state.question).toBe(quiz.question);
		expect(state.explanation).toBe("");
		expect(state.codeSandboxExample).toBe("https://codesandbox.io/s/x");
		expect(state.answers.every((answer) => answer.id !== undefined)).toBe(true);
	});
});

describe("answers", () => {
	it("adds a blank answer with a key no earlier answer had", () => {
		const removed = removeAnswer(addAnswer(EMPTY_POLL_FORM), 1);
		const added = addAnswer(removed);

		expect(added.answers.map((answer) => answer.key)).toEqual([0, 2, 3, 4]);
	});

	it("stops adding at the maximum", () => {
		const full = Array.from({ length: 20 }).reduce<PollFormState>(
			(state) => addAnswer(state),
			EMPTY_POLL_FORM
		);

		expect(full.answers).toHaveLength(20);
		expect(canAddAnswer(full)).toBe(false);
		expect(addAnswer(full)).toBe(full);
	});

	it("never removes below the minimum", () => {
		expect(canRemoveAnswer(EMPTY_POLL_FORM)).toBe(false);
		expect(removeAnswer(EMPTY_POLL_FORM, 0)).toBe(EMPTY_POLL_FORM);
	});

	it("changes one answer's text and leaves the rest", () => {
		expect(textsOf(changeAnswer(EMPTY_POLL_FORM, 1, "Silph Co."))).toEqual([
			"",
			"Silph Co.",
			"",
		]);
	});

	it("marks exactly one right on a single-answer poll", () => {
		const marked = markRight(markRight(EMPTY_POLL_FORM, 0), 2);

		expect(rightsOf(marked)).toEqual([2]);
	});

	it("toggles each answer on a multi-answer poll", () => {
		const multiple = withAnswerType(EMPTY_POLL_FORM, "multiple");
		const marked = markRight(markRight(markRight(multiple, 0), 2), 0);

		expect(rightsOf(marked)).toEqual([2]);
	});

	it("keeps only the first right answer when the poll goes back to single", () => {
		const multiple = withAnswerType(EMPTY_POLL_FORM, "multiple");
		const marked = markRight(markRight(multiple, 1), 2);

		expect(rightsOf(withAnswerType(marked, "single"))).toEqual([1]);
	});

	it("letters the rows in order", () => {
		expect(answerRowsOf(EMPTY_POLL_FORM).map((row) => row.letter)).toEqual([
			"A",
			"B",
			"C",
		]);
	});
});

describe("withCategory and withStatus", () => {
	it("take a known value and ignore an unknown one", () => {
		expect(withCategory(EMPTY_POLL_FORM, "css").categoryCode).toBe("css");
		expect(withCategory(EMPTY_POLL_FORM, "cobol")).toBe(EMPTY_POLL_FORM);
		expect(withStatus(EMPTY_POLL_FORM, "published").status).toBe("published");
		expect(withStatus(EMPTY_POLL_FORM, "lost")).toBe(EMPTY_POLL_FORM);
	});

	it("offers every status as a choice", () => {
		expect(STATUS_CHOICES.map((choice) => choice.value)).toEqual([
			"draft",
			"published",
			"archived",
		]);
	});
});

describe("counters", () => {
	it("states the question's length against its limits", () => {
		expect(questionCountOf("")).toBe("0 / 2000 · min 10");
		expect(questionCountOf(quiz.question)).toBe(
			`${quiz.question.length} / 2000 · min 10`
		);
	});

	it("states how many answers there are against both limits", () => {
		expect(answersCountOf(EMPTY_POLL_FORM.answers)).toBe(
			"3 of 20 answers · at least 3"
		);
	});
});

describe("refusalOf", () => {
	it("asks for the question first", () => {
		expect(refusalOf(EMPTY_POLL_FORM)).toBe("question needs 10 characters");
	});

	it("then for text in every answer", () => {
		expect(refusalOf({ ...EMPTY_POLL_FORM, question: quiz.question })).toBe(
			"every answer needs text"
		);
	});

	it("then for a right answer, worded for the answer type", () => {
		const unmarked = {
			...filled,
			answers: filled.answers.map((answer) => ({ ...answer, right: false })),
		};

		expect(refusalOf(unmarked)).toBe("mark one answer right");
		expect(refusalOf(withAnswerType(unmarked, "multiple"))).toBe(
			"mark at least one answer right"
		);
	});

	it("then for a real sandbox URL, if one is given at all", () => {
		expect(refusalOf({ ...filled, codeSandboxExample: "codesandbox" })).toBe(
			"CodeSandbox needs a full URL"
		);
		expect(
			refusalOf({ ...filled, codeSandboxExample: "https://codesandbox.io/s/x" })
		).toBeUndefined();
	});

	it("has nothing to refuse on a finished poll", () => {
		expect(refusalOf(filled)).toBeUndefined();
	});
});

describe("previewOf", () => {
	it("shows the poll as the run would, lettered and unpicked", () => {
		const preview = previewOf(filled);

		expect(preview.question).toBe(quiz.question);
		expect(preview.options.map((option) => option.letter)).toEqual([
			"A",
			"B",
			"C",
			"D",
		]);
		expect(preview.onPick).toBeUndefined();
		expect(preview.options[0]?.label).toBe(quiz.options[0]);
	});

	it("names a blank answer by its number so the row still shows", () => {
		expect(previewOf(EMPTY_POLL_FORM).options[1]?.label).toBe("answer 2");
	});
});

describe("toPollFormData", () => {
	it("sends blanks as null, keeps option ids, and never mentions a code block", () => {
		const state: PollFormState = {
			...filled,
			answers: filled.answers.map((answer) => ({
				...answer,
				id: answer.key + 10,
			})),
		};
		const data = toPollFormData(state);

		expect(data.poll.codeSandboxExample).toBeNull();
		expect(data.poll.explanation).toBeNull();
		expect(data.poll).not.toHaveProperty("codeBlock");
		expect(data.options[0]).toEqual({
			id: 10,
			option: quiz.options[0],
			correct: quiz.options[0] === quiz.correctAnswer,
		});
	});

	it("leaves an id off a new option", () => {
		expect(toPollFormData(filled).options[0]).not.toHaveProperty("id");
	});
});

describe("authoring a dependency grid", () => {
	const GROUPS = [
		["filter", "reduce", "find", "map"],
		["margin", "padding", "content", "border"],
		["commit", "rebase", "merge", "cherry-pick"],
	];
	const LABELS = ["Array methods", "Box model", "Git actions"];

	const gridOf = (state: PollFormState): PollFormState =>
		withAnswerType(state, "grid");

	const writtenGrid = (): PollFormState => {
		const grid = gridOf(filled);
		return {
			...grid,
			groupLabels: LABELS,
			answers: grid.answers.map((answer, index) => ({
				...answer,
				text: GROUPS.flat()[index],
			})),
		};
	};

	it("deals twelve tiles into three groups of four when the grid is picked", () => {
		const grid = gridOf(filled);

		expect(grid.answers).toHaveLength(12);
		expect(gridGroupRowsOf(grid).map((group) => group.tiles.length)).toEqual([
			4, 4, 4,
		]);
	});

	it("keeps the answers already written as the first tiles", () => {
		expect(gridOf(filled).answers[0].text).toBe(quiz.options[0]);
	});

	it("neither adds nor removes a tile on a grid", () => {
		expect(canAddAnswer(gridOf(filled))).toBe(false);
		expect(canRemoveAnswer(gridOf(filled))).toBe(false);
	});

	it("names a group", () => {
		const named = changeGroupLabel(gridOf(filled), 1, "Box model");

		expect(gridGroupRowsOf(named)[1].label).toBe("Box model");
	});

	it("asks for every group's name before anything else on the grid", () => {
		expect(refusalOf({ ...writtenGrid(), groupLabels: ["", "", ""] })).toBe(
			"every group needs a name"
		);
	});

	it("asks for every tile's text", () => {
		const blank = changeAnswer(writtenGrid(), writtenGrid().answers[5].key, "");

		expect(refusalOf(blank)).toBe("every tile needs text");
	});

	it("refuses the same tile twice, whatever its case", () => {
		const twice = changeAnswer(
			writtenGrid(),
			writtenGrid().answers[11].key,
			"FILTER"
		);

		expect(refusalOf(twice)).toBe("each tile appears once");
	});

	it("accepts a written grid", () => {
		expect(refusalOf(writtenGrid())).toBeUndefined();
	});

	it("sends every tile right with its group, and the group names", () => {
		const data = toPollFormData(writtenGrid());

		expect(data.poll.groupLabels).toEqual(LABELS);
		expect(data.options[4]).toEqual({
			option: "margin",
			correct: true,
			group: 1,
		});
	});

	it("drops the groups when the author leaves the grid", () => {
		const single = withAnswerType(writtenGrid(), "single");

		expect(toPollFormData(single).poll.groupLabels).toBeNull();
		expect(single.answers.every((answer) => answer.group === undefined)).toBe(
			true
		);
		expect(single.answers.some((answer) => answer.right)).toBe(false);
	});

	it("previews the grid with its group names showing", () => {
		expect(previewOf(writtenGrid()).grid?.hints).toEqual(LABELS);
	});
});

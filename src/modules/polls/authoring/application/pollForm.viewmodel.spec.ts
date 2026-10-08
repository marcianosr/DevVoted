import { describe, expect, it } from "vitest";

import { createMockPoll } from "~/modules/polls/poll/domain/poll.factory";
import { createMockPollOptionArray } from "~/modules/polls/poll/domain/pollOption.factory";
import { KANTO_QUIZ } from "~/test/kanto";

import {
	EMPTY_POLL_FORM,
	STATUS_CHOICES,
	addAnswer,
	answerRowsOf,
	canAddAnswer,
	canRemoveAnswer,
	changeAnswer,
	changeAnswerExplanation,
	markRight,
	pollFormStateOf,
	UNPLAYED,
	canLockIn,
	lockInPreview,
	pickInPreview,
	previewCategoryOf,
	previewOf,
	questionCountOf,
	refusalOf,
	removeAnswer,
	rewardOf,
	stepsDoneOf,
	suggestFormFor,
	submissionOf,
	withAnswerType,
	withCategory,
	withCodeBlock,
	withInlineCode,
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
		explanation: "",
	})),
};

const explanationsOf = (state: PollFormState) =>
	state.answers.map((answer) => answer.explanation);

const explainedAll = (state: PollFormState): PollFormState => ({
	...state,
	answers: state.answers.map((answer) => ({
		...answer,
		explanation: answer.right ? "It is the one." : "It is not.",
	})),
});

const textsOf = (state: PollFormState) =>
	state.answers.map((answer) => answer.text);
const rightsOf = (state: PollFormState) =>
	state.answers.filter((answer) => answer.right).map((answer) => answer.key);

describe("EMPTY_POLL_FORM", () => {
	it("starts with the minimum of blank answers, none right, one right expected, no category", () => {
		expect(EMPTY_POLL_FORM.answers).toHaveLength(3);
		expect(EMPTY_POLL_FORM.categoryCode).toBeUndefined();
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

	it("changes one answer's explanation and leaves the rest", () => {
		const changed = changeAnswerExplanation(filled, 1, "Not this one.");

		expect(explanationsOf(changed)).toEqual(["", "Not this one.", "", ""]);
		expect(textsOf(changed)).toEqual(textsOf(filled));
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

	it("carries each answer's explanation into its row", () => {
		const rows = answerRowsOf(explainedAll(filled));

		expect(rows.map((row) => row.explanation)).toEqual(
			explanationsOf(explainedAll(filled))
		);
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

describe("questionCountOf", () => {
	it("states the question's length against its maximum", () => {
		expect(questionCountOf("")).toBe("0 / 2000");
		expect(questionCountOf(quiz.question)).toBe(
			`${quiz.question.length} / 2000`
		);
	});
});

describe("code snippets", () => {
	it("appends inline code to the question", () => {
		expect(
			withInlineCode({ ...EMPTY_POLL_FORM, question: "Is" }).question
		).toBe("Is `code`");
	});

	it("appends a js block on its own lines", () => {
		expect(
			withCodeBlock({ ...EMPTY_POLL_FORM, question: "What logs?" }).question
		).toBe("What logs?\n```js\n\n```");
	});

	it("starts an empty question with the snippet itself", () => {
		expect(withInlineCode(EMPTY_POLL_FORM).question).toBe("`code`");
		expect(withCodeBlock(EMPTY_POLL_FORM).question).toBe("```js\n\n```");
	});
});

describe("stepsDoneOf", () => {
	it("lights nothing on an empty form", () => {
		expect(stepsDoneOf(EMPTY_POLL_FORM)).toEqual({
			question: false,
			answers: false,
			category: false,
			explanation: false,
		});
	});

	it("lights the question, answers and category of a finished poll", () => {
		expect(stepsDoneOf(filled)).toEqual({
			question: true,
			answers: true,
			category: true,
			explanation: false,
		});
	});

	it("keeps the answers dark until one is marked right", () => {
		const unmarked = {
			...filled,
			answers: filled.answers.map((answer) => ({ ...answer, right: false })),
		};

		expect(stepsDoneOf(unmarked).answers).toBe(false);
	});

	it("lights the explanation once it has text", () => {
		expect(
			stepsDoneOf({ ...filled, explanation: "Because hoisting." }).explanation
		).toBe(true);
	});

	it("lights the explanation when every right answer has a reason and the note is blank", () => {
		const rightOnly: PollFormState = {
			...filled,
			answers: filled.answers.map((answer) => ({
				...answer,
				explanation: answer.right ? "It is the one." : "",
			})),
		};

		expect(stepsDoneOf(rightOnly).explanation).toBe(true);
	});

	it("keeps the explanation dark while a right answer lacks a reason and the note is blank", () => {
		const wrongOnly: PollFormState = {
			...filled,
			answers: filled.answers.map((answer) => ({
				...answer,
				explanation: answer.right ? "" : "It is not.",
			})),
		};

		expect(stepsDoneOf(wrongOnly).explanation).toBe(false);
		expect(stepsDoneOf(filled).explanation).toBe(false);
	});

	it("keeps the explanation dark on reasons alone while no answer is right", () => {
		const unmarked: PollFormState = {
			...explainedAll(filled),
			answers: explainedAll(filled).answers.map((answer) => ({
				...answer,
				right: false,
			})),
		};

		expect(stepsDoneOf(unmarked).explanation).toBe(false);
	});
});

describe("refusalOf", () => {
	it("asks for the question first", () => {
		expect(refusalOf(EMPTY_POLL_FORM)).toBe("Write the question");
	});

	it("then for text in every answer", () => {
		expect(refusalOf({ ...EMPTY_POLL_FORM, question: quiz.question })).toBe(
			"Fill every answer"
		);
	});

	it("then for a right answer, worded for the answer type", () => {
		const unmarked = {
			...filled,
			answers: filled.answers.map((answer) => ({ ...answer, right: false })),
		};

		expect(refusalOf(unmarked)).toBe("Mark the right answer");
		expect(refusalOf(withAnswerType(unmarked, "multiple"))).toBe(
			"Mark the right answers"
		);
	});

	it("then for a category", () => {
		expect(refusalOf({ ...filled, categoryCode: undefined })).toBe(
			"Pick a category"
		);
	});

	it("then for a real sandbox URL, if one is given at all", () => {
		expect(refusalOf({ ...filled, codeSandboxExample: "codesandbox" })).toBe(
			"Fix the CodeSandbox link"
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

	it("holds the reasons back until revealed, then hands each explained answer its reason by its mark", () => {
		const all = explainedAll(filled);
		const silent = all.answers.findIndex((answer) => !answer.right);
		const explained: PollFormState = {
			...all,
			answers: all.answers.map((answer, index) =>
				index === silent ? { ...answer, explanation: "" } : answer
			),
		};
		const rightId = String(rightsOf(explained)[0]);
		const picked = pickInPreview(UNPLAYED, explained, rightId);

		expect(
			previewOf(explained).options.some((option) => "explanation" in option)
		).toBe(false);
		const revealed = previewOf(explained, picked).options;
		expect(
			revealed.find((option) => option.id === rightId)?.explanation
		).toEqual({ text: "It is the one.", right: true });
		expect(revealed[silent]).not.toHaveProperty("explanation");
		expect(
			revealed.filter((option) => option.explanation?.right === false)
		).toHaveLength(2);
	});

	it("names a blank answer by its number so the row still shows", () => {
		expect(previewOf(EMPTY_POLL_FORM).options[1]?.label).toBe("answer 2");
	});

	it("marks the picks but reveals nothing before the answer is in", () => {
		const multiple = withAnswerType(filled, "multiple");
		const play = pickInPreview(UNPLAYED, multiple, "1");
		const preview = previewOf(multiple, play);

		expect(preview.pickedIds).toEqual(["1"]);
		expect(preview.options.every((option) => option.state === "idle")).toBe(
			true
		);
	});

	it("reveals the right answers and the wrong pick once revealed", () => {
		const rightId = String(rightsOf(filled)[0]);
		const wrongId = rightId === "0" ? "1" : "0";
		const preview = previewOf(filled, pickInPreview(UNPLAYED, filled, wrongId));

		expect(preview.options.find((option) => option.id === rightId)?.state).toBe(
			"right"
		);
		expect(preview.options.find((option) => option.id === wrongId)?.state).toBe(
			"wrong"
		);
		expect(
			preview.options.filter((option) => option.state === "idle")
		).toHaveLength(2);
	});
});

describe("playing the preview", () => {
	it("reveals a single-answer poll on its one tap", () => {
		expect(pickInPreview(UNPLAYED, filled, "2")).toEqual({
			pickedIds: ["2"],
			revealed: true,
		});
	});

	it("toggles picks on a multi-answer poll until it is locked in", () => {
		const multiple = withAnswerType(filled, "multiple");
		const play = pickInPreview(
			pickInPreview(pickInPreview(UNPLAYED, multiple, "0"), multiple, "2"),
			multiple,
			"0"
		);

		expect(play).toEqual({ pickedIds: ["2"], revealed: false });
		expect(lockInPreview(play)).toEqual({ pickedIds: ["2"], revealed: true });
	});

	it("offers a lock-in only on a picked, unrevealed multi-answer poll", () => {
		const multiple = withAnswerType(filled, "multiple");
		const picked = pickInPreview(UNPLAYED, multiple, "1");

		expect(canLockIn(multiple, UNPLAYED)).toBe(false);
		expect(canLockIn(multiple, picked)).toBe(true);
		expect(canLockIn(multiple, lockInPreview(picked))).toBe(false);
		expect(canLockIn(filled, picked)).toBe(false);
	});

	it("locks in nothing without a pick", () => {
		expect(lockInPreview(UNPLAYED)).toBe(UNPLAYED);
	});

	it("ignores a pick once revealed", () => {
		const revealed = pickInPreview(UNPLAYED, filled, "2");

		expect(pickInPreview(revealed, filled, "0")).toBe(revealed);
	});
});

describe("previewCategoryOf", () => {
	it("names the picked category, and nothing before one is picked", () => {
		expect(previewCategoryOf(filled)).toBe("CSS");
		expect(previewCategoryOf(EMPTY_POLL_FORM)).toBeUndefined();
	});
});

describe("submissionOf", () => {
	it("has nothing to send while a rule is unmet", () => {
		expect(submissionOf(EMPTY_POLL_FORM)).toBeUndefined();
		expect(
			submissionOf({ ...filled, categoryCode: undefined })
		).toBeUndefined();
	});

	it("sends blanks as null, keeps option ids, and never mentions a code block", () => {
		const state: PollFormState = {
			...filled,
			answers: filled.answers.map((answer) => ({
				...answer,
				id: answer.key + 10,
			})),
		};
		const data = submissionOf(state);

		expect(data?.poll.categoryCode).toBe("css");
		expect(data?.poll.codeSandboxExample).toBeNull();
		expect(data?.poll.explanation).toBeNull();
		expect(data?.poll).not.toHaveProperty("codeBlock");
		expect(data?.options[0]).toEqual({
			id: 10,
			option: quiz.options[0],
			correct: quiz.options[0] === quiz.correctAnswer,
			explanation: null,
		});
	});

	it("sends an answer's reason with its option, blank as null", () => {
		const data = submissionOf(
			changeAnswerExplanation(filled, 2, "Because the basis drops.")
		);

		expect(data?.options.map((option) => option.explanation)).toEqual([
			null,
			null,
			"Because the basis drops.",
			null,
		]);
	});

	it("leaves an id off a new option", () => {
		expect(submissionOf(filled)?.options[0]).not.toHaveProperty("id");
	});
});

describe("suggestFormFor", () => {
	it("opens an empty form on the category the advertisement named", () => {
		expect(suggestFormFor("vue")).toEqual({
			...EMPTY_POLL_FORM,
			categoryCode: "vue",
		});
	});

	it("opens with no category picked when none was named", () => {
		expect(suggestFormFor(undefined)).toEqual(EMPTY_POLL_FORM);
	});
});

describe("rewardOf", () => {
	const bounties = [
		{ code: "vue", published: 3, bountyKb: 48 },
		{ code: "css", published: 400, bountyKb: 16 },
	] as const;

	it("states the bounty the picked category pays", () => {
		expect(rewardOf({ categoryCode: "vue" }, bounties)).toBe("+48 KB");
	});

	it("states the base reward before a category is picked", () => {
		expect(rewardOf({ categoryCode: undefined }, bounties)).toBe("+16 KB");
	});

	it("states the base reward while the bounties are still loading", () => {
		expect(rewardOf({ categoryCode: "vue" }, [])).toBe("+16 KB");
	});
});

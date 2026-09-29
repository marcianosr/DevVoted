import { CODE_SANDBOX_URL } from "~/modules/polls/authoring/application/poll.validation";
import {
	POLL_LIMITS,
	POLL_STATUSES,
	isPollStatus,
	type AnswerType,
	type Poll,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import {
	getCategories,
	isCategoryCode,
	type CategoryCode,
} from "~/shared/lib/categories";
import { OF } from "~/shared/lib/copy";
import { letterAt } from "~/shared/lib/letters";
import type { QuestionProps } from "~/ui/kanto-theme/Question.ui";
import type { SelectOption } from "~/ui/kanto-theme/Select.ui";

const SEPARATOR = " · ";

const COPY = {
	questionCount: (length: number, max: number, min: number) =>
		`${length} / ${max}${SEPARATOR}min ${min}`,
	answersCount: (count: number, max: number, min: number) =>
		`${count} ${OF} ${max} answers${SEPARATOR}at least ${min}`,
	answerPlaceholder: (index: number) => `answer ${index + 1}`,
	needsQuestion: (min: number) => `question needs ${min} characters`,
	needsAnswerText: "every answer needs text",
	needsAnswers: (min: number) => `needs ${min} answers`,
	needsOneRight: "mark one answer right",
	needsARight: "mark at least one answer right",
	needsUrl: "CodeSandbox needs a full URL",
} as const;

export type PollFormMode = "suggest" | "edit";
export type PollFormView = "write" | "preview";

export type PollFormAnswer = {
	key: number;
	id?: number;
	text: string;
	right: boolean;
};

export type PollFormState = {
	question: string;
	answerType: AnswerType;
	categoryCode: CategoryCode;
	status: PollStatus;
	codeSandboxExample: string;
	explanation: string;
	answers: readonly PollFormAnswer[];
};

const blankAnswer = (key: number): PollFormAnswer => ({
	key,
	text: "",
	right: false,
});

export const EMPTY_POLL_FORM: PollFormState = {
	question: "",
	answerType: "single",
	categoryCode: "js",
	status: "draft",
	codeSandboxExample: "",
	explanation: "",
	answers: Array.from({ length: POLL_LIMITS.answers.min }, (_, key) =>
		blankAnswer(key)
	),
};

export const pollFormStateOf = (
	poll: Poll,
	options: readonly PollOption[]
): PollFormState => ({
	question: poll.question,
	answerType: poll.answerType,
	categoryCode: poll.categoryCode,
	status: poll.status,
	codeSandboxExample: poll.codeSandboxExample ?? "",
	explanation: poll.explanation ?? "",
	answers: options.map((option, key) => ({
		key,
		id: option.id,
		text: option.option,
		right: option.correct,
	})),
});

export const canAddAnswer = (state: PollFormState): boolean =>
	state.answers.length < POLL_LIMITS.answers.max;

export const canRemoveAnswer = (state: PollFormState): boolean =>
	state.answers.length > POLL_LIMITS.answers.min;

const nextKeyOf = (answers: readonly PollFormAnswer[]): number =>
	Math.max(-1, ...answers.map((answer) => answer.key)) + 1;

export const addAnswer = (state: PollFormState): PollFormState =>
	canAddAnswer(state)
		? {
				...state,
				answers: [...state.answers, blankAnswer(nextKeyOf(state.answers))],
			}
		: state;

export const removeAnswer = (
	state: PollFormState,
	key: number
): PollFormState =>
	canRemoveAnswer(state)
		? {
				...state,
				answers: state.answers.filter((answer) => answer.key !== key),
			}
		: state;

export const changeAnswer = (
	state: PollFormState,
	key: number,
	text: string
): PollFormState => ({
	...state,
	answers: state.answers.map((answer) =>
		answer.key === key ? { ...answer, text } : answer
	),
});

const asTheOneRight = (
	answer: PollFormAnswer,
	key: number
): PollFormAnswer => ({
	...answer,
	right: answer.key === key,
});

const toggledRight = (answer: PollFormAnswer, key: number): PollFormAnswer =>
	answer.key === key ? { ...answer, right: !answer.right } : answer;

export const markRight = (
	state: PollFormState,
	key: number
): PollFormState => ({
	...state,
	answers: state.answers.map((answer) =>
		state.answerType === "single"
			? asTheOneRight(answer, key)
			: toggledRight(answer, key)
	),
});

export const withAnswerType = (
	state: PollFormState,
	answerType: AnswerType
): PollFormState => {
	if (answerType === "multiple") return { ...state, answerType };
	const first = state.answers.find((answer) => answer.right);
	return {
		...state,
		answerType,
		answers: state.answers.map((answer) =>
			asTheOneRight(answer, first?.key ?? -1)
		),
	};
};

export const withCategory = (
	state: PollFormState,
	value: string
): PollFormState =>
	isCategoryCode(value) ? { ...state, categoryCode: value } : state;

export const withStatus = (
	state: PollFormState,
	value: string
): PollFormState => (isPollStatus(value) ? { ...state, status: value } : state);

export type AnswerRow = {
	key: number;
	letter: string;
	text: string;
	right: boolean;
};

export const answerRowsOf = (state: PollFormState): readonly AnswerRow[] =>
	state.answers.map((answer, index) => ({
		key: answer.key,
		letter: letterAt(index),
		text: answer.text,
		right: answer.right,
	}));

export const questionCountOf = (question: string): string =>
	COPY.questionCount(
		question.length,
		POLL_LIMITS.question.max,
		POLL_LIMITS.question.min
	);

export const answersCountOf = (answers: readonly PollFormAnswer[]): string =>
	COPY.answersCount(
		answers.length,
		POLL_LIMITS.answers.max,
		POLL_LIMITS.answers.min
	);

const hasText = (answer: PollFormAnswer): boolean => answer.text.trim() !== "";

const isSandboxUrl = (value: string): boolean =>
	value === "" || CODE_SANDBOX_URL.safeParse(value).success;

export const refusalOf = (state: PollFormState): string | undefined => {
	if (state.question.length < POLL_LIMITS.question.min)
		return COPY.needsQuestion(POLL_LIMITS.question.min);
	if (!state.answers.every(hasText)) return COPY.needsAnswerText;
	if (state.answers.length < POLL_LIMITS.answers.min)
		return COPY.needsAnswers(POLL_LIMITS.answers.min);
	if (!state.answers.some((answer) => answer.right))
		return state.answerType === "single"
			? COPY.needsOneRight
			: COPY.needsARight;
	if (!isSandboxUrl(state.codeSandboxExample)) return COPY.needsUrl;
	return undefined;
};

export const previewOf = (state: PollFormState): QuestionProps => ({
	answerType: state.answerType,
	question: state.question,
	options: state.answers.map((answer, index) => ({
		id: String(answer.key),
		letter: letterAt(index),
		label: answer.text === "" ? COPY.answerPlaceholder(index) : answer.text,
	})),
});

export const CATEGORY_CHOICES: readonly SelectOption[] = getCategories().map(
	(category) => ({ value: category.code, label: category.name })
);

export const STATUS_CHOICES: readonly SelectOption[] = POLL_STATUSES.map(
	(status) => ({ value: status, label: status })
);

export type PollFormData = {
	poll: {
		question: string;
		status: PollStatus;
		answerType: AnswerType;
		categoryCode: CategoryCode;
		codeSandboxExample: string | null;
		explanation: string | null;
	};
	options: { id?: number; option: string; correct: boolean }[];
};

const orNull = (value: string): string | null =>
	value.trim() === "" ? null : value;

export const toPollFormData = (state: PollFormState): PollFormData => ({
	poll: {
		question: state.question,
		status: state.status,
		answerType: state.answerType,
		categoryCode: state.categoryCode,
		codeSandboxExample: orNull(state.codeSandboxExample),
		explanation: orNull(state.explanation),
	},
	options: state.answers.map((answer) => ({
		...(answer.id === undefined ? {} : { id: answer.id }),
		option: answer.text,
		correct: answer.right,
	})),
});

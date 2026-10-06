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
import {
	GRID_GROUP_SIZE,
	GRID_GROUPS,
	GRID_TILES,
} from "~/shared/lib/answerTypes";
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
	gridCount: "three groups of four tiles",
	needsGroupNames: "every group needs a name",
	needsTileText: "every tile needs text",
	needsUniqueTiles: "each tile appears once",
	groupPlaceholder: (group: number) => `group ${group + 1}`,
	tilePlaceholder: (index: number) => `tile ${index + 1}`,
} as const;

export type PollFormMode = "suggest" | "edit";
export type PollFormView = "write" | "preview";

export type PollFormAnswer = {
	key: number;
	id?: number;
	text: string;
	right: boolean;
	group?: number;
};

export type PollFormState = {
	question: string;
	answerType: AnswerType;
	categoryCode: CategoryCode;
	status: PollStatus;
	codeSandboxExample: string;
	explanation: string;
	answers: readonly PollFormAnswer[];
	groupLabels: readonly string[];
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
	groupLabels: [],
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
		...(option.group === null ? {} : { group: option.group }),
	})),
	groupLabels: poll.groupLabels ?? [],
});

const isGrid = (state: PollFormState): boolean => state.answerType === "grid";

export const canAddAnswer = (state: PollFormState): boolean =>
	!isGrid(state) && state.answers.length < POLL_LIMITS.answers.max;

export const canRemoveAnswer = (state: PollFormState): boolean =>
	!isGrid(state) && state.answers.length > POLL_LIMITS.answers.min;

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

const asGridTiles = (
	answers: readonly PollFormAnswer[]
): readonly PollFormAnswer[] => {
	const kept = answers.slice(0, GRID_TILES);
	const padded = [
		...kept,
		...Array.from({ length: GRID_TILES - kept.length }, (_, index) =>
			blankAnswer(nextKeyOf(kept) + index)
		),
	];
	return padded.map((answer, index) => ({
		...answer,
		right: true,
		group: Math.floor(index / GRID_GROUP_SIZE),
	}));
};

const withoutGroup = ({
	group: _,
	...answer
}: PollFormAnswer): PollFormAnswer => answer;

const toGrid = (state: PollFormState): PollFormState => ({
	...state,
	answerType: "grid",
	answers: asGridTiles(state.answers),
	groupLabels: Array.from(
		{ length: GRID_GROUPS },
		(_, group) => state.groupLabels[group] ?? ""
	),
});

const leftGrid = (state: PollFormState): PollFormState =>
	isGrid(state)
		? {
				...state,
				groupLabels: [],
				answers: state.answers.map((answer) => ({
					...withoutGroup(answer),
					right: false,
				})),
			}
		: state;

export const withAnswerType = (
	state: PollFormState,
	answerType: AnswerType
): PollFormState => {
	if (answerType === "grid") return toGrid(state);
	const ungrouped = leftGrid(state);
	if (answerType === "multiple") return { ...ungrouped, answerType };
	const first = ungrouped.answers.find((answer) => answer.right);
	return {
		...ungrouped,
		answerType,
		answers: ungrouped.answers.map((answer) =>
			asTheOneRight(answer, first?.key ?? -1)
		),
	};
};

export const changeGroupLabel = (
	state: PollFormState,
	group: number,
	label: string
): PollFormState => ({
	...state,
	groupLabels: state.groupLabels.map((current, index) =>
		index === group ? label : current
	),
});

export type GridGroupRow = {
	group: number;
	label: string;
	placeholder: string;
	tiles: readonly AnswerRow[];
};

export const gridGroupRowsOf = (
	state: PollFormState
): readonly GridGroupRow[] =>
	state.groupLabels.map((label, group) => ({
		group,
		label,
		placeholder: COPY.groupPlaceholder(group),
		tiles: answerRowsOf(state).filter(
			(_, index) => state.answers[index]?.group === group
		),
	}));

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

export const answersCaptionOf = (state: PollFormState): string =>
	isGrid(state) ? COPY.gridCount : answersCountOf(state.answers);

const hasText = (answer: PollFormAnswer): boolean => answer.text.trim() !== "";

const isSandboxUrl = (value: string): boolean =>
	value === "" || CODE_SANDBOX_URL.safeParse(value).success;

const hasDuplicateTiles = (answers: readonly PollFormAnswer[]): boolean => {
	const tiles = answers.map((answer) => answer.text.trim().toLowerCase());
	return new Set(tiles).size !== tiles.length;
};

const gridRefusalOf = (state: PollFormState): string | undefined => {
	if (!state.groupLabels.every((label) => label.trim() !== ""))
		return COPY.needsGroupNames;
	if (!state.answers.every(hasText)) return COPY.needsTileText;
	if (hasDuplicateTiles(state.answers)) return COPY.needsUniqueTiles;
	if (!isSandboxUrl(state.codeSandboxExample)) return COPY.needsUrl;
	return undefined;
};

export const refusalOf = (state: PollFormState): string | undefined => {
	if (state.question.length < POLL_LIMITS.question.min)
		return COPY.needsQuestion(POLL_LIMITS.question.min);
	if (isGrid(state)) return gridRefusalOf(state);
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

const placeholderFor = (state: PollFormState, index: number): string =>
	isGrid(state) ? COPY.tilePlaceholder(index) : COPY.answerPlaceholder(index);

export const previewOf = (state: PollFormState): QuestionProps => ({
	answerType: state.answerType,
	question: state.question,
	options: state.answers.map((answer, index) => ({
		id: String(answer.key),
		letter: letterAt(index),
		label: answer.text === "" ? placeholderFor(state, index) : answer.text,
	})),
	...(isGrid(state)
		? {
				grid: {
					groups: [],
					hints: state.groupLabels.map((label, group) =>
						label === "" ? COPY.groupPlaceholder(group) : label
					),
				},
			}
		: {}),
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
		groupLabels: string[] | null;
	};
	options: {
		id?: number;
		option: string;
		correct: boolean;
		group?: number;
	}[];
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
		groupLabels: isGrid(state) ? [...state.groupLabels] : null,
	},
	options: state.answers.map((answer) => ({
		...(answer.id === undefined ? {} : { id: answer.id }),
		option: answer.text,
		correct: answer.right,
		...(answer.group === undefined ? {} : { group: answer.group }),
	})),
});

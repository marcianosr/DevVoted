import { CODE_SANDBOX_URL } from "~/modules/polls/authoring/application/poll.validation";
import {
	APPROVED_POLL_ARCHIVE_KB,
	POLL_LIMITS,
	POLL_STATUSES,
	isPollStatus,
	type AnswerType,
	type Poll,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import type { CategoryBounty } from "~/modules/polls/poll/domain/pollBounty.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import {
	getCategories,
	getCategoryMetadata,
	isCategoryCode,
	type CategoryCode,
} from "~/shared/lib/categories";
import { PAIR_SIZE, PAIR_TILES } from "~/shared/lib/answerTypes";
import { letterAt } from "~/shared/lib/letters";
import { signedKbLabel } from "~/shared/lib/storage";
import type { ChoiceState } from "~/ui/kanto-theme/Choice.ui";
import type {
	QuestionOption,
	QuestionPairs,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";
import type { PairTile } from "~/ui/kanto-theme/MatchingPairs.ui";
import type { SelectOption } from "~/ui/kanto-theme/Select.ui";

const COPY = {
	questionCount: (length: number, max: number) => `${length} / ${max}`,
	answerPlaceholder: (index: number) => `answer ${index + 1}`,
	needsQuestion: "Write the question",
	needsAnswerText: "Fill every answer",
	needsAnswers: (min: number) => `Add ${min} answers`,
	needsOneRight: "Mark the right answer",
	needsARight: "Mark the right answers",
	needsCategory: "Pick a category",
	needsUrl: "Fix the CodeSandbox link",
	needsTileText: "Fill every tile",
	needsUniqueTiles: "Use each tile once",
	tilePlaceholder: (index: number) => `tile ${index + 1}`,
} as const;

const INLINE_CODE = "`code`";
const CODE_BLOCK = "```js\n\n```";

export type PollFormMode = "suggest" | "edit";
export type PollFormView = "write" | "preview";

export type PollFormAnswer = {
	key: number;
	id?: number;
	text: string;
	right: boolean;
	group?: number;
	explanation: string;
};

export type PollFormState = {
	question: string;
	answerType: AnswerType;
	categoryCode: CategoryCode | undefined;
	status: PollStatus;
	codeSandboxExample: string;
	explanation: string;
	answers: readonly PollFormAnswer[];
};

const blankAnswer = (key: number): PollFormAnswer => ({
	key,
	text: "",
	right: false,
	explanation: "",
});

export const EMPTY_POLL_FORM: PollFormState = {
	question: "",
	answerType: "single",
	categoryCode: undefined,
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
		...(option.group === null ? {} : { group: option.group }),
		explanation: option.explanation ?? "",
	})),
});

const isPairs = (state: PollFormState): boolean => state.answerType === "pairs";

export const canAddAnswer = (state: PollFormState): boolean =>
	!isPairs(state) && state.answers.length < POLL_LIMITS.answers.max;

export const canRemoveAnswer = (state: PollFormState): boolean =>
	!isPairs(state) && state.answers.length > POLL_LIMITS.answers.min;

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

export const changeAnswerExplanation = (
	state: PollFormState,
	key: number,
	explanation: string
): PollFormState => ({
	...state,
	answers: state.answers.map((answer) =>
		answer.key === key ? { ...answer, explanation } : answer
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

const asPairTiles = (
	answers: readonly PollFormAnswer[]
): readonly PollFormAnswer[] => {
	const kept = answers.slice(0, PAIR_TILES);
	const padded = [
		...kept,
		...Array.from({ length: PAIR_TILES - kept.length }, (_, index) =>
			blankAnswer(nextKeyOf(kept) + index)
		),
	];
	return padded.map((answer, index) => ({
		...answer,
		right: true,
		group: Math.floor(index / PAIR_SIZE),
	}));
};

const withoutGroup = ({
	group: _,
	...answer
}: PollFormAnswer): PollFormAnswer => answer;

const toPairs = (state: PollFormState): PollFormState => ({
	...state,
	answerType: "pairs",
	answers: asPairTiles(state.answers),
});

const leftPairs = (state: PollFormState): PollFormState =>
	isPairs(state)
		? {
				...state,
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
	if (answerType === "pairs") return toPairs(state);
	const ungrouped = leftPairs(state);
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

export type PairRow = {
	pair: number;
	left: AnswerRow;
	right: AnswerRow;
};

const pairRowOf = (
	pair: number,
	[left, right]: readonly AnswerRow[]
): PairRow | readonly [] =>
	left === undefined || right === undefined ? [] : { pair, left, right };

export const pairRowsOf = (state: PollFormState): readonly PairRow[] => {
	const rows = answerRowsOf(state);
	const pairs = [
		...new Set(state.answers.flatMap((answer) => answer.group ?? [])),
	];
	return pairs.flatMap((pair) =>
		pairRowOf(
			pair,
			rows.filter((_, index) => state.answers[index]?.group === pair)
		)
	);
};

export const suggestFormFor = (
	category: CategoryCode | undefined
): PollFormState => ({ ...EMPTY_POLL_FORM, categoryCode: category });

export const rewardOf = (
	{ categoryCode }: Pick<PollFormState, "categoryCode">,
	bounties: readonly CategoryBounty[]
): string =>
	signedKbLabel(
		bounties.find(({ code }) => code === categoryCode)?.bountyKb ??
			APPROVED_POLL_ARCHIVE_KB
	);

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
	explanation: string;
};

export const answerRowsOf = (state: PollFormState): readonly AnswerRow[] =>
	state.answers.map((answer, index) => ({
		key: answer.key,
		letter: letterAt(index),
		text: answer.text,
		right: answer.right,
		explanation: answer.explanation,
	}));

export const questionCountOf = (question: string): string =>
	COPY.questionCount(question.length, POLL_LIMITS.question.max);

const withSnippet = (
	state: PollFormState,
	snippet: string,
	separator: string
): PollFormState => ({
	...state,
	question:
		state.question === "" ? snippet : `${state.question}${separator}${snippet}`,
});

export const withInlineCode = (state: PollFormState): PollFormState =>
	withSnippet(state, INLINE_CODE, " ");

export const withCodeBlock = (state: PollFormState): PollFormState =>
	withSnippet(state, CODE_BLOCK, "\n");

const hasText = (answer: PollFormAnswer): boolean => answer.text.trim() !== "";

const isQuestionLongEnough = (state: PollFormState): boolean =>
	state.question.length >= POLL_LIMITS.question.min;

const areAnswersWritten = (state: PollFormState): boolean =>
	state.answers.every(hasText) &&
	state.answers.length >= POLL_LIMITS.answers.min;

const hasARightAnswer = (state: PollFormState): boolean =>
	state.answers.some((answer) => answer.right);

const hasExplanation = (answer: PollFormAnswer): boolean =>
	answer.explanation.trim() !== "";

const everyRightAnswerExplained = (state: PollFormState): boolean =>
	hasARightAnswer(state) &&
	state.answers.filter((answer) => answer.right).every(hasExplanation);

const isExplained = (state: PollFormState): boolean =>
	state.explanation.trim() !== "" || everyRightAnswerExplained(state);

export type PollFormSteps = {
	question: boolean;
	answers: boolean;
	category: boolean;
	explanation: boolean;
};

const arePairsWritten = (state: PollFormState): boolean =>
	state.answers.every(hasText) && !hasDuplicateTiles(state.answers);

const areAnswersDone = (state: PollFormState): boolean =>
	isPairs(state)
		? arePairsWritten(state)
		: areAnswersWritten(state) && hasARightAnswer(state);

export const stepsDoneOf = (state: PollFormState): PollFormSteps => ({
	question: isQuestionLongEnough(state),
	answers: areAnswersDone(state),
	category: state.categoryCode !== undefined,
	explanation: isExplained(state),
});

const isSandboxUrl = (value: string): boolean =>
	value === "" || CODE_SANDBOX_URL.safeParse(value).success;

const hasDuplicateTiles = (answers: readonly PollFormAnswer[]): boolean => {
	const tiles = answers.map((answer) => answer.text.trim().toLowerCase());
	return new Set(tiles).size !== tiles.length;
};

const pairsRefusalOf = (state: PollFormState): string | undefined => {
	if (!state.answers.every(hasText)) return COPY.needsTileText;
	if (hasDuplicateTiles(state.answers)) return COPY.needsUniqueTiles;
	if (state.categoryCode === undefined) return COPY.needsCategory;
	if (!isSandboxUrl(state.codeSandboxExample)) return COPY.needsUrl;
	return undefined;
};

export const refusalOf = (state: PollFormState): string | undefined => {
	if (!isQuestionLongEnough(state)) return COPY.needsQuestion;
	if (isPairs(state)) return pairsRefusalOf(state);
	if (!state.answers.every(hasText)) return COPY.needsAnswerText;
	if (state.answers.length < POLL_LIMITS.answers.min)
		return COPY.needsAnswers(POLL_LIMITS.answers.min);
	if (!hasARightAnswer(state))
		return state.answerType === "single"
			? COPY.needsOneRight
			: COPY.needsARight;
	if (state.categoryCode === undefined) return COPY.needsCategory;
	if (!isSandboxUrl(state.codeSandboxExample)) return COPY.needsUrl;
	return undefined;
};

const placeholderFor = (state: PollFormState, index: number): string =>
	isPairs(state) ? COPY.tilePlaceholder(index) : COPY.answerPlaceholder(index);

export type PreviewPlay = {
	pickedIds: readonly string[];
	revealed: boolean;
};

export const UNPLAYED: PreviewPlay = { pickedIds: [], revealed: false };

const toggled = (ids: readonly string[], id: string): readonly string[] =>
	ids.includes(id) ? ids.filter((picked) => picked !== id) : [...ids, id];

export const pickInPreview = (
	play: PreviewPlay,
	state: PollFormState,
	id: string
): PreviewPlay => {
	if (play.revealed) return play;
	if (state.answerType === "single") return { pickedIds: [id], revealed: true };
	return { ...play, pickedIds: toggled(play.pickedIds, id) };
};

export const canLockIn = (state: PollFormState, play: PreviewPlay): boolean =>
	state.answerType === "multiple" &&
	!play.revealed &&
	play.pickedIds.length > 0;

export const lockInPreview = (play: PreviewPlay): PreviewPlay =>
	play.pickedIds.length === 0 ? play : { ...play, revealed: true };

const revealedStateOf = (
	answer: PollFormAnswer,
	play: PreviewPlay
): ChoiceState => {
	if (!play.revealed) return "idle";
	if (answer.right) return "right";
	return play.pickedIds.includes(String(answer.key)) ? "wrong" : "idle";
};

const revealedExplanationOf = (
	answer: PollFormAnswer,
	play: PreviewPlay
): QuestionOption["explanation"] =>
	play.revealed && hasExplanation(answer)
		? { text: answer.explanation, right: answer.right }
		: undefined;

const previewOptionOf = (
	state: PollFormState,
	answer: PollFormAnswer,
	index: number,
	play: PreviewPlay
): QuestionOption => {
	const explanation = revealedExplanationOf(answer, play);
	return {
		id: String(answer.key),
		letter: letterAt(index),
		label: answer.text === "" ? placeholderFor(state, index) : answer.text,
		state: revealedStateOf(answer, play),
		...(explanation === undefined ? {} : { explanation }),
	};
};

const previewTileOf = (row: AnswerRow, index: number): PairTile => ({
	id: String(row.key),
	label: row.text === "" ? COPY.tilePlaceholder(index) : row.text,
	state: "open",
});

const previewPairsOf = (state: PollFormState): QuestionPairs => {
	const rows = pairRowsOf(state);
	return {
		left: rows.map((row, index) => previewTileOf(row.left, index * PAIR_SIZE)),
		right: rows.map((row, index) =>
			previewTileOf(row.right, index * PAIR_SIZE + 1)
		),
	};
};

export const previewOf = (
	state: PollFormState,
	play: PreviewPlay = UNPLAYED
): QuestionProps => ({
	answerType: state.answerType,
	question: state.question,
	pickedIds: play.pickedIds,
	options: state.answers.map((answer, index) =>
		previewOptionOf(state, answer, index, play)
	),
	...(isPairs(state) ? { pairs: previewPairsOf(state) } : {}),
});

export const previewCategoryOf = (state: PollFormState): string | undefined =>
	state.categoryCode === undefined
		? undefined
		: getCategoryMetadata(state.categoryCode).name;

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
	options: {
		id?: number;
		option: string;
		correct: boolean;
		group?: number;
		explanation: string | null;
	}[];
};

const orNull = (value: string): string | null =>
	value.trim() === "" ? null : value;

export const submissionOf = (
	state: PollFormState
): PollFormData | undefined => {
	if (refusalOf(state) !== undefined || state.categoryCode === undefined)
		return undefined;
	return toPollFormData(state, state.categoryCode);
};

const toPollFormData = (
	state: PollFormState,
	categoryCode: CategoryCode
): PollFormData => ({
	poll: {
		question: state.question,
		status: state.status,
		answerType: state.answerType,
		categoryCode,
		codeSandboxExample: orNull(state.codeSandboxExample),
		explanation: orNull(state.explanation),
	},
	options: state.answers.map((answer) => ({
		...(answer.id === undefined ? {} : { id: answer.id }),
		option: answer.text,
		correct: answer.right,
		...(answer.group === undefined ? {} : { group: answer.group }),
		explanation: orNull(answer.explanation),
	})),
});

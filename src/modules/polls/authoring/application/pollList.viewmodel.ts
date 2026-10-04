import {
	APPROVED_POLL_ARCHIVE_KB,
	POLL_STATUSES,
	type AnswerType,
	type Poll,
	type PollCreator,
	type PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import {
	getCategories,
	getCategoryMetadata,
	type CategoryCode,
} from "~/shared/lib/categories";
import {
	hasCodeBlock,
	splitCodeBlocks,
	splitCodeSpans,
	stripCodeFence,
	type CodeSpan,
} from "~/shared/lib/codeSpans";
import { ANSWER_TYPE_LABEL } from "~/shared/lib/copy";
import { pollPathFor } from "~/shared/lib/pollPath";
import { signedKbLabel } from "~/shared/lib/storage";

const COPY = {
	everyStatus: "all",
	anyAnswerType: "any",
	everyCategory: "All",
	everyCreator: "all creators",
	code: "code",
} as const;

const SEPARATOR = " · ";

export const ALL = "all";
type All = typeof ALL;

export const PAGE_SIZE = 10;

export const APPROVED_POLL_REWARD = signedKbLabel(APPROVED_POLL_ARCHIVE_KB);

const ANSWER_TYPES = [
	"single",
	"multiple",
] as const satisfies readonly AnswerType[];

export type StatusFilter = PollStatus | All;
export type AnswerTypeFilter = AnswerType | All;
export type CategoryFilter = CategoryCode | All;

export type PollListFilter = {
	search: string;
	status: StatusFilter;
	answerType: AnswerTypeFilter;
	withCode: boolean;
	category: CategoryFilter;
	creator: string;
};

export const EMPTY_FILTER: PollListFilter = {
	search: "",
	status: ALL,
	answerType: ALL,
	withCode: false,
	category: ALL,
	creator: ALL,
};

export type Choice<Value extends string> = {
	value: Value;
	label: string;
	count: number;
};

export type CreatorChoice = { value: string; label: string };

export type PollListChoices = {
	status: readonly Choice<StatusFilter>[];
	answerType: readonly Choice<AnswerTypeFilter>[];
	category: readonly Choice<CategoryFilter>[];
	creator?: readonly CreatorChoice[];
	withCode: number;
};

export const hasCode = (poll: Poll): boolean =>
	poll.codeBlock !== null ||
	poll.codeSandboxExample !== null ||
	hasCodeBlock(poll.question);

const matchesSearch = (poll: Poll, search: string): boolean => {
	const needle = search.trim().toLowerCase();
	return needle === "" || poll.question.toLowerCase().includes(needle);
};

const matches = (poll: Poll, filter: PollListFilter): boolean =>
	matchesSearch(poll, filter.search) &&
	(filter.status === ALL || poll.status === filter.status) &&
	(filter.answerType === ALL || poll.answerType === filter.answerType) &&
	(!filter.withCode || hasCode(poll)) &&
	(filter.category === ALL || poll.categoryCode === filter.category) &&
	(filter.creator === ALL || poll.createdBy === filter.creator);

export const visiblePollsOf = (
	polls: readonly Poll[],
	filter: PollListFilter
): Poll[] => polls.filter((poll) => matches(poll, filter));

const countedChoicesOf = <Value extends string>(
	polls: readonly Poll[],
	everyLabel: string,
	values: readonly Value[],
	labelOf: (value: Value) => string,
	valueOf: (poll: Poll) => string
): Choice<Value | All>[] => [
	{ value: ALL, label: everyLabel, count: polls.length },
	...values.map((value) => ({
		value,
		label: labelOf(value),
		count: polls.filter((poll) => valueOf(poll) === value).length,
	})),
];

const creatorChoicesOf = (
	creators: readonly PollCreator[]
): readonly CreatorChoice[] => [
	{ value: ALL, label: COPY.everyCreator },
	...creators.map((creator) => ({
		value: creator.id,
		label: creator.displayName,
	})),
];

export const pollListChoicesOf = (
	polls: readonly Poll[],
	filter: PollListFilter,
	creators?: readonly PollCreator[]
): PollListChoices => ({
	status: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, status: ALL }),
		COPY.everyStatus,
		POLL_STATUSES,
		(status) => status,
		(poll) => poll.status
	),
	answerType: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, answerType: ALL }),
		COPY.anyAnswerType,
		ANSWER_TYPES,
		(answerType) => answerType,
		(poll) => poll.answerType
	),
	category: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, category: ALL }),
		COPY.everyCategory,
		getCategories().map((category) => category.code),
		(code) => getCategoryMetadata(code).name,
		(poll) => poll.categoryCode
	),
	withCode: visiblePollsOf(polls, { ...filter, withCode: false }).filter(
		hasCode
	).length,
	...(creators === undefined ? {} : { creator: creatorChoicesOf(creators) }),
});

export type QuestionSegment = CodeSpan;

const proseOf = (question: string): string =>
	splitCodeBlocks(question)
		.flatMap((part) => (part.kind === "prose" ? [part.text] : []))
		.join(" ");

export const questionSegmentsOf = (
	question: string
): readonly QuestionSegment[] =>
	splitCodeSpans(proseOf(question)).map((span) =>
		span.kind === "code"
			? { kind: "code", text: stripCodeFence(span.text) }
			: span
	);

export const pollFactsOf = (poll: Poll): string =>
	hasCode(poll)
		? `${ANSWER_TYPE_LABEL[poll.answerType]}${SEPARATOR}${COPY.code}`
		: ANSWER_TYPE_LABEL[poll.answerType];

export type PollAuthor = { name: string; photoUrl?: string };

export type PollRow = {
	id: number;
	href: string;
	number: number;
	category: string;
	question: readonly QuestionSegment[];
	facts: string;
	author?: PollAuthor;
	status: PollStatus;
};

const authorOf = (creator: PollCreator | undefined): PollAuthor | undefined =>
	creator === undefined
		? undefined
		: {
				name: creator.displayName,
				...(creator.photoUrl === null ? {} : { photoUrl: creator.photoUrl }),
			};

export const pollRowsOf = (
	polls: readonly Poll[],
	creators?: readonly PollCreator[]
): PollRow[] => {
	const creatorById = new Map(
		(creators ?? []).map((creator) => [creator.id, creator])
	);
	return polls.map((poll) => {
		const author = authorOf(creatorById.get(poll.createdBy));
		return {
			id: poll.id,
			href: pollPathFor(poll.id),
			number: poll.pollNumber ?? poll.id,
			category: getCategoryMetadata(poll.categoryCode).name,
			question: questionSegmentsOf(poll.question),
			facts: pollFactsOf(poll),
			...(author === undefined ? {} : { author }),
			status: poll.status,
		};
	});
};

export type PollWindow = {
	rows: readonly PollRow[];
	shown: number;
	total: number;
	more: boolean;
};

export const windowOf = (
	rows: readonly PollRow[],
	shown: number
): PollWindow => {
	const visible = Math.min(shown, rows.length);
	return {
		rows: rows.slice(0, visible),
		shown: visible,
		total: rows.length,
		more: visible < rows.length,
	};
};

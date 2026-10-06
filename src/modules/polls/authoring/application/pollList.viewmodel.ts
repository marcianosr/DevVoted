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
import { ANSWER_TYPES } from "~/shared/lib/answerTypes";
import { ANSWER_TYPE_LABEL } from "~/shared/lib/copy";
import { pollPathFor } from "~/shared/lib/pollPath";
import { signedKbLabel } from "~/shared/lib/storage";

const COPY = {
	everyStatus: "all",
	anyAnswerType: "any",
	everyCategory: "All",
	everyCreator: "all creators",
	anyDeal: "any",
	code: "code",
	dealtTimes: (times: number) => `dealt ${times}×`,
	dealtFilter: (label: string) => `dealt ${label}`,
	searched: (search: string) => `“${search}”`,
	withCode: "with code",
	withExplanation: "with explanation",
} as const;

const DEAL_LABEL = {
	never: "never",
	once: "once",
	often: "2+ times",
} as const;

const SEPARATOR = " · ";

export const ALL = "all";
type All = typeof ALL;

export const PAGE_SIZE = 10;

export const APPROVED_POLL_REWARD = signedKbLabel(APPROVED_POLL_ARCHIVE_KB);

export type StatusFilter = PollStatus | All;
export type AnswerTypeFilter = AnswerType | All;
export type CategoryFilter = CategoryCode | All;
export type DealtTimes = keyof typeof DEAL_LABEL;
export type DealtFilter = DealtTimes | All;

const DEALT_TIMES = [
	"never",
	"once",
	"often",
] as const satisfies readonly DealtTimes[];

export type PollDeals = ReadonlyMap<number, number>;
const NO_DEALS: PollDeals = new Map();

export type PollListFilter = {
	search: string;
	status: StatusFilter;
	answerType: AnswerTypeFilter;
	withCode: boolean;
	withExplanation: boolean;
	dealt: DealtFilter;
	category: CategoryFilter;
	creator: string;
};

export const EMPTY_FILTER: PollListFilter = {
	search: "",
	status: ALL,
	answerType: ALL,
	withCode: false,
	withExplanation: false,
	dealt: ALL,
	category: ALL,
	creator: ALL,
};

export type Choice<Value extends string> = {
	value: Value;
	label: string;
	count: number;
};

export const pickedOf = <Value extends string>(
	choices: readonly Choice<Value>[],
	raw: string,
	fallback: Value
): Value => choices.find((choice) => choice.value === raw)?.value ?? fallback;

export type CreatorChoice = { value: string; label: string };

export type PollListChoices = {
	status: readonly Choice<StatusFilter>[];
	answerType: readonly Choice<AnswerTypeFilter>[];
	category: readonly Choice<CategoryFilter>[];
	creator?: readonly CreatorChoice[];
	withCode: number;
	withExplanation: number;
	dealt: readonly Choice<DealtFilter>[];
};

export const hasCode = (poll: Poll): boolean =>
	poll.codeBlock !== null ||
	poll.codeSandboxExample !== null ||
	hasCodeBlock(poll.question);

export const hasExplanation = (poll: Poll): boolean =>
	(poll.explanation ?? "").trim() !== "";

const timesDealtOf = (poll: Poll, deals: PollDeals): number =>
	deals.get(poll.id) ?? 0;

const dealtTimesOf = (times: number): DealtTimes => {
	if (times === 0) return "never";
	return times === 1 ? "once" : "often";
};

const matchesSearch = (poll: Poll, search: string): boolean => {
	const needle = search.trim().toLowerCase();
	return needle === "" || poll.question.toLowerCase().includes(needle);
};

const matches = (
	poll: Poll,
	filter: PollListFilter,
	deals: PollDeals
): boolean =>
	matchesSearch(poll, filter.search) &&
	(!filter.withExplanation || hasExplanation(poll)) &&
	(filter.dealt === ALL ||
		dealtTimesOf(timesDealtOf(poll, deals)) === filter.dealt) &&
	(filter.status === ALL || poll.status === filter.status) &&
	(filter.answerType === ALL || poll.answerType === filter.answerType) &&
	(!filter.withCode || hasCode(poll)) &&
	(filter.category === ALL || poll.categoryCode === filter.category) &&
	(filter.creator === ALL || poll.createdBy === filter.creator);

export const visiblePollsOf = (
	polls: readonly Poll[],
	filter: PollListFilter,
	deals: PollDeals = NO_DEALS
): Poll[] => polls.filter((poll) => matches(poll, filter, deals));

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
	creators?: readonly PollCreator[],
	deals: PollDeals = NO_DEALS
): PollListChoices => ({
	status: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, status: ALL }, deals),
		COPY.everyStatus,
		POLL_STATUSES,
		(status) => status,
		(poll) => poll.status
	),
	answerType: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, answerType: ALL }, deals),
		COPY.anyAnswerType,
		ANSWER_TYPES,
		(answerType) => answerType,
		(poll) => poll.answerType
	),
	category: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, category: ALL }, deals),
		COPY.everyCategory,
		getCategories().map((category) => category.code),
		(code) => getCategoryMetadata(code).name,
		(poll) => poll.categoryCode
	),
	withCode: visiblePollsOf(polls, { ...filter, withCode: false }, deals).filter(
		hasCode
	).length,
	withExplanation: visiblePollsOf(
		polls,
		{ ...filter, withExplanation: false },
		deals
	).filter(hasExplanation).length,
	dealt: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, dealt: ALL }, deals),
		COPY.anyDeal,
		DEALT_TIMES,
		(times) => DEAL_LABEL[times],
		(poll) => dealtTimesOf(timesDealtOf(poll, deals))
	),
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

export const pollFactsOf = (poll: Poll, timesDealt = 0): string =>
	[
		ANSWER_TYPE_LABEL[poll.answerType],
		...(hasCode(poll) ? [COPY.code] : []),
		...(timesDealt === 0 ? [] : [COPY.dealtTimes(timesDealt)]),
	].join(SEPARATOR);

export type FilterKey = keyof PollListFilter;

export type ActiveFilter = { key: FilterKey; label: string };

const labelOfChoice = <Value extends string>(
	choices: readonly { value: Value; label: string }[] | undefined,
	value: Value
): string => choices?.find((choice) => choice.value === value)?.label ?? value;

export const activeFiltersOf = (
	filter: PollListFilter,
	choices: PollListChoices
): readonly ActiveFilter[] => {
	const search = filter.search.trim();
	const candidates: readonly (ActiveFilter | false)[] = [
		search !== "" && { key: "search", label: COPY.searched(search) },
		filter.status !== ALL && {
			key: "status",
			label: labelOfChoice(choices.status, filter.status),
		},
		filter.answerType !== ALL && {
			key: "answerType",
			label: labelOfChoice(choices.answerType, filter.answerType),
		},
		filter.dealt !== ALL && {
			key: "dealt",
			label: COPY.dealtFilter(labelOfChoice(choices.dealt, filter.dealt)),
		},
		filter.withCode && { key: "withCode", label: COPY.withCode },
		filter.withExplanation && {
			key: "withExplanation",
			label: COPY.withExplanation,
		},
		filter.category !== ALL && {
			key: "category",
			label: labelOfChoice(choices.category, filter.category),
		},
		filter.creator !== ALL && {
			key: "creator",
			label: labelOfChoice(choices.creator, filter.creator),
		},
	];
	return candidates.filter((candidate) => candidate !== false);
};

export const withoutFilter = (
	filter: PollListFilter,
	key: FilterKey
): PollListFilter => ({ ...filter, [key]: EMPTY_FILTER[key] });

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
	creators?: readonly PollCreator[],
	deals: PollDeals = NO_DEALS
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
			facts: pollFactsOf(poll, timesDealtOf(poll, deals)),
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

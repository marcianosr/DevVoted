import { format } from "date-fns";

import {
	APPROVED_POLL_ARCHIVE_KB,
	POLL_STATUSES,
	REVIEW_STATES,
	reviewStateOf,
	type AnswerType,
	type Poll,
	type PollCreator,
	type PollStatus,
	type ReviewState,
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
import { POLLS_PATH, pollPathFor } from "~/shared/lib/pollPath";
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
	anyReview: "any",
	searched: (search: string) => `“${search}”`,
	withCode: "with code",
	withExplanation: "with explanation",
} as const;

const DEAL_LABEL = {
	never: "never",
	once: "once",
	often: "2+ times",
} as const;

const REVIEW_LABEL = {
	never: "never reviewed",
	changed: "changed since review",
	current: "up to date",
} as const satisfies Record<ReviewState, string>;

const SEPARATOR = " · ";
const STAMP_FORMAT = "d MMM yyyy";

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
export type DealtTimes = keyof typeof DEAL_LABEL;
export type DealtFilter = DealtTimes | All;

const DEALT_TIMES = [
	"never",
	"once",
	"often",
] as const satisfies readonly DealtTimes[];

export type ReviewedFilter = ReviewState | All;

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
	reviewed: ReviewedFilter;
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
	reviewed: ALL,
};

export type Choice<Value extends string> = {
	value: Value;
	label: string;
	count: number;
};

export type PollListSearch = Partial<PollListFilter>;

const oneOf = <Value extends string>(
	values: readonly Value[],
	raw: unknown
): Value | undefined => values.find((value) => value === raw);

const textOf = (raw: unknown): string | undefined => {
	if (typeof raw === "number") return String(raw);
	return typeof raw === "string" ? raw : undefined;
};

const flagOf = (raw: unknown): true | undefined =>
	raw === true || raw === "true" ? true : undefined;

export const pollListSearchOf = (
	raw: Record<string, unknown>
): PollListSearch => ({
	search: textOf(raw.search),
	status: oneOf(POLL_STATUSES, raw.status),
	answerType: oneOf(ANSWER_TYPES, raw.answerType),
	withCode: flagOf(raw.withCode),
	withExplanation: flagOf(raw.withExplanation),
	dealt: oneOf(DEALT_TIMES, raw.dealt),
	category: oneOf(
		getCategories().map((category) => category.code),
		raw.category
	),
	creator: textOf(raw.creator),
	reviewed: oneOf(REVIEW_STATES, raw.reviewed),
});

export const pollListFilterOf = (search: PollListSearch): PollListFilter => ({
	search: search.search ?? EMPTY_FILTER.search,
	status: search.status ?? EMPTY_FILTER.status,
	answerType: search.answerType ?? EMPTY_FILTER.answerType,
	withCode: search.withCode ?? EMPTY_FILTER.withCode,
	withExplanation: search.withExplanation ?? EMPTY_FILTER.withExplanation,
	dealt: search.dealt ?? EMPTY_FILTER.dealt,
	category: search.category ?? EMPTY_FILTER.category,
	creator: search.creator ?? EMPTY_FILTER.creator,
	reviewed: search.reviewed ?? EMPTY_FILTER.reviewed,
});

const changedOf = <Key extends keyof PollListFilter>(
	filter: PollListFilter,
	key: Key
): PollListFilter[Key] | undefined =>
	filter[key] === EMPTY_FILTER[key] ? undefined : filter[key];

export const searchOfFilter = (filter: PollListFilter): PollListSearch => ({
	search: filter.search.trim() === "" ? undefined : filter.search,
	status: changedOf(filter, "status"),
	answerType: changedOf(filter, "answerType"),
	withCode: changedOf(filter, "withCode"),
	withExplanation: changedOf(filter, "withExplanation"),
	dealt: changedOf(filter, "dealt"),
	category: changedOf(filter, "category"),
	creator: changedOf(filter, "creator"),
	reviewed: changedOf(filter, "reviewed"),
});

export const pollListQueryOf = (filter: PollListFilter): string => {
	const query = new URLSearchParams(
		Object.entries(searchOfFilter(filter)).flatMap(([key, value]) =>
			value === undefined ? [] : [[key, String(value)]]
		)
	).toString();
	return query === "" ? "" : `?${query}`;
};

export type PollNeighbours = {
	position: number;
	total: number;
	previous?: number;
	next?: number;
};

export const neighboursOf = (
	polls: readonly Poll[],
	pollId: number
): PollNeighbours | undefined => {
	const index = polls.findIndex((poll) => poll.id === pollId);
	if (index === -1) return undefined;
	const previous = polls[index - 1]?.id;
	const next = polls[index + 1]?.id;
	return {
		position: index + 1,
		total: polls.length,
		...(previous === undefined ? {} : { previous }),
		...(next === undefined ? {} : { next }),
	};
};

export type PollScreen = "detail" | "edit";

export type PollStep = {
	position: number;
	total: number;
	previousHref?: string;
	nextHref?: string;
};

export const pollScreenHrefOf = (
	pollId: number,
	screen: PollScreen,
	query: string
): string =>
	`${screen === "edit" ? `${pollPathFor(pollId)}/edit` : pollPathFor(pollId)}${query}`;

export const pollListHrefOf = (query: string): string =>
	`${POLLS_PATH}${query}`;

export const pollStepOf = (
	{ position, total, previous, next }: PollNeighbours,
	query: string,
	screen: PollScreen
): PollStep => ({
	position,
	total,
	...(previous === undefined
		? {}
		: { previousHref: pollScreenHrefOf(previous, screen, query) }),
	...(next === undefined
		? {}
		: { nextHref: pollScreenHrefOf(next, screen, query) }),
});

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
	reviewed: readonly Choice<ReviewedFilter>[];
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
	(filter.creator === ALL || poll.createdBy === filter.creator) &&
	(filter.reviewed === ALL || reviewStateOf(poll) === filter.reviewed);

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
	reviewed: countedChoicesOf(
		visiblePollsOf(polls, { ...filter, reviewed: ALL }, deals),
		COPY.anyReview,
		REVIEW_STATES,
		(state) => REVIEW_LABEL[state],
		reviewStateOf
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
		filter.reviewed !== ALL && {
			key: "reviewed",
			label: labelOfChoice(choices.reviewed, filter.reviewed),
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
	review: ReviewState;
	reviewedOn?: string;
	updatedOn?: string;
};

const authorOf = (creator: PollCreator | undefined): PollAuthor | undefined =>
	creator === undefined
		? undefined
		: {
				name: creator.displayName,
				...(creator.photoUrl === null ? {} : { photoUrl: creator.photoUrl }),
			};

const stampOf = (date: Date | null): string | undefined =>
	date === null ? undefined : format(date, STAMP_FORMAT);

export const stampsOf = ({
	reviewedAt,
	updatedAt,
}: Poll): Pick<PollRow, "reviewedOn" | "updatedOn"> => {
	const reviewedOn = stampOf(reviewedAt);
	const updatedOn = stampOf(updatedAt);
	return {
		...(reviewedOn === undefined ? {} : { reviewedOn }),
		...(updatedOn === undefined ? {} : { updatedOn }),
	};
};

export const pollRowsOf = (
	polls: readonly Poll[],
	creators?: readonly PollCreator[],
	deals: PollDeals = NO_DEALS,
	query = ""
): PollRow[] => {
	const creatorById = new Map(
		(creators ?? []).map((creator) => [creator.id, creator])
	);
	return polls.map((poll) => {
		const author = authorOf(creatorById.get(poll.createdBy));
		return {
			id: poll.id,
			href: `${pollPathFor(poll.id)}${query}`,
			number: poll.pollNumber ?? poll.id,
			category: getCategoryMetadata(poll.categoryCode).name,
			question: questionSegmentsOf(poll.question),
			facts: pollFactsOf(poll, timesDealtOf(poll, deals)),
			...(author === undefined ? {} : { author }),
			status: poll.status,
			review: reviewStateOf(poll),
			...stampsOf(poll),
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

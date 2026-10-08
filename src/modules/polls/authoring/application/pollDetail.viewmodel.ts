import { format } from "date-fns";

import { stampsOf } from "~/modules/polls/authoring/application/pollList.viewmodel";
import {
	reviewStateOf,
	type Poll,
	type PollCreator,
	type PollStatus,
	type ReviewState,
} from "~/modules/polls/poll/domain/poll.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { letterAt } from "~/shared/lib/letters";
import type {
	QuestionOption,
	QuestionProps,
} from "~/ui/kanto-theme/Question.ui";

const CREATED_FORMAT = "d MMM yyyy";

export const DETAIL_VIEWS = ["player", "answer"] as const;
export type PollDetailView = (typeof DETAIL_VIEWS)[number];

export type PollDetailAuthor = {
	name: string;
	photoUrl?: string;
	userId: string;
};

export type PollDetailData = {
	id: number;
	number: string;
	category: string;
	status: PollStatus;
	created: string;
	review: ReviewState;
	reviewedOn?: string;
	updatedOn?: string;
	question: QuestionProps;
	codeSandboxExample?: string;
	author?: PollDetailAuthor;
	explanation?: string;
};

const authorOf = (
	creators: readonly PollCreator[] | undefined,
	createdBy: string
): PollDetailAuthor | undefined => {
	const creator = creators?.find((entry) => entry.id === createdBy);
	if (creator === undefined) return undefined;
	return {
		name: creator.displayName,
		...(creator.photoUrl === null ? {} : { photoUrl: creator.photoUrl }),
		userId: creator.id,
	};
};

const optionExplanationOf = (
	option: PollOption
): QuestionOption["explanation"] => {
	const text = option.explanation?.trim() ?? "";
	return text === "" ? undefined : { text, right: option.correct };
};

const answerOptionOf = (option: PollOption): Partial<QuestionOption> => {
	const explanation = optionExplanationOf(option);
	return {
		state: option.correct ? "right" : "idle",
		...(explanation === undefined ? {} : { explanation }),
	};
};

export const pollDetailViewOf = (
	poll: Poll,
	options: readonly PollOption[],
	creators: readonly PollCreator[] | undefined,
	view: PollDetailView
): PollDetailData => {
	const author = authorOf(creators, poll.createdBy);
	const explanation = poll.explanation?.trim() ?? "";
	return {
		id: poll.id,
		number: `#${poll.pollNumber ?? poll.id}`,
		category: getCategoryMetadata(poll.categoryCode).name,
		status: poll.status,
		created: format(poll.createdAt, CREATED_FORMAT),
		review: reviewStateOf(poll),
		...stampsOf(poll),
		question: {
			answerType: poll.answerType,
			question: poll.question,
			...(poll.codeBlock === null ? {} : { codeBlock: poll.codeBlock }),
			options: options.map((option, index) => ({
				id: String(option.id),
				letter: letterAt(index),
				label: option.option,
				...(view === "answer" ? answerOptionOf(option) : {}),
			})),
		},
		...(poll.codeSandboxExample === null
			? {}
			: { codeSandboxExample: poll.codeSandboxExample }),
		...(author === undefined ? {} : { author }),
		...(explanation === "" ? {} : { explanation }),
	};
};

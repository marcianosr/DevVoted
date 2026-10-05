import { format } from "date-fns";

import type {
	Poll,
	PollCreator,
	PollStatus,
} from "~/modules/polls/poll/domain/poll.model";
import type { PollOption } from "~/modules/polls/poll/domain/pollOption.model";
import { getCategoryMetadata } from "~/shared/lib/categories";
import { letterAt } from "~/shared/lib/letters";
import type { QuestionProps } from "~/ui/kanto-theme/Question.ui";

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
		question: {
			answerType: poll.answerType,
			question: poll.question,
			...(poll.codeBlock === null ? {} : { codeBlock: poll.codeBlock }),
			options: options.map((option, index) => ({
				id: String(option.id),
				letter: letterAt(index),
				label: option.option,
				...(view === "answer"
					? { state: option.correct ? "right" : "idle" }
					: {}),
			})),
		},
		...(poll.codeSandboxExample === null
			? {}
			: { codeSandboxExample: poll.codeSandboxExample }),
		...(author === undefined ? {} : { author }),
		...(explanation === "" ? {} : { explanation }),
	};
};

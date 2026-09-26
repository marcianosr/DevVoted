import type { CategoryCode } from "~/shared/lib/categories";

import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import type { PollStats } from "~/modules/run/run/domain/pollStats.model";
import type {
	AnswerType,
	PollAuthor,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

type PollOptionView = { readonly id: string; readonly label: string };

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
	readonly author?: PollAuthor;
	readonly stats?: PollStats;
	readonly categorySeat?: CategorySeat;
};

export const REDACTED_LABEL = "?????";

export const redactPoll = (
	poll: RunPoll,
	hiddenOptionIds: readonly string[] = [],
	answerTypeHidden = false
): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	codeBlock: poll.codeBlock,
	codeSandboxUrl: poll.codeSandboxUrl,
	answerType: answerTypeHidden ? "multiple" : poll.answerType,
	author: poll.author,
	options: poll.options.map((option) => ({
		id: option.id,
		label: hiddenOptionIds.includes(option.id) ? REDACTED_LABEL : option.label,
	})),
});

export const revealedPoll = (
	poll: PollView,
	labels: readonly string[] | undefined
): PollView => {
	if (!labels) return poll;
	return {
		...poll,
		options: poll.options.map((option, index) => ({
			...option,
			label: labels[index] ?? option.label,
		})),
	};
};

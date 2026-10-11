import type { CategoryCode } from "~/shared/lib/categories";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import { type PairSide, sideOf } from "~/modules/run/run/domain/pairPoll.model";
import type { PollStats } from "~/modules/run/run/domain/pollStats.model";
import type {
	AnswerType,
	PollAuthor,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

type PollOptionView = { readonly id: string; readonly label: string };

export type PairsView = {
	readonly left: readonly PollOptionView[];
	readonly right: readonly PollOptionView[];
};

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
	readonly pairs?: PairsView;
	readonly author?: PollAuthor;
	readonly stats?: PollStats;
	readonly categorySeat?: CategorySeat;
};

export const REDACTED_LABEL = "?????";

const columnOf = (poll: RunPoll, side: PairSide): readonly PollOptionView[] =>
	shuffleSeeded(
		poll.options.filter((option) => sideOf(poll, option.id) === side),
		`pairs-${side}-${poll.id}`
	).map((option) => ({ id: option.id, label: option.label }));

const redactPairs = (poll: RunPoll): PollView => {
	const pairs = {
		left: columnOf(poll, "left"),
		right: columnOf(poll, "right"),
	};
	return {
		id: poll.id,
		category: poll.category,
		question: poll.question,
		codeBlock: poll.codeBlock,
		codeSandboxUrl: poll.codeSandboxUrl,
		answerType: poll.answerType,
		author: poll.author,
		options: [...pairs.left, ...pairs.right],
		pairs,
	};
};

export const redactPoll = (
	poll: RunPoll,
	hiddenOptionIds: readonly string[] = [],
	answerTypeHidden = false
): PollView => {
	if (poll.answerType === "pairs") return redactPairs(poll);
	return {
		id: poll.id,
		category: poll.category,
		question: poll.question,
		codeBlock: poll.codeBlock,
		codeSandboxUrl: poll.codeSandboxUrl,
		answerType: answerTypeHidden ? "multiple" : poll.answerType,
		author: poll.author,
		options: poll.options.map((option) => ({
			id: option.id,
			label: hiddenOptionIds.includes(option.id)
				? REDACTED_LABEL
				: option.label,
		})),
	};
};

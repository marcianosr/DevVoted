import type { CategoryCode } from "~/shared/lib/categories";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import {
	NO_PAIRS_RESOLVED,
	type PairSide,
	type PairsProgress,
	sideOf,
} from "~/modules/run/run/domain/pairPoll.model";
import type { PollStats } from "~/modules/run/run/domain/pollStats.model";
import type {
	AnswerType,
	PollAuthor,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

type PollOptionView = { readonly id: string; readonly label: string };

export type PairTileState = "open" | "matched" | "missed";

export type PairTileView = PollOptionView & { readonly state: PairTileState };

export type PairsView = {
	readonly left: readonly PairTileView[];
	readonly right: readonly PairTileView[];
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

const tileStateOf = (
	option: RunPoll["options"][number],
	progress: PairsProgress
): PairTileState => {
	if (progress.matched.includes(option.id)) return "matched";
	return option.group !== undefined && progress.missed.includes(option.group)
		? "missed"
		: "open";
};

const columnOf = (
	poll: RunPoll,
	side: PairSide,
	progress: PairsProgress
): readonly PairTileView[] =>
	shuffleSeeded(
		poll.options.filter((option) => sideOf(poll, option.id) === side),
		`pairs-${side}-${poll.id}`
	).map((option) => ({
		id: option.id,
		label: option.label,
		state: tileStateOf(option, progress),
	}));

const redactPairs = (poll: RunPoll, progress: PairsProgress): PollView => {
	const pairs = {
		left: columnOf(poll, "left", progress),
		right: columnOf(poll, "right", progress),
	};
	return {
		id: poll.id,
		category: poll.category,
		question: poll.question,
		codeBlock: poll.codeBlock,
		codeSandboxUrl: poll.codeSandboxUrl,
		answerType: poll.answerType,
		author: poll.author,
		options: [...pairs.left, ...pairs.right]
			.filter((tile) => tile.state === "open")
			.map(({ id, label }) => ({ id, label })),
		pairs,
	};
};

export const redactPoll = (
	poll: RunPoll,
	hiddenOptionIds: readonly string[] = [],
	answerTypeHidden = false,
	pairsResolved: PairsProgress = NO_PAIRS_RESOLVED
): PollView => {
	if (poll.answerType === "pairs") return redactPairs(poll, pairsResolved);
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

import type { CategoryCode } from "~/shared/lib/categories";
import { shuffleSeeded } from "~/shared/lib/seededRandom";

import type { CategorySeat } from "~/modules/run/run/domain/categoryLeader.model";
import { gridGroupsOf } from "~/modules/run/run/domain/gridPoll.model";
import type { PollStats } from "~/modules/run/run/domain/pollStats.model";
import type {
	AnswerType,
	PollAuthor,
	RunPoll,
} from "~/modules/run/run/domain/runPoll.model";

type PollOptionView = { readonly id: string; readonly label: string };

export type SolvedGroupView = {
	readonly label: string;
	readonly tiles: readonly string[];
};

export type GridView = {
	readonly solved: readonly SolvedGroupView[];
	readonly hints: readonly (string | null)[];
};

export type GridReveal = {
	readonly locked: readonly string[];
	readonly namesShown: boolean;
};

const NOTHING_LOCKED: GridReveal = { locked: [], namesShown: false };

export type PollView = {
	readonly id: string;
	readonly category: CategoryCode;
	readonly question: string;
	readonly codeBlock?: string;
	readonly codeSandboxUrl?: string;
	readonly answerType: AnswerType;
	readonly options: readonly PollOptionView[];
	readonly grid?: GridView;
	readonly author?: PollAuthor;
	readonly stats?: PollStats;
	readonly categorySeat?: CategorySeat;
};

export const REDACTED_LABEL = "?????";

const gridViewOf = (poll: RunPoll, reveal: GridReveal): GridView => {
	const groups = gridGroupsOf(poll, reveal.locked);
	return {
		solved: groups
			.filter((group) => group.solved)
			.map((group) => ({
				label: group.label,
				tiles: group.tiles.map((tile) => tile.label),
			})),
		hints: groups
			.filter((group) => !group.solved)
			.map((group) => (reveal.namesShown ? group.label : null)),
	};
};

const dealtTilesOf = (
	poll: RunPoll,
	locked: readonly string[]
): readonly PollOptionView[] =>
	shuffleSeeded(
		poll.options.filter((option) => !locked.includes(option.id)),
		`grid-${poll.id}`
	).map(({ id, label }) => ({ id, label }));

const redactGrid = (poll: RunPoll, reveal: GridReveal): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	codeBlock: poll.codeBlock,
	codeSandboxUrl: poll.codeSandboxUrl,
	answerType: poll.answerType,
	author: poll.author,
	options: dealtTilesOf(poll, reveal.locked),
	grid: gridViewOf(poll, reveal),
});

export const redactPoll = (
	poll: RunPoll,
	hiddenOptionIds: readonly string[] = [],
	answerTypeHidden = false,
	gridReveal: GridReveal = NOTHING_LOCKED
): PollView => {
	if (poll.answerType === "grid") return redactGrid(poll, gridReveal);
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

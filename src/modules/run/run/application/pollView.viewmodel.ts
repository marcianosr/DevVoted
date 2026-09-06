import type { CategoryCode } from "~/shared/lib/categories";

import type {
	AnswerType,
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
	readonly author?: string;
};

export const REDACTED_LABEL = "?????";

export const redactPoll = (
	poll: RunPoll,
	hiddenOptionIds: readonly string[] = []
): PollView => ({
	id: poll.id,
	category: poll.category,
	question: poll.question,
	codeBlock: poll.codeBlock,
	codeSandboxUrl: poll.codeSandboxUrl,
	answerType: poll.answerType,
	author: poll.author,
	options: poll.options.map((option) => ({
		id: option.id,
		label: hiddenOptionIds.includes(option.id) ? REDACTED_LABEL : option.label,
	})),
});

/**
 * Restores sealed text once the answer is in. Without it a redacted poll stays
 * ????? through the whole reveal, so the player never learns what they
 * gambled on — and the reveal marks correctness by label, so nothing would
 * light up either. `AnsweredPoll.options` is the same list in the same order.
 */
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

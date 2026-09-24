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
	/**
	 * How the room and this account have done with this poll. Filled by the
	 * service after the view is built, never by the engine: the reducer has no
	 * business knowing how hard other people found a question, and these numbers
	 * move while the run is open.
	 *
	 * Optional on purpose. The band is free today, and a config that reveals the
	 * room's accuracy — or an audit that blinds you to it — withholds it by
	 * leaving this undefined.
	 */
	readonly stats?: PollStats;
	/**
	 * Who leads the category this poll belongs to, filled by the service
	 * alongside `stats` and for the same reason: it is read, not derived, and it
	 * moves while the run is open. Optional on the same seam — an audit that
	 * blinds the category withholds the seat with it, or the row would name the
	 * topic the audit just hid.
	 */
	readonly categorySeat?: CategorySeat;
};

export const REDACTED_LABEL = "?????";

/**
 * The presented `answerType` is a lie under 207 Multi-Status, and deliberately
 * only here: grading reads the poll itself, so a single still needs exactly its
 * one answer. One value drives the cap shape, the meta line and the selection
 * toggle, which is why the disguise costs nothing downstream.
 */
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

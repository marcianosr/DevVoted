import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { plural } from "~/shared/lib/displayValue";

type PollsToday = Pick<RunView, "pollsLeftToday" | "pollsPerGate">;

const READY_TRAIL = "are ready";
const LEFT_TRAIL = "left · they do not carry to tomorrow";

const todays = (words: string): string => `today’s ${words}`;

/**
 * What the hub says about today's polls. The part-answered line exists because
 * the rollover drops the unplayed tail (ADR-011): a player who stops at two
 * forfeits the rest at midnight, and until this note they were never told.
 *
 * The countdown wins whenever the caller has one, so the clock stays in the
 * component that owns the timer and this function stays pure.
 */
export const pollsNoteFor = (
	view: PollsToday,
	countdownLabel: string | undefined
): string => {
	if (countdownLabel !== undefined) return countdownLabel;

	const { pollsLeftToday, pollsPerGate } = view;
	if (pollsLeftToday >= pollsPerGate)
		return `${todays(plural(pollsPerGate, "poll"))} ${READY_TRAIL}`;

	return `${pollsLeftToday} of ${todays(String(pollsPerGate))} ${LEFT_TRAIL}`;
};

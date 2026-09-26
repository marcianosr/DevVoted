import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { plural } from "~/shared/lib/displayValue";

type PollsToday = Pick<RunView, "pollsLeftToday" | "pollsPerGate">;

const READY_TRAIL = "are ready";
const DONE_TRAIL = "are answered";
const LEFT_TRAIL = "left · they do not carry to tomorrow";

const todays = (words: string): string => `today’s ${words}`;

/**
 * What the hub says about today's polls. The part-answered line exists because
 * the rollover drops the unplayed tail (ADR-011): a player who stops at two
 * forfeits the rest at midnight, and until this note they were never told.
 *
 * It states the day and never the clock. The press above it already reads the
 * countdown on a spent day, and a note repeating its own press says one thing
 * twice where the reader is entitled to two.
 */
export const pollsNoteFor = (view: PollsToday): string => {
	const { pollsLeftToday, pollsPerGate } = view;
	const wholeDay = todays(plural(pollsPerGate, "poll"));

	if (pollsLeftToday >= pollsPerGate) return `${wholeDay} ${READY_TRAIL}`;
	if (pollsLeftToday <= 0) return `${wholeDay} ${DONE_TRAIL}`;

	return `${pollsLeftToday} of ${todays(String(pollsPerGate))} ${LEFT_TRAIL}`;
};

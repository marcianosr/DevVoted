import type { RunView } from "~/modules/run/run/application/runView.viewmodel";
import { plural } from "~/shared/lib/displayValue";

type PollsToday = Pick<RunView, "pollsLeftToday" | "pollsPerGate">;

const READY_TRAIL = "are ready";
const DONE_TRAIL = "are answered";
const LEFT_TRAIL = "left · they do not carry to tomorrow";

const todays = (words: string): string => `today’s ${words}`;

export const pollsNoteFor = (view: PollsToday): string => {
	const { pollsLeftToday, pollsPerGate } = view;
	const wholeDay = todays(plural(pollsPerGate, "poll"));

	if (pollsLeftToday >= pollsPerGate) return `${wholeDay} ${READY_TRAIL}`;
	if (pollsLeftToday <= 0) return `${wholeDay} ${DONE_TRAIL}`;

	return `${pollsLeftToday} of ${todays(String(pollsPerGate))} ${LEFT_TRAIL}`;
};

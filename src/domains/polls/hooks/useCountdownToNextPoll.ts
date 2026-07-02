import { formatDuration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

import { getMsUntilNextPoll } from "~/lib/dateUtils";

type CountdownToNextPoll = {
	/** True once the local day has rolled over and the next poll is available. */
	isOpen: boolean;
	/** Human-readable time remaining, e.g. "Next poll in 5h 23m 10s". */
	label: string;
};

const formatRemaining = (ms: number): string => {
	const duration = intervalToDuration({ start: 0, end: ms });
	const formatted = formatDuration(duration, {
		format: ["hours", "minutes", "seconds"],
	});
	return `Next poll in ${formatted}`;
};

/**
 * Drives a live countdown to the next daily poll. Re-renders once per second so
 * the label ticks down, and flips `isOpen` to true when the local day rolls over
 * (at which point the caller can navigate to the freshly available poll).
 */
export const useCountdownToNextPoll = (): CountdownToNextPoll => {
	const [remainingMs, setRemainingMs] = useState(() =>
		getMsUntilNextPoll(new Date())
	);

	useEffect(() => {
		const tick = () => setRemainingMs(getMsUntilNextPoll(new Date()));
		const intervalId = setInterval(tick, 1000);
		return () => clearInterval(intervalId);
	}, []);

	const isOpen = remainingMs <= 0;
	return {
		isOpen,
		label: isOpen ? "Continue →" : formatRemaining(remainingMs),
	};
};

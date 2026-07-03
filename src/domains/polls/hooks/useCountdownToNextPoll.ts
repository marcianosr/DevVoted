import { formatDuration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

import { getMsUntilNextPoll } from "~/lib/dateUtils";

type CountdownToNextPoll = {
	/** True once the local day has rolled over and the next poll is available. */
	isOpen: boolean;
	/** Live display text, e.g. "Next poll in 5h 23m 10s" — or a ready message once open. */
	countdown: string;
	/** Static nav-button label (no live counter). */
	actionLabel: string;
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
 * `countdown` ticks down, and flips `isOpen` to true when the local day rolls
 * over (at which point the caller can navigate to the freshly available poll).
 * `countdown` is for display (e.g. a banner); `actionLabel` is the static
 * button text, kept counter-free so the two can live in different places.
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
		countdown: isOpen ? "The next poll is live" : formatRemaining(remainingMs),
		actionLabel: isOpen ? "Continue →" : "Next poll",
	};
};

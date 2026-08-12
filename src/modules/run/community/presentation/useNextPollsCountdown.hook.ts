import { useEffect, useState } from "react";

import {
	formatCompactDuration,
	nextLocalMidnight,
} from "~/shared/lib/dateUtils";

type NextPollsCountdown = {
	/** True once the local day rolled over — tomorrow's segment is live. */
	readonly isOpen: boolean;
	/** Button-sized wait copy, e.g. "New polls in 7h 23m". */
	readonly label: string;
};

const TICK_MS = 10_000;

/**
 * Counts down to the next daily segment: next local midnight, the same
 * convention the legacy daily poll uses. The deadline is pinned at mount —
 * recomputing "next midnight" per tick would leap to ~24h the instant the
 * day rolls over, and `isOpen` would never flip. The copy has minute
 * resolution, so the tick is coarse on purpose.
 */
export const useNextPollsCountdown = (): NextPollsCountdown => {
	const [deadlineMs] = useState(() => nextLocalMidnight(new Date()).getTime());
	const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

	useEffect(() => {
		const id = setInterval(
			() => setRemainingMs(deadlineMs - Date.now()),
			TICK_MS
		);
		return () => clearInterval(id);
	}, [deadlineMs]);

	return {
		isOpen: remainingMs <= 0,
		label: `New polls in ${formatCompactDuration(remainingMs)}`,
	};
};

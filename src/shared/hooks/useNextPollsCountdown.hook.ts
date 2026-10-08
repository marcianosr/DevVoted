import { useEffect, useState } from "react";

import {
	formatCompactDuration,
	nextLocalMidnight,
} from "~/shared/lib/dateUtils";

export type CountdownTick = "minute" | "second";

type NextPollsCountdown = {
	readonly isOpen: boolean;
	readonly remaining: string;
	readonly remainingMs: number;
};

const TICK_MS = {
	minute: 10_000,
	second: 1_000,
} satisfies Record<CountdownTick, number>;

export const useNextPollsCountdown = (
	tick: CountdownTick = "minute"
): NextPollsCountdown => {
	const [deadlineMs] = useState(() => nextLocalMidnight(new Date()).getTime());
	const [remainingMs, setRemainingMs] = useState(() => deadlineMs - Date.now());

	useEffect(() => {
		const id = setInterval(
			() => setRemainingMs(deadlineMs - Date.now()),
			TICK_MS[tick]
		);
		return () => clearInterval(id);
	}, [deadlineMs, tick]);

	return {
		isOpen: remainingMs <= 0,
		remaining: formatCompactDuration(remainingMs),
		remainingMs,
	};
};

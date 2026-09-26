import { useEffect, useState } from "react";

import {
	formatCompactDuration,
	nextLocalMidnight,
} from "~/shared/lib/dateUtils";

type NextPollsCountdown = {
	readonly isOpen: boolean;
	readonly label: string;
};

const TICK_MS = 10_000;

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

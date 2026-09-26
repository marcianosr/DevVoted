import { useEffect, useRef, useState } from "react";

const TICK_MS = 250;

export const usePollClock = (
	pollId: string | null,
	limitMs: number | null
): { elapsedMs: () => number; remainingMs: number | null } => {
	const startedAt = useRef(performance.now());
	const [now, setNow] = useState(startedAt.current);

	useEffect(() => {
		startedAt.current = performance.now();
		setNow(startedAt.current);
	}, [pollId]);

	useEffect(() => {
		if (limitMs === null) return;
		const tick = setInterval(() => setNow(performance.now()), TICK_MS);
		return () => clearInterval(tick);
	}, [limitMs, pollId]);

	return {
		elapsedMs: () => Math.round(performance.now() - startedAt.current),
		remainingMs:
			limitMs === null
				? null
				: Math.max(0, limitMs - (now - startedAt.current)),
	};
};

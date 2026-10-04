import { useCallback, useEffect, useRef, useState } from "react";

export type Beat<Step extends string> = readonly [step: Step, at: number];

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = (): boolean =>
	typeof window !== "undefined" &&
	typeof window.matchMedia === "function" &&
	window.matchMedia(REDUCED_MOTION).matches;

const waitBefore = <Step extends string>(
	beats: readonly Beat<Step>[],
	index: number
): number => {
	const [, at] = beats[index];
	const previous = index === 0 ? 0 : beats[index - 1][1];
	return Math.max(0, at - previous);
};

export type RevealBeats<Step extends string> = {
	reached: (step: Step) => boolean;
	finished: boolean;
	advance: () => void;
};

export const useRevealBeats = <Step extends string>(
	beats: readonly Beat<Step>[],
	holdMs: number,
	onDone: () => void
): RevealBeats<Step> => {
	const [played, setPlayed] = useState(() =>
		prefersReducedMotion() ? beats.length : 0
	);
	const done = useRef(onDone);

	useEffect(() => {
		done.current = onDone;
	}, [onDone]);

	const finished = played >= beats.length;

	useEffect(() => {
		if (finished) {
			const hold = setTimeout(() => done.current(), holdMs);
			return () => clearTimeout(hold);
		}

		const wait = setTimeout(
			() => setPlayed((count) => count + 1),
			waitBefore(beats, played)
		);
		return () => clearTimeout(wait);
	}, [beats, played, finished, holdMs]);

	const reached = useCallback(
		(step: Step) => beats.slice(0, played).some(([at]) => at === step),
		[beats, played]
	);

	const advance = useCallback(() => {
		if (finished) {
			done.current();
			return;
		}
		setPlayed(beats.length);
	}, [beats.length, finished]);

	return { reached, finished, advance };
};

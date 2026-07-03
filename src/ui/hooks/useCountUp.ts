import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type CountUpOptions = {
	from?: number;
	durationMs?: number;
	delayMs?: number;
};

/**
 * Tweens a number from `from` to `target` over `durationMs`, after `delayMs`
 * (used to stagger sibling stats). Presentation-only — belongs in the UI tier.
 * Snaps straight to `target` when the user prefers reduced motion.
 */
export const useCountUp = (
	target: number,
	{ from = 0, durationMs = 600, delayMs = 0 }: CountUpOptions = {}
): number => {
	const [value, setValue] = useState(from);
	const frameRef = useRef<number | undefined>(undefined);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined
	);

	useEffect(() => {
		if (prefersReducedMotion() || from === target) {
			setValue(target);
			return;
		}

		const tick = (start: number) => (now: number) => {
			const progress = Math.min(1, (now - start) / durationMs);
			setValue(from + (target - from) * easeOutCubic(progress));
			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick(start));
			}
		};

		timeoutRef.current = setTimeout(() => {
			frameRef.current = requestAnimationFrame((now) => tick(now)(now));
		}, delayMs);

		return () => {
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [target, from, durationMs, delayMs]);

	return value;
};

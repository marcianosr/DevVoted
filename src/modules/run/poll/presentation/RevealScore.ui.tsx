import { clsx } from "clsx";
import { useEffect, useState } from "react";

import { useCountUp } from "~/ui/hooks/useCountUp";
import {
	REVEAL_WINDOW_MS,
	revealDelayMs,
} from "~/modules/run/poll/presentation/revealTiming";

/** Matches `.reveal-pop` in app.css — the count-up finishes as the last badge settles. */
const POP_DURATION_MS = 260;
/** How far into a badge's pop it reads as "landed", so the tally bumps on impact. */
const POP_PEAK_MS = 150;

export type RevealScoreMode = "perPop" | "countUp";

/** One option's contribution to the score, keyed to its row so it fires on that pop. */
export type RevealStep = { readonly index: number; readonly delta: number };

type RevealScoreProps = {
	/** MUST be a stable reference (module const / memoized) — see file-level note. */
	readonly steps: readonly RevealStep[];
	readonly optionCount: number;
	readonly mode: RevealScoreMode;
	readonly label?: string;
};

const roundTenth = (value: number): number => Math.round(value * 10) / 10;

const formatDelta = (value: number): string =>
	`${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const toneOf = (value: number): string => {
	if (value > 0) return "text-green-400";
	if (value < 0) return "text-red-400";
	return "text-zinc-400";
};

const totalOf = (steps: readonly RevealStep[]): number =>
	roundTenth(steps.reduce((sum, step) => sum + step.delta, 0));

/**
 * Accumulates each step into a running total, applying it the moment that
 * option's badge lands (its reveal delay + the pop's peak). Snaps to the final
 * total when motion is reduced.
 */
const useSteppedTally = (
	steps: readonly RevealStep[],
	optionCount: number,
	enabled: boolean
): number => {
	const [total, setTotal] = useState(0);

	useEffect(() => {
		if (!enabled) {
			setTotal(totalOf(steps));
			return;
		}
		setTotal(0);
		const timers = steps.map((step) =>
			setTimeout(
				() => setTotal((current) => roundTenth(current + step.delta)),
				revealDelayMs(step.index, optionCount) + POP_PEAK_MS
			)
		);
		return () => timers.forEach(clearTimeout);
	}, [steps, optionCount, enabled]);

	return total;
};

/**
 * The scoring payload of the answer reveal: coverage earned, animated in sync
 * with the option pops. `perPop` climbs step-by-step as each badge lands (each
 * ✓ visibly scores); `countUp` sweeps the total smoothly across the reveal.
 */
export const RevealScore = ({
	steps,
	optionCount,
	mode,
	label = "coverage",
}: RevealScoreProps) => {
	const total = totalOf(steps);

	const stepped = useSteppedTally(steps, optionCount, mode === "perPop");
	const counted = useCountUp(total, {
		from: 0,
		durationMs: REVEAL_WINDOW_MS + POP_DURATION_MS,
	});

	const shown = mode === "perPop" ? stepped : counted;
	// Each stepped increment re-keys the value so `score-bump` replays on impact.
	const bumpKey = mode === "perPop" ? shown : undefined;

	return (
		<div className="flex items-baseline justify-between border-t border-theme pt-3">
			<span className="text-theme text-sm">{label}</span>
			<span
				key={bumpKey}
				className={clsx(
					"inline-block text-2xl font-bold tabular-nums",
					mode === "perPop" && "score-bump",
					toneOf(shown)
				)}
			>
				{formatDelta(shown)}
			</span>
		</div>
	);
};

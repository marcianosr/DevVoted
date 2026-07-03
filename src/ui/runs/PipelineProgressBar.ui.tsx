import { useEffect, useState } from "react";

import { clsx } from "clsx";

import { useCountUp } from "~/ui/hooks/useCountUp";

type PipelineProgressBarProps = {
	previous: number;
	current: number;
	target: number;
	suffix: string;
	/** False when the check saw no relevant poll this window (nothing to show). */
	seen?: boolean;
	/** Stagger sibling bars so they reveal in sequence. */
	delayMs?: number;
};

const PULSE_MS = 700;

const barPct = (value: number, target: number) =>
	target <= 0 ? 0 : Math.max(0, Math.min(100, (value / target) * 100));

/**
 * A pipeline check's progress toward its requirement, animated from the state
 * before the last answer to the state after it: the count tweens (up or down),
 * the bar slides to its new width, and a gain/loss pulse flashes the value.
 * When `previous` equals `current` (flows with no prior window state) it simply
 * renders the static current progress. The count line reads "current / target
 * suffix" — a percentage requirement renders as "…% / …% needed".
 */
export const PipelineProgressBar = ({
	previous,
	current,
	target,
	suffix,
	seen = true,
	delayMs = 0,
}: PipelineProgressBarProps) => {
	const isPercent = suffix === "%";
	const delta = current - previous;
	const animated = useCountUp(current, { from: previous, delayMs });
	const display = isPercent ? animated.toFixed(1) : Math.round(animated);

	const [pulsing, setPulsing] = useState(false);
	useEffect(() => {
		if (delta === 0 || !seen) return;
		const on = setTimeout(() => setPulsing(true), delayMs);
		const off = setTimeout(() => setPulsing(false), delayMs + PULSE_MS);
		return () => {
			clearTimeout(on);
			clearTimeout(off);
		};
	}, [delta, seen, delayMs]);

	const gained = delta > 0;
	const pulseText = gained ? "text-green-400" : "text-red-400";

	return (
		<div className="mt-2">
			<div className="flex items-baseline justify-end">
				{seen ? (
					<span
						className={clsx(
							"tabular-nums text-sm transition-all duration-300",
							pulsing ? clsx(pulseText, "scale-110") : "text-gray-300"
						)}
					>
						<span className="font-bold">
							{display}
							{isPercent ? "%" : ""}
						</span>
						<span className="text-gray-500">
							{" / "}
							{target}
							{isPercent ? "%" : ""} {isPercent ? "needed" : suffix}
						</span>
					</span>
				) : (
					<span className="text-sm text-gray-500">no polls seen yet</span>
				)}
			</div>
			<div className="mt-1 h-2 bg-zinc-800 overflow-hidden">
				<div
					className={clsx(
						"h-full transition-all duration-700 ease-out",
						!seen
							? "bg-zinc-700"
							: gained
								? "bg-green-400"
								: delta < 0
									? "bg-red-400"
									: "bg-theme"
					)}
					style={{ width: `${seen ? barPct(current, target) : 0}%` }}
				/>
			</div>
		</div>
	);
};

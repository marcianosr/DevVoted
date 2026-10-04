import type { CSSProperties } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";

const TRACK = "flex w-full items-center gap-3";
const BAR =
	"relative block h-3.5 min-w-0 flex-1 overflow-hidden bg-theme-faint inset-ring-[1.5px] inset-ring-edge-strong";
const FILL = "absolute inset-y-0 left-0 transition-[width] duration-300";
const BEST_FILL = "bg-theme opacity-40";
const SURE_FILL = "bg-theme-lit";
const PULSE = "accuracy-pulse";
const CEILING =
	"absolute inset-y-0 right-1.5 flex items-center text-[0.625rem] leading-none font-bold text-theme-muted";

const PERCENT = "%";
const FILL_COLOR: KantoColor = "viridian";

export type AccuracyPulse = { key: string };

export type AccuracyTrackProps = {
	label: string;
	figure: string;
	ceiling?: string;
	sure: number;
	best: number;
	pulse?: AccuracyPulse;
};

const widthOf = (share: number): CSSProperties => ({
	width: `${Math.min(1, Math.max(0, share)) * 100}${PERCENT}`,
});

export const AccuracyTrack = ({
	label,
	figure,
	ceiling,
	sure,
	best,
	pulse,
}: AccuracyTrackProps) => (
	<span role="img" aria-label={label} className={TRACK}>
		<span
			key={pulse?.key}
			data-screen-theme={FILL_COLOR}
			className={clsx(BAR, pulse !== undefined && PULSE)}
		>
			<span
				data-fill="best"
				style={widthOf(best)}
				className={clsx(FILL, BEST_FILL)}
			/>
			<span
				data-fill="sure"
				style={widthOf(sure)}
				className={clsx(FILL, SURE_FILL)}
			/>
			{ceiling === undefined ? null : (
				<span aria-hidden className={CEILING}>
					{ceiling}
				</span>
			)}
		</span>
		<Badge color={FILL_COLOR}>{figure}</Badge>
	</span>
);

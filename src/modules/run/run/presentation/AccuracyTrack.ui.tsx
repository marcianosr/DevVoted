import type { CSSProperties } from "react";

import { clsx } from "clsx";

import { Badge } from "~/ui/kanto-theme/Badge.ui";
import type { KantoColor } from "~/ui/kanto-theme/colors";

const TRACK = "relative flex w-full flex-col gap-1.5 pt-9";
const BAR_SEAT = "relative block w-full";
const BAR =
	"relative block h-3.5 w-full overflow-hidden rounded-full bg-theme-faint inset-ring-[1.5px] inset-ring-edge-strong";
const BONUS =
	"absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-theme/45 to-theme transition-[width] duration-300";
const CAP =
	"absolute inset-y-0 bg-[repeating-linear-gradient(135deg,transparent_0_4px,color-mix(in_oklch,var(--theme-color)_55%,transparent)_4px_7px)] transition-[left,width] duration-300";
const BEYOND =
	"absolute inset-y-0 right-0 bg-black/55 transition-[left] duration-300";
const LIMIT =
	"absolute -inset-y-1.5 w-0.5 -translate-x-1/2 rounded-full bg-pallet transition-[left] duration-300";
const TICK = "absolute inset-y-0 w-px bg-edge-strong";
const MARKER =
	"absolute top-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300";
const STEM = "h-2.5 w-px bg-theme-lit";
const LABELS = "relative block h-3 w-full";
const LABEL =
	"absolute top-0 -translate-x-1/2 text-xxs leading-none text-theme-muted tabular-nums first:translate-x-0";
const PULSE = "accuracy-pulse";

const PERCENT = "%";
const FILL_COLOR: KantoColor = "viridian";

export type AccuracyPulse = { key: string };

export type AccuracyTick = { share: number; label?: string };

export type AccuracyTrackProps = {
	label: string;
	figure: string;
	bonus: number;
	cap: number;
	ticks: readonly AccuracyTick[];
	pulse?: AccuracyPulse;
};

const clamped = (share: number): number => Math.min(1, Math.max(0, share));

const PERCENT_PRECISION = 100;

const percentOf = (share: number): string =>
	`${Math.round(clamped(share) * 100 * PERCENT_PRECISION) / PERCENT_PRECISION}${PERCENT}`;

const capStyleOf = (bonus: number, cap: number): CSSProperties => ({
	left: percentOf(bonus),
	width: percentOf(clamped(cap) - clamped(bonus)),
});

const hasRoomToCap = (bonus: number, cap: number): boolean =>
	clamped(cap) > clamped(bonus);

export const AccuracyTrack = ({
	label,
	figure,
	bonus,
	cap,
	ticks,
	pulse,
}: AccuracyTrackProps) => (
	<span
		role="img"
		aria-label={label}
		data-screen-theme={FILL_COLOR}
		className={TRACK}
	>
		<span
			aria-hidden
			data-part="marker"
			style={{ left: percentOf(bonus) }}
			className={MARKER}
		>
			<Badge color={FILL_COLOR}>{figure}</Badge>
			<span className={STEM} />
		</span>
		<span className={BAR_SEAT}>
			<span
				key={pulse?.key}
				className={clsx(BAR, pulse !== undefined && PULSE)}
			>
				<span
					data-part="bonus"
					style={{ width: percentOf(bonus) }}
					className={BONUS}
				/>
				{hasRoomToCap(bonus, cap) ? (
					<span
						data-part="cap"
						style={capStyleOf(bonus, cap)}
						className={CAP}
					/>
				) : null}
				<span
					data-part="beyond"
					style={{ left: percentOf(cap) }}
					className={BEYOND}
				/>
				{ticks.map((tick) => (
					<span
						key={tick.share}
						style={{ left: percentOf(tick.share) }}
						className={TICK}
					/>
				))}
			</span>
			<span
				aria-hidden
				data-part="limit"
				style={{ left: percentOf(cap) }}
				className={LIMIT}
			/>
		</span>
		<span aria-hidden className={LABELS}>
			{ticks.flatMap((tick) =>
				tick.label === undefined
					? []
					: [
							<span
								key={tick.share}
								style={{ left: percentOf(tick.share) }}
								className={LABEL}
							>
								{tick.label}
							</span>,
						]
			)}
		</span>
	</span>
);

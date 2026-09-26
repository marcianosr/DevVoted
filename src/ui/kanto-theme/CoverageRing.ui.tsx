import { NEEDED } from "~/shared/lib/copy";
import type { CSSProperties } from "react";

import { Typography } from "./Typography.ui";

const COPY = {
	of: "of",
} as const;

const LAYOUT = "flex items-center gap-5";
const RING = "coverage-ring relative grid size-22 shrink-0 place-items-center";
const DIAL = "size-full -rotate-90";
const TRACK = "fill-none stroke-theme/20";
const ARC = "coverage-arc fill-none stroke-theme";
const TICK = "stroke-theme-faint";
const READOUT = "absolute flex flex-col items-center leading-none";
const FIGURE =
	"flex items-baseline text-xl font-bold tabular-nums text-theme-faint";
const HELD = "coverage-count";
const DEMAND = "mt-0.5 text-xxs whitespace-nowrap text-theme-muted";
const TEXT_COLUMN = "flex min-w-0 flex-col gap-1";

const VIEW_BOX = "0 0 100 100";
const CENTRE = 50;
const RADIUS = 44;
const STROKE = 12;
const TICK_STROKE = 2;
const SWEEP = 100;
const TURN = 2 * Math.PI;
const TENTHS = 10;

const PERCENT = "%";

type CountStyle = CSSProperties & Record<"--coverage-count", number>;

const countStyle = (whole: number): CountStyle => ({
	"--coverage-count": whole,
});

const toTenth = (value: number) =>
	Math.round(Math.max(0, value) * TENTHS) / TENTHS;

const ceilingOf = (held: number, demand: number, pinned?: number) =>
	pinned ?? Math.max(toTenth(demand), toTenth(held));

const shareOf = (value: number, ceiling: number) =>
	ceiling <= 0 ? 0 : Math.max(0, value) / ceiling;

const tickAt = (share: number, radius: number) => ({
	x: CENTRE + radius * Math.cos(share * TURN),
	y: CENTRE + radius * Math.sin(share * TURN),
});

const readingOf = (held: number, demand: number) =>
	`${toTenth(held)}${PERCENT} ${COPY.of} ${toTenth(demand)}${PERCENT} ${NEEDED}`;

export type CoverageRingProps = {
	held: number;
	demand: number;
	ceiling?: number;
	title?: string;
	note?: string;
};

export const CoverageRing = ({
	held,
	demand,
	ceiling: pinned,
	title,
	note,
}: CoverageRingProps) => {
	const reading = toTenth(held);
	const whole = Math.trunc(reading);
	const tenth = Math.round((reading - whole) * TENTHS);

	const ceiling = ceilingOf(held, demand, pinned);
	const filled = shareOf(held, ceiling);
	const passed = ceiling > toTenth(demand);
	const mark = tickAt(shareOf(demand, ceiling), RADIUS);
	const inner = tickAt(shareOf(demand, ceiling), RADIUS - STROKE / 2);

	return (
		<div className={LAYOUT}>
			<span role="img" aria-label={readingOf(held, demand)} className={RING}>
				<svg viewBox={VIEW_BOX} className={DIAL}>
					<circle
						cx={CENTRE}
						cy={CENTRE}
						r={RADIUS}
						strokeWidth={STROKE}
						className={TRACK}
					/>
					<circle
						cx={CENTRE}
						cy={CENTRE}
						r={RADIUS}
						strokeWidth={STROKE}
						strokeLinecap="round"
						pathLength={SWEEP}
						strokeDasharray={SWEEP}
						style={{ strokeDashoffset: SWEEP - filled * SWEEP }}
						className={ARC}
					/>
					{passed ? (
						<line
							x1={inner.x}
							y1={inner.y}
							x2={mark.x}
							y2={mark.y}
							strokeWidth={TICK_STROKE}
							strokeLinecap="round"
							className={TICK}
						/>
					) : null}
				</svg>
				<span aria-hidden className={READOUT}>
					<span className={FIGURE}>
						<span className={HELD} style={countStyle(whole)} />
						{tenth === 0 ? null : `.${tenth}`}
					</span>
					<span className={DEMAND}>
						{COPY.of} {toTenth(demand)}
						{PERCENT}
					</span>
				</span>
			</span>
			{title === undefined && note === undefined ? null : (
				<div className={TEXT_COLUMN}>
					{title === undefined ? null : (
						<Typography variant="subtitle">{title}</Typography>
					)}
					{note === undefined ? null : (
						<Typography variant="hint">{note}</Typography>
					)}
				</div>
			)}
		</div>
	);
};

import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { ConfigInfo, type ConfigInfoProps } from "./ConfigInfo.ui";
import { Typography } from "./Typography.ui";

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "flex h-7.5 w-full";
const SEGMENT =
	"group/info relative flex min-w-0 basis-0 items-center justify-center gap-1.5 first:rounded-l-md last:rounded-r-md";
const PADDED = "px-1.5";
const DIMMED = "opacity-35";
const ROOM = "rounded-r-md border border-dashed border-theme-faint";

const NAME = "truncate text-xs font-bold";
const FIGURE = "shrink-0 text-xs font-bold tabular-nums";

const PANEL = "absolute top-full z-30 mt-2 transition-opacity";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 group-has-[:focus-visible]/info:visible group-has-[:focus-visible]/info:opacity-100";

const ALIGN_START = "left-0";
const ALIGN_END = "right-0";

const NAME_SHARE = 0.12;
const FIGURE_SHARE = 0.05;
const PAST_THE_MIDDLE = 0.5;
const MIN_AXIS = 1;
const NO_WEIGHT = 0;

const WEIGHT_WORD = "weight";
const SEPARATOR = "·";
const OF_WORD = "of";
const FREE_WORD = "free";
const OVER_BY = "over by";

const SEGMENT_RAMP = [
	"pewter",
	"lavender",
	"seafoam",
	"saffron",
	"cerulean",
	"fuchsia",
	"vermillion",
	"viridian",
	"cinnabar",
	"celadon",
	"pallet",
	"indigo",
] as const satisfies readonly KantoColor[];

export const segmentColorOf = (index: number): KantoColor =>
	SEGMENT_RAMP[index % SEGMENT_RAMP.length];

export type WeightTrackFill = {
	name: string;
	slots: number;
	info?: ConfigInfoProps;
};

export type WeightTrackProps = {
	fills: readonly WeightTrackFill[];
	/** The build space the run rents. A hard cap, and what it pays for (ADR-082). */
	held: number;
	highlight?: string;
	caption?: boolean;
};

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

export const roomLineOf = (weight: number, held: number): string => {
	const room =
		weight > held
			? `${OVER_BY} ${weight - held}`
			: `${held - weight} ${FREE_WORD}`;

	return `${weight} ${OF_WORD} ${held} ${WEIGHT_WORD} ${SEPARATOR} ${room}`;
};

const fillLineOf = ({ name, slots }: WeightTrackFill) =>
	`${name} ${SEPARATOR} ${slots} ${WEIGHT_WORD}`;

const Segment = ({
	fill,
	share,
	start,
	color,
	dimmed,
}: {
	fill: WeightTrackFill;
	share: number;
	start: number;
	color: KantoColor;
	dimmed: boolean;
}) => {
	const figure = share >= FIGURE_SHARE;
	const named = share >= NAME_SHARE;

	return (
		<li
			style={{ flexGrow: fill.slots }}
			data-screen-theme={color}
			className={clsx(
				SEGMENT,
				"segment-theme",
				figure && PADDED,
				dimmed && DIMMED
			)}
		>
			<span className="sr-only">{fillLineOf(fill)}</span>
			{!named ? null : (
				<span aria-hidden className={NAME}>
					{fill.name}
				</span>
			)}
			{!figure ? null : (
				<span aria-hidden className={FIGURE}>
					{fill.slots}
				</span>
			)}

			{fill.info === undefined ? null : (
				<span
					aria-hidden
					className={clsx(
						PANEL,
						PANEL_SHUT,
						start > PAST_THE_MIDDLE ? ALIGN_END : ALIGN_START
					)}
				>
					<ConfigInfo {...fill.info} />
				</span>
			)}
		</li>
	);
};

export const WeightTrack = ({
	fills,
	held,
	highlight,
	caption = true,
}: WeightTrackProps) => {
	const weight = weightOf(fills);
	const axis = Math.max(held, weight, MIN_AXIS);
	const highlighted = fills.find((fill) => fill.name === highlight);

	let taken = NO_WEIGHT;
	const placed = fills.map((fill) => {
		const start = taken / axis;
		taken += fill.slots;
		return { fill, start };
	});

	return (
		<div className={COLUMN}>
			<ul className={TRACK}>
				{placed.map(({ fill, start }, index) => (
					<Segment
						key={fill.name}
						fill={fill}
						share={fill.slots / axis}
						start={start}
						color={segmentColorOf(index)}
						dimmed={highlighted !== undefined && fill.name !== highlight}
					/>
				))}

				{weight >= axis ? null : (
					<li
						aria-hidden
						style={{ flexGrow: axis - weight }}
						className={ROOM}
					/>
				)}
			</ul>

			{caption ? (
				<Typography variant="hint">
					{highlighted === undefined
						? roomLineOf(weight, held)
						: fillLineOf(highlighted)}
				</Typography>
			) : null}
		</div>
	);
};

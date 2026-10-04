import { useRef } from "react";

import { OF, WEIGHT } from "~/shared/lib/copy";
import { clsx } from "clsx";

import type { KantoColor } from "./colors";
import { leadTextOf, type LeadLine } from "./Lead.ui";
import { Typography } from "./Typography.ui";

const COPY = {
	free: "free",
	overBy: "over by",
	preview: "preview",
	takes: "takes",
	grows: "the build grows to",
} as const;

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "weight-track flex h-7.5 w-full";
const SEGMENT =
	"flex min-w-0 basis-0 items-center justify-center gap-1.5 first:rounded-l-md last:rounded-r-md";
const PADDED = "px-1.5";
const DIMMED = "opacity-35";
const ROOM = "rounded-r-md border border-dashed border-theme-faint";
const INCOMING = "border border-theme bg-hatched-theme text-theme";
const INCOMING_COLOR: KantoColor = "saffron";

const NAME = "truncate text-xs font-bold";
const FIGURE = "shrink-0 text-xs font-bold tabular-nums";

const NAME_SHARE = 0.12;
const FIGURE_SHARE = 0.05;
const MIN_AXIS = 1;
const PREVIEW_CAPTION = "text-theme";

const SEPARATOR = "·";

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
};

export type WeightPreview = {
	name: string;
	slots: number;
	held: number;
};

export type WeightTrackProps = {
	fills: readonly WeightTrackFill[];
	held: number;
	preview?: WeightPreview;
	highlight?: string;
	caption?: boolean;
};

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

export const roomPartsOf = (weight: number, held: number): LeadLine => {
	const load = { figure: `${weight} ${OF} ${held} ${WEIGHT}` };
	const gap = ` ${SEPARATOR} `;

	if (weight > held)
		return [load, gap, { figure: `${COPY.overBy} ${weight - held}` }];

	return [load, gap, { figure: `${held - weight} ${COPY.free}` }];
};

export const roomLineOf = (weight: number, held: number): string =>
	leadTextOf(roomPartsOf(weight, held));

export const previewLineOf = (
	held: number,
	{ name, slots, held: grownTo }: WeightPreview
): string => {
	const takes = `${COPY.preview} ${SEPARATOR} ${name} ${COPY.takes} ${slots} ${WEIGHT}`;
	return grownTo === held ? takes : `${takes}, ${COPY.grows} ${grownTo}`;
};

const fillLineOf = ({ name, slots }: WeightTrackFill) =>
	`${name} ${SEPARATOR} ${slots} ${WEIGHT}`;

const ARRIVED = "weight-fill-new";

const Segment = ({
	fill,
	share,
	color,
	dimmed = false,
	arrived = false,
	incoming = false,
}: {
	fill: WeightTrackFill;
	share: number;
	color: KantoColor;
	dimmed?: boolean;
	arrived?: boolean;
	incoming?: boolean;
}) => {
	const figure = share >= FIGURE_SHARE;
	const named = share >= NAME_SHARE;

	return (
		<li
			style={{ flexGrow: fill.slots }}
			data-screen-theme={color}
			className={clsx(
				SEGMENT,
				incoming ? INCOMING : "segment-theme",
				arrived && ARRIVED,
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
		</li>
	);
};

export const WeightTrack = ({
	fills,
	held,
	preview,
	highlight,
	caption = true,
}: WeightTrackProps) => {
	const weight = weightOf(fills);
	const incoming = preview?.slots ?? 0;
	const axis = Math.max(
		held,
		weight + incoming,
		preview?.held ?? MIN_AXIS,
		MIN_AXIS
	);
	const room = (preview?.held ?? held) - weight - incoming;
	const highlighted = fills.find((fill) => fill.name === highlight);
	const openedWith = useRef(new Set(fills.map((fill) => fill.name)));

	return (
		<div className={COLUMN}>
			<ul className={TRACK}>
				{fills.map((fill, index) => (
					<Segment
						key={fill.name}
						fill={fill}
						share={fill.slots / axis}
						color={segmentColorOf(index)}
						dimmed={highlighted !== undefined && fill.name !== highlight}
						arrived={!openedWith.current.has(fill.name)}
					/>
				))}

				{preview === undefined ? null : (
					<Segment
						fill={preview}
						share={preview.slots / axis}
						color={INCOMING_COLOR}
						incoming
					/>
				)}

				{room <= 0 ? null : (
					<li aria-hidden style={{ flexGrow: room }} className={ROOM} />
				)}
			</ul>

			{preview !== undefined ? (
				<span data-screen-theme={INCOMING_COLOR} className={PREVIEW_CAPTION}>
					<Typography variant="hint">{previewLineOf(held, preview)}</Typography>
				</span>
			) : !caption ? null : (
				<Typography variant="hint">
					{highlighted === undefined
						? roomLineOf(weight, held)
						: fillLineOf(highlighted)}
				</Typography>
			)}
		</div>
	);
};

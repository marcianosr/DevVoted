import { OF, WEIGHT } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { kbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "./colors";
import type { LeadLine, LeadPart } from "./Lead.ui";
import { Typography } from "./Typography.ui";
import { upkeepLabelOf } from "./upkeep";

const COPY = {
	free: "free",
	overBy: "over by",
	beforeBill: "before the bill becomes",
	current: "Current:",
	afterInstall: "After install:",
} as const;

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "flex h-7.5 w-full";
const SEGMENT =
	"flex min-w-0 basis-0 items-center justify-center gap-1.5 first:rounded-l-md last:rounded-r-md";
const PADDED = "px-1.5";
const DIMMED = "opacity-35";
const ROOM = "rounded-r-md border border-dashed border-theme-faint";
const PREVIEW_ROOM = "rounded-r-md border border-theme-soft bg-hatched-theme";

const NAME = "truncate text-xs font-bold";
const FIGURE = "shrink-0 text-xs font-bold tabular-nums";

const NAME_SHARE = 0.12;
const FIGURE_SHARE = 0.05;
const MIN_AXIS = 1;
const NO_UPKEEP = 0;
const PREVIEW_LINE = "block tabular-nums";

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

export type NextRung = { weight: number; kb: number };

export type WeightPreview = {
	weight: number;
	held: number;
	perGateKb: number;
};

export type WeightTrackProps = {
	fills: readonly WeightTrackFill[];
	held: number;
	next?: NextRung;
	preview?: WeightPreview;
	perGateKb?: number;
	highlight?: string;
	caption?: boolean;
};

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

export const roomPartsOf = (
	weight: number,
	held: number,
	next?: NextRung
): LeadLine => {
	const load = { figure: `${weight} ${OF} ${held} ${WEIGHT}` };
	const gap = ` ${SEPARATOR} `;

	if (weight > held)
		return [load, gap, { figure: `${COPY.overBy} ${weight - held}` }];

	const spare = { figure: `${held - weight} ${COPY.free}` };
	if (next === undefined) return [load, gap, spare];

	return [
		load,
		gap,
		spare,
		` ${COPY.beforeBill} `,
		{ figure: kbLabel(next.kb) },
	];
};

const textOf = (part: LeadPart): string =>
	typeof part === "string" ? part : (part.figure ?? "");

export const roomLineOf = (
	weight: number,
	held: number,
	next?: NextRung
): string => roomPartsOf(weight, held, next).map(textOf).join("");

export const previewLinesOf = (
	weight: number,
	held: number,
	perGateKb: number,
	preview: WeightPreview
): readonly string[] => [
	`${COPY.current} ${weight} ${OF} ${held} ${SEPARATOR} ${upkeepLabelOf(perGateKb)}`,
	`${COPY.afterInstall} ${preview.weight} ${OF} ${preview.held} ${SEPARATOR} ${upkeepLabelOf(preview.perGateKb)}`,
];

const fillLineOf = ({ name, slots }: WeightTrackFill) =>
	`${name} ${SEPARATOR} ${slots} ${WEIGHT}`;

const Segment = ({
	fill,
	share,
	color,
	dimmed,
}: {
	fill: WeightTrackFill;
	share: number;
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
		</li>
	);
};

export const WeightTrack = ({
	fills,
	held,
	next,
	preview,
	perGateKb = NO_UPKEEP,
	highlight,
	caption = true,
}: WeightTrackProps) => {
	const weight = weightOf(fills);
	const axis = Math.max(held, weight, preview?.held ?? MIN_AXIS, MIN_AXIS);
	const highlighted = fills.find((fill) => fill.name === highlight);

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
					/>
				))}

				{weight >= held ? null : (
					<li
						aria-hidden
						style={{ flexGrow: held - weight }}
						className={ROOM}
					/>
				)}

				{preview === undefined || axis <= held ? null : (
					<li
						aria-hidden
						style={{ flexGrow: axis - Math.max(weight, held) }}
						className={PREVIEW_ROOM}
					/>
				)}
			</ul>

			{!caption ? null : preview !== undefined ? (
				<Typography variant="hint">
					{previewLinesOf(weight, held, perGateKb, preview).map((line) => (
						<span key={line} className={PREVIEW_LINE}>
							{line}
						</span>
					))}
				</Typography>
			) : (
				<Typography variant="hint">
					{highlighted === undefined
						? roomLineOf(weight, held, next)
						: fillLineOf(highlighted)}
				</Typography>
			)}
		</div>
	);
};

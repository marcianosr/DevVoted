import { WEIGHT } from "~/shared/lib/copy";
import { clsx } from "clsx";

import { kbLabel } from "~/shared/lib/storage";

import type { KantoColor } from "./colors";
import { ConfigInfo, type ConfigInfoProps } from "./ConfigInfo.ui";
import type { LeadLine, LeadPart } from "./Lead.ui";
import { Typography } from "./Typography.ui";
import { upkeepLabelOf } from "./upkeep";

const COPY = {
	of: "of",
	free: "free",
	overBy: "over by",
	beforeBill: "before the bill becomes",
	current: "Current:",
	afterInstall: "After install:",
} as const;

const COLUMN = "flex w-full flex-col gap-1.5";
const TRACK = "flex h-7.5 w-full";
const SEGMENT =
	"group/info relative flex min-w-0 basis-0 items-center justify-center gap-1.5 first:rounded-l-md last:rounded-r-md";
const PADDED = "px-1.5";
const DIMMED = "opacity-35";
const ROOM = "rounded-r-md border border-dashed border-theme-faint";
/**
 * Room the build would grow into, not room it holds. Hatched rather than dashed
 * under the app.css law: dashed is space you can fill at a price already paid,
 * and this is space that costs more the moment it is filled.
 */
const PREVIEW_ROOM = "rounded-r-md border border-theme-soft bg-hatched-theme";

const NAME = "truncate text-xs font-bold";
const FIGURE = "shrink-0 text-xs font-bold tabular-nums";

/**
 * A phone gets a sheet, the same as `Tooltip` and `ConfigChip`. A segment here
 * is `basis-0` and often only a few pixels wide, so anchoring a `w-80` panel to
 * one put most of it past the screen with nothing to scroll it back — the worst
 * case of the problem those two already solved. From `sm` it anchors again.
 */
const PANEL =
	"fixed inset-x-4 bottom-4 z-30 transition-opacity sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:mt-2";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/info:visible group-hover/info:opacity-100 group-has-[:focus-visible]/info:visible group-has-[:focus-visible]/info:opacity-100";

const ALIGN_START = "sm:left-0";
const ALIGN_END = "sm:right-0";

const NAME_SHARE = 0.12;
const FIGURE_SHARE = 0.05;
const PAST_THE_MIDDLE = 0.5;
const MIN_AXIS = 1;
const NO_WEIGHT = 0;
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
	info?: ConfigInfoProps;
};

/** The rung the build would cross into next, and what it would then bill. */
export type NextRung = { weight: number; kb: number };

/** What an offer under consideration would do to the track (ADR-098). */
export type WeightPreview = {
	weight: number;
	held: number;
	perGateKb: number;
};

export type WeightTrackProps = {
	fills: readonly WeightTrackFill[];
	/** The build space the run rents — derived from the build it draws (ADR-098). */
	held: number;
	next?: NextRung;
	preview?: WeightPreview;
	perGateKb?: number;
	highlight?: string;
	caption?: boolean;
};

const weightOf = (fills: readonly WeightTrackFill[]) =>
	fills.reduce((total, fill) => total + fill.slots, 0);

/**
 * The room line broken into its badge-worthy figures. `roomLineOf` is the same
 * line flattened, so the two can never drift: a surface that wants badges and a
 * surface that wants a string are reading one sentence (ADR-102, ADR-066).
 */
export const roomPartsOf = (
	weight: number,
	held: number,
	next?: NextRung
): LeadLine => {
	const load = { figure: `${weight} ${COPY.of} ${held} ${WEIGHT}` };
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

/**
 * The two lines an armed offer draws. Stated as a before and an after rather
 * than a delta: the standing bill is the number the player has to weigh, and a
 * "+16 KB" makes them do the addition to find it.
 */
export const previewLinesOf = (
	weight: number,
	held: number,
	perGateKb: number,
	preview: WeightPreview
): readonly string[] => [
	`${COPY.current} ${weight} ${COPY.of} ${held} ${SEPARATOR} ${upkeepLabelOf(perGateKb)}`,
	`${COPY.afterInstall} ${preview.weight} ${COPY.of} ${preview.held} ${SEPARATOR} ${upkeepLabelOf(preview.perGateKb)}`,
];

const fillLineOf = ({ name, slots }: WeightTrackFill) =>
	`${name} ${SEPARATOR} ${slots} ${WEIGHT}`;

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
	next,
	preview,
	perGateKb = NO_UPKEEP,
	highlight,
	caption = true,
}: WeightTrackProps) => {
	const weight = weightOf(fills);
	const axis = Math.max(held, weight, preview?.held ?? MIN_AXIS, MIN_AXIS);
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

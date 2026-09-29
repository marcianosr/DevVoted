import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { Balance, type BalanceProps } from "./Balance.ui";
import { CoverageBar, type CoverageBarProps } from "./CoverageBar.ui";
import { CoverageRing, type CoverageRingProps } from "./CoverageRing.ui";
import { Meter, type MeterProps } from "./Meter.ui";
import { Swatch, type SwatchFill, type SwatchState } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

const HEADER = "flex flex-col gap-4";
const BELOW = "flex w-full flex-col gap-4";
const RINGED = "flex items-center gap-5";
const SPAN = "w-full";
const PINNED =
	"w-full md:sticky md:top-0 md:z-20 md:-mx-8 md:-mt-6 md:-mb-3 md:w-auto md:border-b md:border-theme-faint md:bg-theme-faint md:px-8 md:pt-6 md:pb-3";
const ROWS = "flex min-w-0 flex-1 flex-col gap-4";
const TITLE_ROW = "flex items-center gap-3";
const TITLE_END = "ml-auto flex shrink-0 items-center gap-2";
const HELD =
	"flex shrink-0 items-center gap-1.5 rounded-md border border-theme-faint bg-theme-raised px-2 py-1 text-xs font-bold text-theme-soft";
const HELD_MARK = "text-theme";
const HELD_TRAIL = "text-theme-muted";

const HELD_COLOR = "cinnabar";
const HELD_GLYPH = "!";
const HELD_WORD = "held";
const TRACK_ROW = "flex w-full items-center gap-4";
const NOTE = "shrink-0 text-xs text-theme-faint opacity-60";
const NOTE_AT_END = "ml-auto";

const COVERAGE = "ml-auto flex shrink-0 items-center gap-2 text-sm";
const COVERAGE_LABEL = "font-bold text-theme";
const COVERAGE_OF = "text-theme-muted";

const SWATCH_SIZE = "small";

const OF = "of";

export const gateTitleOf = (swatch: GateSwatch): string =>
	`#${swatch.gate} - ${swatch.gateName} Gate`;

export type HeaderCoverage = {
	label: string;
	held: string;
	demand: string;
	meter: MeterProps;
};

export type NotePlacement = "end" | "track";

const PLACEMENT = {
	end: NOTE_AT_END,
	track: undefined,
} satisfies Record<NotePlacement, string | undefined>;

type HeaderReading =
	| { ring: CoverageRingProps; bar?: never; coverage?: never }
	| { bar: CoverageBarProps; ring?: never; coverage?: never }
	| { coverage?: HeaderCoverage; ring?: never; bar?: never };

export type HeaderProps = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	funds?: BalanceProps;
	title?: string;
	subtitle?: string;
	badge?: string;
	held?: string;
	swatchState?: SwatchState;
	note?: string;
	noteAt?: NotePlacement;
	pinned?: boolean;
} & HeaderReading;

export const Header = ({
	swatch,
	swatches,
	funds,
	title,
	subtitle,
	badge,
	held,
	swatchState = "discovered",
	note,
	noteAt = "end",
	pinned = false,
	...reading
}: HeaderProps) => {
	const seat = pinned ? PINNED : SPAN;

	const titleRow = (
		<div className={TITLE_ROW}>
			<Swatch state={swatchState} swatch={swatch} size={SWATCH_SIZE} />
			<Typography variant="title">{title ?? gateTitleOf(swatch)}</Typography>
			{subtitle === undefined ? null : (
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			)}
			{badge === undefined ? null : <Badge>{badge}</Badge>}
			{held === undefined && funds === undefined ? null : (
				<span className={TITLE_END}>
					{held === undefined ? null : (
						<span data-screen-theme={HELD_COLOR} className={HELD}>
							<span aria-hidden className={HELD_MARK}>
								{HELD_GLYPH}
							</span>
							{held}
							<span className={HELD_TRAIL}>{HELD_WORD}</span>
						</span>
					)}
					{funds === undefined ? null : (
						<Balance {...funds} layout={pinned ? "inline" : "stacked"} />
					)}
				</span>
			)}
		</div>
	);

	const trackRow = (
		<div className={TRACK_ROW}>
			<SwatchTrack swatches={swatches} size={SWATCH_SIZE} />
			{note === undefined ? null : (
				<span className={clsx(NOTE, PLACEMENT[noteAt])}>{note}</span>
			)}
			{reading.coverage === undefined ? null : (
				<span className={COVERAGE}>
					<span className={COVERAGE_LABEL}>{reading.coverage.label}</span>
					<Badge>{reading.coverage.held}</Badge>
					<span className={COVERAGE_OF}>{OF}</span>
					<Badge>{reading.coverage.demand}</Badge>
				</span>
			)}
		</div>
	);

	const rows = (
		<>
			{titleRow}
			{trackRow}
		</>
	);

	if (pinned)
		return (
			<>
				<header className={PINNED}>{titleRow}</header>
				<div className={BELOW}>
					{reading.ring === undefined ? (
						trackRow
					) : (
						<div className={RINGED}>
							<CoverageRing {...reading.ring} />
							<div className={ROWS}>{trackRow}</div>
						</div>
					)}
					{reading.bar === undefined ? null : <CoverageBar {...reading.bar} />}
					{reading.coverage === undefined ? null : (
						<Meter {...reading.coverage.meter} />
					)}
				</div>
			</>
		);

	if (reading.ring !== undefined)
		return (
			<header className={clsx(RINGED, seat)}>
				<CoverageRing {...reading.ring} />
				<div className={ROWS}>{rows}</div>
			</header>
		);

	if (reading.bar !== undefined)
		return (
			<header className={clsx(HEADER, seat)}>
				{rows}
				<CoverageBar {...reading.bar} />
			</header>
		);

	return (
		<header className={clsx(HEADER, seat)}>
			{rows}
			{reading.coverage === undefined ? null : (
				<Meter {...reading.coverage.meter} />
			)}
		</header>
	);
};

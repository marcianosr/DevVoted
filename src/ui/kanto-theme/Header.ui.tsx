import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import type { BalanceProps } from "./Balance.ui";
import { CoverageBar, type CoverageBarProps } from "./CoverageBar.ui";
import { CoverageRing, type CoverageRingProps } from "./CoverageRing.ui";
import { Figures } from "./Figures.ui";
import type { FoldBadge } from "./Fold.ui";
import { Meter, type MeterProps } from "./Meter.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import { useNavRun } from "./useNavRun.hook";

const HEADER = "flex w-full flex-col gap-4";
const RINGED = "flex w-full items-center gap-5";
const ROWS = "flex min-w-0 flex-1 flex-col gap-4";
const TITLE_ROW = "flex flex-wrap items-center gap-3";
const TITLE_BLOCK =
	"grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1";
const SUBTITLE = "col-start-2";
const TITLE_SWATCH = "row-span-2 flex self-center";
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

const OF = "of";

export const gateTitleOf = (swatch: GateSwatch): string =>
	`${swatch.gateName} Gate`;

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

const hasTrackRow = (
	note: string | undefined,
	coverage: HeaderCoverage | undefined
): boolean => note !== undefined || coverage !== undefined;

export type HeaderProps = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	funds?: BalanceProps;
	title?: string;
	subtitle?: string;
	badges?: readonly FoldBadge[];
	held?: string;
	note?: string;
	noteAt?: NotePlacement;
	noteFigures?: boolean;
} & HeaderReading;

export const Header = ({
	swatch,
	swatches,
	funds,
	title,
	subtitle,
	badges = [],
	held,
	note,
	noteAt = "end",
	noteFigures = false,
	...reading
}: HeaderProps) => {
	useNavRun({ swatches, funds });

	const rows = (
		<>
			<div className={TITLE_ROW}>
				<div className={TITLE_BLOCK}>
					<span className={subtitle === undefined ? undefined : TITLE_SWATCH}>
						<Swatch state="current" swatch={swatch} />
					</span>
					<Typography variant="headline">
						{title ?? gateTitleOf(swatch)}
					</Typography>
					{subtitle === undefined ? null : (
						<span className={SUBTITLE}>
							<Typography variant="caption" as="p">
								{subtitle}
							</Typography>
						</span>
					)}
				</div>
				{badges.map((badge) => (
					<Badge key={badge.label} color={badge.color}>
						{badge.label}
					</Badge>
				))}
				{held === undefined ? null : (
					<span className={TITLE_END}>
						<span data-screen-theme={HELD_COLOR} className={HELD}>
							<span aria-hidden className={HELD_MARK}>
								{HELD_GLYPH}
							</span>
							{held}
							<span className={HELD_TRAIL}>{HELD_WORD}</span>
						</span>
					</span>
				)}
			</div>
			{!hasTrackRow(note, reading.coverage) ? null : (
				<div className={TRACK_ROW}>
					{note === undefined ? null : (
						<span className={clsx(NOTE, PLACEMENT[noteAt])}>
							{noteFigures ? <Figures text={note} /> : note}
						</span>
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
			)}
		</>
	);

	if (reading.ring !== undefined)
		return (
			<header className={RINGED}>
				<CoverageRing {...reading.ring} />
				<div className={ROWS}>{rows}</div>
			</header>
		);

	return (
		<header className={HEADER}>
			{rows}
			{reading.bar === undefined ? null : <CoverageBar {...reading.bar} />}
			{reading.coverage === undefined ? null : (
				<Meter {...reading.coverage.meter} />
			)}
		</header>
	);
};

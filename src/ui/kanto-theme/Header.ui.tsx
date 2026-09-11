import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { CoverageRing, type CoverageRingProps } from "./CoverageRing.ui";
import { Meter, type MeterProps } from "./Meter.ui";
import { Swatch, type SwatchFill, type SwatchState } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";

const HEADER = "flex w-full flex-col gap-4";
const RINGED = "flex w-full items-center gap-5";
const ROWS = "flex min-w-0 flex-1 flex-col gap-4";
const TITLE_ROW = "flex items-center gap-3";
const TRACK_ROW = "flex w-full items-center gap-4";
const NOTE = "shrink-0 text-xs text-theme-faint opacity-60";
const NOTE_AT_END = "ml-auto";

const FUNDS = "ml-auto flex shrink-0 items-center gap-1.5 text-sm";
const FUNDS_LABEL = "font-bold text-theme";

const COVERAGE = "ml-auto flex shrink-0 items-center gap-2 text-sm";
const COVERAGE_LABEL = "font-bold text-theme";
const COVERAGE_OF = "text-theme-muted";

const NAME_SEPARATOR = "·";
const SWATCH_SIZE = "small";

const OF = "of";

export type HeaderFunds = { amount: string; unit: string; label: string };

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
	| { ring: CoverageRingProps; coverage?: never }
	| { coverage?: HeaderCoverage; ring?: never };

export type HeaderProps = {
	swatch: GateSwatch;
	gateCount: number;
	swatches: readonly SwatchFill[];
	funds?: HeaderFunds;
	title?: string;
	subtitle?: string;
	badge?: string;
	swatchState?: SwatchState;
	note?: string;
	noteAt?: NotePlacement;
} & HeaderReading;

export const Header = ({
	swatch,
	gateCount,
	swatches,
	funds,
	title,
	subtitle,
	badge,
	swatchState = "discovered",
	note,
	noteAt = "end",
	...reading
}: HeaderProps) => {
	const rows = (
		<>
			<div className={TITLE_ROW}>
				<Swatch state={swatchState} swatch={swatch} size={SWATCH_SIZE} />
				<Typography variant="title">
					{title ?? `Gate ${swatch.gate} ${NAME_SEPARATOR} ${swatch.gateName}`}
				</Typography>
				{subtitle === undefined ? null : (
					<Typography variant="hint" as="span">
						{subtitle}
					</Typography>
				)}
				{badge === undefined ? null : <Badge>{badge}</Badge>}
				{funds === undefined ? null : (
					<span className={FUNDS}>
						<Badge>{`${funds.amount} ${funds.unit}`}</Badge>
						<span className={FUNDS_LABEL}>{funds.label}</span>
					</span>
				)}
			</div>
			<div className={TRACK_ROW}>
				<SwatchTrack swatches={swatches} size={SWATCH_SIZE} />
				<span className={clsx(NOTE, PLACEMENT[noteAt])}>
					{note ?? `gate ${swatch.gate} / ${gateCount}`}
				</span>
				{reading.coverage === undefined ? null : (
					<span className={COVERAGE}>
						<span className={COVERAGE_LABEL}>{reading.coverage.label}</span>
						<Badge>{reading.coverage.held}</Badge>
						<span className={COVERAGE_OF}>{OF}</span>
						<Badge>{reading.coverage.demand}</Badge>
					</span>
				)}
			</div>
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
			{reading.coverage === undefined ? null : (
				<Meter {...reading.coverage.meter} />
			)}
		</header>
	);
};

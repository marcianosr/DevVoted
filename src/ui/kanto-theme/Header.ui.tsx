import { type CSSProperties, useEffect, useState } from "react";

import { clsx } from "clsx";

import { signedKbLabel } from "~/shared/lib/storage";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { Badge } from "./Badge.ui";
import { CoverageBar, type CoverageBarProps } from "./CoverageBar.ui";
import { CoverageRing, type CoverageRingProps } from "./CoverageRing.ui";
import type { KantoColor } from "./colors";
import { Icon } from "./Icon.ui";
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

const FUNDS =
	"balance-readout relative ml-auto flex shrink-0 flex-col items-end gap-0.5";
const FUNDS_FIGURE =
	"balance-figure flex items-baseline gap-1 font-bold text-theme tabular-nums";
const FUNDS_AMOUNT = "text-display leading-none";
const FUNDS_COUNT = "balance-count";
const FUNDS_UNIT = "text-xs text-theme-muted";
const FUNDS_LABEL = "flex items-center gap-1 text-xs font-bold text-theme";
const FUNDS_PREVIEW = "flex items-center gap-1 text-xs text-theme-muted";
const FUNDS_PREVIEW_FIGURE = "font-bold tabular-nums text-theme";
const FUNDS_PILL =
	"callout badge-theme absolute right-0 bottom-full mb-1 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums";

const COVERAGE = "ml-auto flex shrink-0 items-center gap-2 text-sm";
const COVERAGE_LABEL = "font-bold text-theme";
const COVERAGE_OF = "text-theme-muted";

const SWATCH_SIZE = "small";

const OF = "of";
const TOWARD = "\u2192";

/**
 * The one spelling of a gate's name, exported so a viewmodel that has to state
 * it in prose reads it off the same formatter the header draws.
 */
export const gateTitleOf = (swatch: GateSwatch): string =>
	`#${swatch.gate} - ${swatch.gateName} Gate`;

/**
 * What the balance would read if the thing the player is pointing at went
 * through. The wording is the caller's because the run state picks it
 * (ADR-102); the arrow between the two halves is the readout's own.
 */
export type HeaderFundsPreview = {
	label: string;
	figure: string;
	color: KantoColor;
};

export type HeaderFunds = {
	amount: string;
	unit: string;
	label: string;
	/** The balance itself, so the readout can tell which way it just moved. */
	kb: number;
	preview?: HeaderFundsPreview;
};

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
	funds?: HeaderFunds;
	title?: string;
	subtitle?: string;
	badge?: string;
	swatchState?: SwatchState;
	note?: string;
	noteAt?: NotePlacement;
} & HeaderReading;

/** How long the pill naming a change stays up. Matches --callout-duration. */
export const BALANCE_PILL_HOLD_MS = 1800;

const GAIN: KantoColor = "viridian";
const LOSS: KantoColor = "cinnabar";

type CountStyle = CSSProperties & Record<"--balance-count", number>;

const countStyle = (whole: number): CountStyle => ({
	"--balance-count": whole,
});

const toneOf = (moved: number | undefined): KantoColor | undefined => {
	if (moved === undefined) return undefined;
	return moved > 0 ? GAIN : LOSS;
};

/**
 * What the readout last settled on. `moved` is the change still being named;
 * `counts` is false across a unit roll, where climbing 999 KB to 1.9 MB would
 * otherwise animate the digits downwards.
 */
type Landing = {
	kb: number;
	unit: string;
	moved?: number;
	counts: boolean;
};

const landedAt = (funds: HeaderFunds): Landing => ({
	kb: funds.kb,
	unit: funds.unit,
	counts: false,
});

const FundsReadout = ({ funds }: { funds: HeaderFunds }) => {
	const [landed, setLanded] = useState<Landing>(() => landedAt(funds));

	if (landed.kb !== funds.kb)
		setLanded({
			kb: funds.kb,
			unit: funds.unit,
			moved: funds.kb - landed.kb,
			counts: landed.unit === funds.unit,
		});

	useEffect(() => {
		if (landed.moved === undefined) return;

		const hold = setTimeout(
			() => setLanded((settled) => ({ ...settled, moved: undefined })),
			BALANCE_PILL_HOLD_MS
		);
		return () => clearTimeout(hold);
	}, [landed]);

	const [whole, fraction] = funds.amount.split(".");
	const tone = toneOf(landed.moved);

	return (
		<span className={FUNDS}>
			{landed.moved === undefined ? null : (
				<span role="status" className={FUNDS_PILL} data-screen-theme={tone}>
					{signedKbLabel(landed.moved)}
				</span>
			)}
			<span
				role="img"
				aria-label={`${funds.amount} ${funds.unit}`}
				className={FUNDS_FIGURE}
				data-screen-theme={tone}
			>
				<span className={FUNDS_AMOUNT}>
					<span
						className={FUNDS_COUNT}
						data-counts={landed.counts}
						style={countStyle(Number(whole))}
					/>
					{fraction === undefined ? null : `.${fraction}`}
				</span>
				<span className={FUNDS_UNIT}>{funds.unit}</span>
			</span>
			<span className={FUNDS_LABEL}>
				<Icon name="floppy" />
				{funds.label}
			</span>
			{funds.preview === undefined ? null : (
				<span className={FUNDS_PREVIEW}>
					{`${funds.preview.label} ${TOWARD}`}
					<span
						className={FUNDS_PREVIEW_FIGURE}
						data-screen-theme={funds.preview.color}
					>
						{funds.preview.figure}
					</span>
				</span>
			)}
		</span>
	);
};

export const Header = ({
	swatch,
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
				<Typography variant="title">{title ?? gateTitleOf(swatch)}</Typography>
				{subtitle === undefined ? null : (
					<Typography variant="hint" as="span">
						{subtitle}
					</Typography>
				)}
				{badge === undefined ? null : <Badge>{badge}</Badge>}
				{funds === undefined ? null : <FundsReadout funds={funds} />}
			</div>
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
		</>
	);

	if (reading.ring !== undefined)
		return (
			<header className={RINGED}>
				<CoverageRing {...reading.ring} />
				<div className={ROWS}>{rows}</div>
			</header>
		);

	if (reading.bar !== undefined)
		return (
			<header className={HEADER}>
				{rows}
				<CoverageBar {...reading.bar} />
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

import { type CSSProperties, useEffect, useState } from "react";

import { clsx } from "clsx";

import { kbLabel, signedKbLabel } from "~/shared/lib/storage";

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

export const gateTitleOf = (swatch: GateSwatch): string =>
	`#${swatch.gate} - ${swatch.gateName} Gate`;

export type HeaderFundsPreview = {
	label: string;
	figure: string;
	color: KantoColor;
};

export type HeaderFunds = {
	label: string;
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

type Reading = { readonly amount: string; readonly unit: string };

const readingOf = (kb: number): Reading => {
	const [amount, unit] = kbLabel(kb).split(" ");
	return { amount, unit };
};

type Move = {
	readonly id: number;
	readonly kb: number;
	readonly unit: string;
	readonly moved: number;
	readonly counts: boolean;
};

type Landing = {
	readonly settled: { readonly kb: number; readonly unit: string };
	readonly moves: readonly Move[];
	readonly nextId: number;
};

const seededAt = (kb: number): Landing => ({
	settled: { kb, unit: readingOf(kb).unit },
	moves: [],
	nextId: 0,
});

const enqueued = (landed: Landing, kb: number): Landing => {
	const { unit } = readingOf(kb);
	return {
		settled: { kb, unit },
		moves: [
			...landed.moves,
			{
				id: landed.nextId,
				kb,
				unit,
				moved: kb - landed.settled.kb,
				counts: landed.settled.unit === unit,
			},
		],
		nextId: landed.nextId + 1,
	};
};

const retired = (landed: Landing): Landing => ({
	...landed,
	moves: landed.moves.slice(1),
});

const FundsReadout = ({ funds }: { funds: HeaderFunds }) => {
	const [landed, setLanded] = useState<Landing>(() => seededAt(funds.kb));

	if (landed.settled.kb !== funds.kb) setLanded(enqueued(landed, funds.kb));

	const [playing] = landed.moves;

	useEffect(() => {
		if (playing === undefined) return;

		const hold = setTimeout(() => setLanded(retired), BALANCE_PILL_HOLD_MS);
		return () => clearTimeout(hold);
	}, [playing]);

	const { amount, unit } = readingOf(playing?.kb ?? funds.kb);
	const [whole, fraction] = amount.split(".");
	const tone = toneOf(playing?.moved);
	const preview = playing === undefined ? funds.preview : undefined;

	return (
		<span className={FUNDS}>
			{playing === undefined ? null : (
				<span
					key={playing.id}
					role="status"
					className={FUNDS_PILL}
					data-screen-theme={tone}
				>
					{signedKbLabel(playing.moved)}
				</span>
			)}
			<span
				role="img"
				aria-label={`${amount} ${unit}`}
				className={FUNDS_FIGURE}
				data-screen-theme={tone}
			>
				<span className={FUNDS_AMOUNT}>
					<span
						className={FUNDS_COUNT}
						data-counts={playing?.counts ?? false}
						style={countStyle(Number(whole))}
					/>
					{fraction === undefined ? null : `.${fraction}`}
				</span>
				<span className={FUNDS_UNIT}>{unit}</span>
			</span>
			<span className={FUNDS_LABEL}>
				<Icon name="floppy" />
				{funds.label}
			</span>
			{preview === undefined ? null : (
				<span className={FUNDS_PREVIEW}>
					{`${preview.label} ${TOWARD}`}
					<span
						className={FUNDS_PREVIEW_FIGURE}
						data-screen-theme={preview.color}
					>
						{preview.figure}
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

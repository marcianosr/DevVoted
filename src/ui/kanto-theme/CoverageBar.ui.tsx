import type { CoverageBandId } from "~/modules/run/build/domain/coverageRatio.model";
import { NEEDED } from "~/shared/lib/copy";
import { type CSSProperties, useEffect, useRef } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const COPY = {
	of: "of",
} as const;

const LAYOUT = "coverage-bar @container flex w-full flex-col gap-1.5";
const GAUGE = "relative block h-7.5 w-full";
const LAYER = "grid h-full w-full overflow-hidden rounded-lg";
const DIM_LAYER = "relative";
const LIT_LAYER = "coverage-bar-lit absolute inset-0";
const ZONE_SEAM = "border-l-2 border-black first:border-l-0";
const DIM_ZONE = `coverage-bar-zone h-full bg-theme-dim ${ZONE_SEAM}`;
const LIT_ZONE = `h-full bg-theme-lit ${ZONE_SEAM}`;
const CAP =
	"coverage-bar-cap absolute inset-y-0 right-0 w-2 border-l-2 border-black";
const DIM_CAP = `${CAP} bg-theme-dim`;
const LIT_CAP = `${CAP} bg-theme-lit`;
const MARKER =
	"coverage-bar-marker absolute -inset-y-1.5 w-[3px] -translate-x-px rounded-xs bg-pallet";
const GHOST =
	"coverage-bar-ghost absolute -inset-y-1 w-0 border-l-2 border-dashed border-pewter";
const MARKS = "relative h-4 w-full";
const TICKS = "relative h-8 w-full @max-[500px]:h-4";
const MARK = "absolute text-xxs whitespace-nowrap text-theme-muted";
const TICK =
	"absolute flex flex-col text-xxs whitespace-nowrap text-theme-muted";
const TICK_FIGURE = "text-xs font-bold text-theme-faint";
const TICK_WORD = "@max-[500px]:hidden";
const PINS = "relative h-7 w-full";
const PIN =
	"coverage-bar-pin absolute bottom-0 flex -translate-x-1/2 flex-col items-center gap-0.5";
const PIN_BAND = "flex items-center gap-1";
const PIN_STEM = "h-1.5 w-0.5 bg-theme";
const POINTERS = "relative h-2 w-full";
const POINTER =
	"coverage-bar-pin absolute bottom-0 size-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-theme";
const ANNOUNCE = "sr-only";

const FULL = 100;
const TENTHS = 10;

type MarkAnchor = "start" | "center" | "end";

const ANCHOR_CLASS = {
	start: "items-start",
	center: "-translate-x-1/2 items-center",
	end: "-translate-x-full items-end",
} satisfies Record<MarkAnchor, string>;

type Mark = { at: number; label: string; word?: string; anchor?: MarkAnchor };

const PERCENT = "%";
const SEPARATOR = "·";

export type { CoverageBandId };

export const COVERAGE_BAND_COLOR = {
	danger: "cinnabar",
	shaky: "vermillion",
	ok: "saffron",
	healthy: "viridian",
	perfect: "cerulean",
} satisfies Record<CoverageBandId, KantoColor>;

export const COVERAGE_BAND_WORD = {
	danger: "DANGER",
	shaky: "SHAKY",
	ok: "OK",
	healthy: "HEALTHY",
	perfect: "PERFECT",
} satisfies Record<CoverageBandId, string>;

const toTenth = (value: number) =>
	Math.round(Math.max(0, value) * TENTHS) / TENTHS;

const clamped = (value: number) =>
	Number.isFinite(value) ? Math.min(FULL, Math.max(0, value)) : 0;

const percentOf = (value: number) => `${value}${PERCENT}`;

type HeldStyle = CSSProperties & Record<"--coverage-held", string>;

const heldStyle = (percent: number): HeldStyle => ({
	"--coverage-held": percentOf(percent),
});

export type CoverageLadder = { floor: number; ok: number; healthy: number };

const rungsOf = ({ floor, ok, healthy }: CoverageLadder): CoverageLadder => ({
	floor: clamped(floor),
	ok: clamped(Math.max(floor, ok)),
	healthy: clamped(Math.max(ok, healthy)),
});

type SpokenFigures = {
	held: string;
	needed: string;
};

const spokenFiguresOf = (held: number, healthy: number): SpokenFigures => ({
	held: percentOf(toTenth(held)),
	needed: percentOf(toTenth(healthy)),
});

export const CoverageReading = ({
	held,
	band,
	...ladder
}: CoverageLadder & Pick<CoverageBarProps, "held" | "band">) => {
	return (
		<>
			<Badge>{spokenFiguresOf(held, rungsOf(ladder).healthy).held}</Badge>
			<Badge color={COVERAGE_BAND_COLOR[band]}>
				{COVERAGE_BAND_WORD[band]}
			</Badge>
		</>
	);
};

const zonesOf = ({ floor, ok, healthy }: CoverageLadder) =>
	[
		{ band: "danger", width: floor },
		{ band: "shaky", width: ok - floor },
		{ band: "ok", width: healthy - ok },
		{ band: "healthy", width: FULL - healthy },
	] satisfies readonly { band: CoverageBandId; width: number }[];

const bandGridOf = (ladder: CoverageLadder): CSSProperties => ({
	gridTemplateColumns: zonesOf(ladder)
		.map((zone) => `${zone.width}fr`)
		.join(" "),
});

const boundaryMarksOf = ({
	floor,
	ok,
	healthy,
}: CoverageLadder): readonly Mark[] =>
	(
		[
			{
				at: floor,
				word: COVERAGE_BAND_WORD.shaky,
				anchor: "end",
				room: ok - floor,
			},
			{
				at: ok,
				word: COVERAGE_BAND_WORD.ok,
				anchor: "center",
				room: healthy - ok,
			},
			{
				at: healthy,
				word: COVERAGE_BAND_WORD.healthy,
				anchor: "start",
				room: FULL - healthy,
			},
			{ at: FULL, word: COVERAGE_BAND_WORD.perfect, anchor: "end", room: FULL },
		] satisfies readonly (Omit<Mark, "label"> & { room: number })[]
	)
		.filter((mark) => mark.at > 0 && mark.room > 0)
		.map(({ room: _room, ...mark }) => ({
			...mark,
			label: percentOf(toTenth(mark.at)),
		}));

const bandMarksOf = (ladder: CoverageLadder): readonly Mark[] => {
	let start = 0;

	return zonesOf(ladder)
		.map((zone) => {
			const mark = {
				at: start + zone.width / 2,
				label: COVERAGE_BAND_WORD[zone.band],
			};
			start += zone.width;
			return { ...mark, width: zone.width };
		})
		.filter((mark) => mark.width > 0);
};

const rungMarksOf = ({ floor, ok, healthy }: CoverageLadder): readonly Mark[] =>
	[...new Set([0, floor, ok, healthy, FULL])]
		.sort((one, other) => one - other)
		.map((at) => ({ at, label: `${toTenth(at)}` }));

const MARKS_OF = {
	bands: bandMarksOf,
	boundaries: boundaryMarksOf,
	rungs: rungMarksOf,
} satisfies Record<CoverageMarks, (ladder: CoverageLadder) => readonly Mark[]>;

const readingOf = ({ held, needed }: SpokenFigures, band: CoverageBandId) =>
	`${held} ${COPY.of} ${needed} ${NEEDED} ${SEPARATOR} ${COVERAGE_BAND_WORD[band]}`;

const useSettle = (settleKey: string | undefined) => {
	const gauge = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (settleKey === undefined) return;
		gauge.current?.getAnimations?.().forEach((animation) => {
			animation.cancel();
			animation.play();
		});
	}, [settleKey]);

	return gauge;
};

export type CoverageMarks = "boundaries" | "bands" | "rungs";

export type CoverageBarProps = {
	held: number;
	band: CoverageBandId;
	floor: number;
	ok: number;
	healthy: number;
	marks?: CoverageMarks;
	pin?: boolean;
	pointer?: boolean;
	note?: string;
	ghostAt?: number;
	settleKey?: string;
};

const MarkRow = ({
	marks,
	ladder,
}: {
	marks: CoverageMarks;
	ladder: CoverageLadder;
}) => (
	<span aria-hidden className={marks === "boundaries" ? TICKS : MARKS}>
		{MARKS_OF[marks](ladder).map((mark) => (
			<span
				key={mark.label}
				style={{ left: percentOf(mark.at) }}
				className={clsx(
					mark.word === undefined ? MARK : TICK,
					ANCHOR_CLASS[mark.anchor ?? "center"]
				)}
			>
				{mark.word === undefined ? (
					mark.label
				) : (
					<>
						<span className={TICK_FIGURE}>{mark.label}</span>
						<span className={TICK_WORD}>{mark.word}</span>
					</>
				)}
			</span>
		))}
	</span>
);

const Pin = ({
	band,
	spoken,
}: {
	band: CoverageBandId;
	spoken: SpokenFigures;
}) => (
	<span aria-hidden className={PINS}>
		<span data-screen-theme={COVERAGE_BAND_COLOR[band]} className={PIN}>
			<Badge color={COVERAGE_BAND_COLOR[band]}>
				<span className={PIN_BAND}>
					{spoken.held}
					<span>{SEPARATOR}</span>
					{COVERAGE_BAND_WORD[band]}
				</span>
			</Badge>
			<span className={PIN_STEM} />
		</span>
	</span>
);

const Pointer = ({ band }: { band: CoverageBandId }) => (
	<span aria-hidden className={POINTERS}>
		<span data-screen-theme={COVERAGE_BAND_COLOR[band]} className={POINTER} />
	</span>
);

const BandLayer = ({
	ladder,
	lit,
}: {
	ladder: CoverageLadder;
	lit: boolean;
}) => (
	<>
		{zonesOf(ladder).map((zone) => (
			<span
				key={zone.band}
				data-screen-theme={COVERAGE_BAND_COLOR[zone.band]}
				className={lit ? LIT_ZONE : DIM_ZONE}
			/>
		))}
		<span
			data-screen-theme={COVERAGE_BAND_COLOR.perfect}
			className={lit ? LIT_CAP : DIM_CAP}
		/>
	</>
);

export const CoverageBar = ({
	held,
	band,
	floor,
	ok,
	healthy,
	marks = "boundaries",
	pin = false,
	pointer = false,
	note,
	ghostAt,
	settleKey,
}: CoverageBarProps) => {
	const ladder = rungsOf({ floor, ok, healthy });
	const spoken = spokenFiguresOf(held, ladder.healthy);
	const gauge = useSettle(settleKey);
	const grid = bandGridOf(ladder);

	return (
		<div style={heldStyle(clamped(held))} className={LAYOUT}>
			{note === undefined ? null : (
				<Typography variant="hint">{note}</Typography>
			)}
			{pointer ? <Pointer band={band} /> : null}
			{pin && !pointer ? <Pin band={band} spoken={spoken} /> : null}
			{pin ? null : (
				<span role="status" className={ANNOUNCE}>
					{spoken.held}
				</span>
			)}
			<span
				ref={gauge}
				className={clsx(
					GAUGE,
					settleKey !== undefined && "coverage-bar-settle"
				)}
			>
				<span
					role="img"
					aria-label={readingOf(spoken, band)}
					style={grid}
					className={clsx(LAYER, DIM_LAYER)}
				>
					<BandLayer ladder={ladder} lit={false} />
				</span>
				<span aria-hidden style={grid} className={clsx(LAYER, LIT_LAYER)}>
					<BandLayer ladder={ladder} lit />
				</span>
				<span
					aria-hidden
					data-shown={ghostAt !== undefined}
					style={{ left: percentOf(clamped(ghostAt ?? 0)) }}
					className={GHOST}
				/>
				<span aria-hidden className={MARKER} />
			</span>
			{pointer ? null : <MarkRow marks={marks} ladder={ladder} />}
		</div>
	);
};

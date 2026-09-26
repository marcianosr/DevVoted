import { NEEDED } from "~/shared/lib/copy";
import { type CSSProperties, useEffect, useState } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const COPY = {
	survive: "survive",
	of: "of",
} as const;

const LAYOUT = "coverage-bar flex w-full flex-col gap-1.5";
const TRACK =
	"relative flex h-6 w-full overflow-hidden rounded-md bg-theme-raised";
const ZONE = "coverage-bar-zone h-full bg-theme/25";
const FILL =
	"coverage-bar-fill absolute inset-y-0 left-0 min-w-0.5 bg-white/10";
const EDGE = "absolute inset-y-0 right-0 w-0.5 bg-theme";
const MARKS = "relative h-3 w-full";
const MARK = "absolute text-xxs whitespace-nowrap text-theme-muted";
const PINS = "relative h-5 w-full";
const PIN =
	"coverage-bar-pin absolute bottom-0 flex -translate-x-1/2 flex-col items-center gap-0.5";
const PIN_LABEL =
	"text-xxs font-bold tabular-nums whitespace-nowrap text-theme-soft";
const PIN_STEM = "h-1.5 w-0.5 bg-theme";
const PIN_COUNT = "coverage-bar-count";
const ANNOUNCE = "sr-only";

const FULL = 100;
const TENTHS = 10;
const HUNDREDTHS = 100;

export const COVERAGE_PIN_HOLD_MS = 1800;

type MarkAnchor = "start" | "center" | "end";

const ANCHOR_CLASS = {
	start: "",
	center: "-translate-x-1/2",
	end: "-translate-x-full",
} satisfies Record<MarkAnchor, string>;

type Mark = { at: number; label: string; anchor?: MarkAnchor };

const PERCENT = "%";
const SEPARATOR = "·";

export type CoverageBandId = "danger" | "shaky" | "ok" | "healthy" | "perfect";

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

const toHundredth = (value: number) =>
	Math.round(Math.max(0, value) * HUNDREDTHS) / HUNDREDTHS;

const clamped = (value: number) =>
	Number.isFinite(value) ? Math.min(FULL, Math.max(0, value)) : 0;

type CountStyle = CSSProperties & Record<"--coverage-count", number>;

const countStyle = (whole: number): CountStyle => ({
	"--coverage-count": whole,
});

type HeldStyle = CSSProperties & Record<"--coverage-held", string>;

const heldStyle = (percent: number): HeldStyle => ({
	"--coverage-held": `${percent}${PERCENT}`,
});

export type CoverageLadder = { floor: number; ok: number; healthy: number };

const rungsOf = ({ floor, ok, healthy }: CoverageLadder): CoverageLadder => ({
	floor: clamped(floor),
	ok: clamped(Math.max(floor, ok)),
	healthy: clamped(Math.max(ok, healthy)),
});

const bandOf = (
	held: number,
	{ floor, ok, healthy }: CoverageLadder
): CoverageBandId => {
	if (held >= FULL) return "perfect";
	if (held >= healthy) return "healthy";
	if (held >= ok) return "ok";
	if (held >= floor) return "shaky";
	return "danger";
};

export type CoverageUnits = { held: number; healthy: number };

type SpokenFigures = {
	headline: string;
	held: string;
	needed: string;
	count: number;
	countSuffix: string;
};

const figuresInPercent = (held: number, healthy: number): SpokenFigures => {
	const figure = `${toTenth(held)}${PERCENT}`;

	return {
		headline: figure,
		held: figure,
		needed: `${toTenth(healthy)}${PERCENT}`,
		count: Math.round(clamped(held)),
		countSuffix: PERCENT,
	};
};

const figuresInUnits = ({ held, healthy }: CoverageUnits): SpokenFigures => {
	const figure = `${toHundredth(held)}`;
	const needed = `${toHundredth(healthy)}`;

	return {
		headline: `${figure} ${COPY.of} ${needed}`,
		held: figure,
		needed,
		count: Math.round(Math.max(0, held)),
		countSuffix: "",
	};
};

const figuresOf = (
	held: number,
	healthy: number,
	units: CoverageUnits | undefined
): SpokenFigures =>
	units === undefined ? figuresInPercent(held, healthy) : figuresInUnits(units);

export const CoverageReading = ({
	held,
	units,
	...ladder
}: CoverageLadder & Pick<CoverageBarProps, "held" | "units">) => {
	const band = coverageBandOf(held, ladder);

	return (
		<>
			<Badge>{figuresOf(held, rungsOf(ladder).healthy, units).headline}</Badge>
			<Badge color={COVERAGE_BAND_COLOR[band]}>
				{COVERAGE_BAND_WORD[band]}
			</Badge>
		</>
	);
};

export const coverageBandOf = (
	held: number,
	ladder: CoverageLadder
): CoverageBandId => bandOf(clamped(held), rungsOf(ladder));

const zonesOf = ({ floor, ok, healthy }: CoverageLadder) =>
	[
		{ band: "danger", width: floor },
		{ band: "shaky", width: ok - floor },
		{ band: "ok", width: healthy - ok },
		{ band: "healthy", width: FULL - healthy },
	] satisfies readonly { band: CoverageBandId; width: number }[];

const boundaryMarksOf = (
	{ floor, ok, healthy }: CoverageLadder,
	{ needed }: SpokenFigures
): readonly Mark[] =>
	(
		[
			{ at: floor, label: COPY.survive, anchor: "end", room: ok - floor },
			{
				at: ok,
				label: COVERAGE_BAND_WORD.ok,
				anchor: "center",
				room: healthy - ok,
			},
			{
				at: healthy,
				label: `${COVERAGE_BAND_WORD.healthy} ${needed}`,
				anchor: "start",
				room: FULL - healthy,
			},
		] satisfies readonly (Mark & { room: number })[]
	)
		.filter((mark) => mark.at > 0 && mark.room > 0)
		.map(({ room: _room, ...mark }) => mark);

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
} satisfies Record<
	CoverageMarks,
	(ladder: CoverageLadder, spoken: SpokenFigures) => readonly Mark[]
>;

const marksOf = (
	ladder: CoverageLadder,
	marks: CoverageMarks,
	spoken: SpokenFigures
) => MARKS_OF[marks](ladder, spoken);

const readingOf = ({ held, needed }: SpokenFigures, band: CoverageBandId) =>
	`${held} ${COPY.of} ${needed} ${NEEDED} ${SEPARATOR} ${COVERAGE_BAND_WORD[band]}`;

export type CoverageMarks = "boundaries" | "bands" | "rungs";

export type CoverageBarProps = {
	held: number;
	floor: number;
	ok: number;
	healthy: number;
	marks?: CoverageMarks;
	pin?: boolean;
	note?: string;
	units?: CoverageUnits;
};

export const CoverageBar = ({
	held,
	floor,
	ok,
	healthy,
	marks = "boundaries",
	pin = false,
	note,
	units,
}: CoverageBarProps) => {
	const ladder = rungsOf({ floor, ok, healthy });
	const reading = clamped(held);
	const band = bandOf(reading, ladder);
	const spoken = figuresOf(held, ladder.healthy, units);

	const [settled, setSettled] = useState(reading);
	const [moved, setMoved] = useState(false);

	if (settled !== reading) {
		setSettled(reading);
		setMoved(true);
	}

	useEffect(() => {
		if (!moved) return;

		const hold = setTimeout(() => setMoved(false), COVERAGE_PIN_HOLD_MS);
		return () => clearTimeout(hold);
	}, [moved, settled]);

	const shown = pin || moved;

	return (
		<div style={heldStyle(reading)} className={LAYOUT}>
			{note === undefined ? null : (
				<Typography variant="hint">{note}</Typography>
			)}
			<span aria-hidden className={PINS}>
				<span
					data-screen-theme={COVERAGE_BAND_COLOR[band]}
					data-shown={shown}
					style={{ left: `${reading}${PERCENT}` }}
					className={PIN}
				>
					<span className={PIN_LABEL}>
						{pin ? (
							spoken.held
						) : (
							<>
								<span className={PIN_COUNT} style={countStyle(spoken.count)} />
								{spoken.countSuffix}
							</>
						)}
					</span>
					<span className={PIN_STEM} />
				</span>
			</span>
			{pin ? null : (
				<span role="status" className={ANNOUNCE}>
					{spoken.held}
				</span>
			)}
			<span role="img" aria-label={readingOf(spoken, band)} className={TRACK}>
				{zonesOf(ladder).map((zone) => (
					<span
						key={zone.band}
						data-screen-theme={COVERAGE_BAND_COLOR[zone.band]}
						style={{ flexBasis: `${zone.width}${PERCENT}` }}
						className={ZONE}
					/>
				))}
				<span data-screen-theme={COVERAGE_BAND_COLOR[band]} className={FILL}>
					<span className={EDGE} />
				</span>
			</span>
			<span aria-hidden className={MARKS}>
				{marksOf(ladder, marks, spoken).map((mark) => (
					<span
						key={mark.label}
						style={{ left: `${mark.at}${PERCENT}` }}
						className={clsx(MARK, ANCHOR_CLASS[mark.anchor ?? "center"])}
					>
						{mark.label}
					</span>
				))}
			</span>
		</div>
	);
};

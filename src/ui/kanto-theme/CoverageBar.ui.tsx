import { NEEDED } from "~/shared/lib/copy";
import { type CSSProperties, useEffect, useState } from "react";

import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const COPY = {
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
const PINS = "relative h-7 w-full";
const PIN =
	"coverage-bar-pin absolute bottom-0 flex -translate-x-1/2 flex-col items-center gap-0.5";
const PIN_BAND = "flex items-center gap-1";
const PIN_STEM = "h-1.5 w-0.5 bg-theme";
const PIN_COUNT = "coverage-bar-count";
const POINTERS = "relative h-2 w-full";
const POINTER =
	"coverage-bar-pin absolute bottom-0 size-0 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent border-t-theme";
const ANNOUNCE = "sr-only";

const FULL = 100;
const TENTHS = 10;

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

type SpokenFigures = {
	held: string;
	needed: string;
	count: number;
};

const spokenFiguresOf = (held: number, healthy: number): SpokenFigures => ({
	held: `${toTenth(held)}${PERCENT}`,
	needed: `${toTenth(healthy)}${PERCENT}`,
	count: Math.round(clamped(held)),
});

export const CoverageReading = ({
	held,
	...ladder
}: CoverageLadder & Pick<CoverageBarProps, "held">) => {
	const band = coverageBandOf(held, ladder);

	return (
		<>
			<Badge>{spokenFiguresOf(held, rungsOf(ladder).healthy).held}</Badge>
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
			{
				at: floor,
				label: COVERAGE_BAND_WORD.shaky,
				anchor: "end",
				room: ok - floor,
			},
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
	pointer?: boolean;
	note?: string;
};

export const CoverageBar = ({
	held,
	floor,
	ok,
	healthy,
	marks = "boundaries",
	pin = false,
	pointer = false,
	note,
}: CoverageBarProps) => {
	const ladder = rungsOf({ floor, ok, healthy });
	const reading = clamped(held);
	const band = bandOf(reading, ladder);
	const spoken = spokenFiguresOf(held, ladder.healthy);

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

	const track = (
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
	);

	return (
		<div style={heldStyle(reading)} className={LAYOUT}>
			{note === undefined ? null : (
				<Typography variant="hint">{note}</Typography>
			)}
			{pointer ? (
				<span aria-hidden className={POINTERS}>
					<span
						data-screen-theme={COVERAGE_BAND_COLOR[band]}
						data-shown
						style={{ left: `${reading}${PERCENT}` }}
						className={POINTER}
					/>
				</span>
			) : (
				<span aria-hidden className={PINS}>
					<span
						data-screen-theme={COVERAGE_BAND_COLOR[band]}
						data-shown={shown}
						style={{ left: `${reading}${PERCENT}` }}
						className={PIN}
					>
						<Badge color={COVERAGE_BAND_COLOR[band]}>
							<span className={PIN_BAND}>
								{pin ? (
									spoken.held
								) : (
									<>
										<span
											className={PIN_COUNT}
											style={countStyle(spoken.count)}
										/>
										{PERCENT}
									</>
								)}
								<span>{SEPARATOR}</span>
								{COVERAGE_BAND_WORD[band]}
							</span>
						</Badge>
						<span className={PIN_STEM} />
					</span>
				</span>
			)}
			{pin ? null : (
				<span role="status" className={ANNOUNCE}>
					{spoken.held}
				</span>
			)}
			{track}
			{pointer ? null : (
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
			)}
		</div>
	);
};

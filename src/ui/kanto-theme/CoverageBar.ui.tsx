import { type CSSProperties, useEffect, useState } from "react";

import type { KantoColor } from "./colors";
import { Typography } from "./Typography.ui";

const LAYOUT = "coverage-bar flex w-full flex-col gap-1.5";
const TRACK =
	"relative flex h-6 w-full overflow-hidden rounded-md bg-theme-raised";
const ZONE = "coverage-bar-zone h-full bg-theme/25";
const FILL =
	"coverage-bar-fill absolute inset-y-0 left-0 min-w-0.5 bg-white/10";
const EDGE = "absolute inset-y-0 right-0 w-0.5 bg-theme";
const MARKS = "relative h-3 w-full";
const MARK =
	"absolute -translate-x-1/2 text-xxs whitespace-nowrap text-theme-muted";
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

export const COVERAGE_PIN_HOLD_MS = 1800;

const SURVIVE = "survive";
const OK_WORD = "OK";
const HEALTHY_WORD = "HEALTHY";
const PERCENT = "%";
const OF = "of";
const READING_SUFFIX = "needed";
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

const clamped = (value: number) => Math.min(FULL, Math.max(0, value));

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

const boundaryMarksOf = ({ floor, ok, healthy }: CoverageLadder) =>
	[
		{ at: floor, label: SURVIVE },
		{ at: ok, label: OK_WORD },
		{ at: healthy, label: `${HEALTHY_WORD} ${toTenth(healthy)}${PERCENT}` },
	].filter((mark) => mark.at > 0);

const bandMarksOf = (ladder: CoverageLadder) => {
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

const rungMarksOf = ({ floor, ok, healthy }: CoverageLadder) =>
	[...new Set([0, floor, ok, healthy, FULL])]
		.sort((one, other) => one - other)
		.map((at) => ({ at, label: `${toTenth(at)}` }));

const MARKS_OF = {
	bands: bandMarksOf,
	boundaries: boundaryMarksOf,
	rungs: rungMarksOf,
} satisfies Record<CoverageMarks, (ladder: CoverageLadder) => unknown>;

const marksOf = (ladder: CoverageLadder, marks: CoverageMarks) =>
	MARKS_OF[marks](ladder);

const readingOf = (held: number, healthy: number, band: CoverageBandId) =>
	`${toTenth(held)}${PERCENT} ${OF} ${toTenth(healthy)}${PERCENT} ${READING_SUFFIX} ${SEPARATOR} ${COVERAGE_BAND_WORD[band]}`;

export type CoverageMarks = "boundaries" | "bands" | "rungs";

export type CoverageBarProps = {
	held: number;
	floor: number;
	ok: number;
	healthy: number;
	marks?: CoverageMarks;
	pin?: boolean;
	note?: string;
};

export const CoverageBar = ({
	held,
	floor,
	ok,
	healthy,
	marks = "boundaries",
	pin = false,
	note,
}: CoverageBarProps) => {
	const ladder = rungsOf({ floor, ok, healthy });
	const reading = clamped(held);
	const band = bandOf(reading, ladder);

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
							toTenth(held)
						) : (
							<span
								className={PIN_COUNT}
								style={countStyle(Math.round(reading))}
							/>
						)}
						{PERCENT}
					</span>
					<span className={PIN_STEM} />
				</span>
			</span>
			{pin ? null : (
				<span role="status" className={ANNOUNCE}>
					{toTenth(held)}
					{PERCENT}
				</span>
			)}
			<span
				role="img"
				aria-label={readingOf(held, ladder.healthy, band)}
				className={TRACK}
			>
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
				{marksOf(ladder, marks).map((mark) => (
					<span
						key={mark.label}
						style={{ left: `${mark.at}${PERCENT}` }}
						className={MARK}
					>
						{mark.label}
					</span>
				))}
			</span>
		</div>
	);
};

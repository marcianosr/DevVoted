import { clsx } from "clsx";

import { Badge } from "./Badge.ui";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	CoverageBar,
	type CoverageBandId,
	type CoverageLadder,
} from "./CoverageBar.ui";

const LAYOUT = "band-ladder flex w-full flex-col gap-3";
const ROWS = "flex w-full flex-col gap-1";
const ROW =
	"band-ladder-row flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1";
const STANDING = "ring-2 ring-theme ring-inset";
const BAND = "flex w-20 shrink-0";
const RANGE = "min-w-0 flex-1 text-xs tabular-nums text-theme-muted";
const PAYS = "ml-auto shrink-0";

const FULL = 100;
const TENTHS = 10;
const PERFECT: CoverageBandId = "perfect";
const RANGE_JOIN = " – ";

export type LadderRung = {
	band: CoverageBandId;
	from: number;
	to: number;
	pays: string;
};

export type BandLadderProps = {
	held: number;
	lines: CoverageLadder;
	rungs: readonly LadderRung[];
};

const toTenth = (value: number) => Math.round(value * TENTHS) / TENTHS;

const clamped = (value: number) =>
	Number.isFinite(value) ? Math.min(FULL, Math.max(0, value)) : 0;

const isCap = (rung: LadderRung) => rung.band === PERFECT;

const standingRungOf = (
	rungs: readonly LadderRung[],
	held: number
): LadderRung | undefined => {
	if (held >= FULL) return rungs.find(isCap) ?? rungs.at(-1);
	return rungs.find(
		(rung) => !isCap(rung) && held >= rung.from && held < rung.to
	);
};

const rangeOf = (rung: LadderRung): string =>
	isCap(rung)
		? `${toTenth(rung.from)}`
		: `${toTenth(rung.from)}${RANGE_JOIN}${toTenth(rung.to)}`;

const Rung = ({ rung, standing }: { rung: LadderRung; standing: boolean }) => {
	const color = COVERAGE_BAND_COLOR[rung.band];

	return (
		<li
			data-screen-theme={color}
			aria-current={standing}
			className={clsx(ROW, standing && STANDING)}
		>
			<span className={BAND}>
				<Badge color={color}>{COVERAGE_BAND_WORD[rung.band]}</Badge>
			</span>
			<span className={RANGE}>{rangeOf(rung)}</span>
			<span className={PAYS}>
				<Badge color={color}>{rung.pays}</Badge>
			</span>
		</li>
	);
};

export const BandLadder = ({ held, lines, rungs }: BandLadderProps) => {
	const reading = clamped(held);
	const standing = standingRungOf(rungs, reading);

	return (
		<div className={LAYOUT}>
			<CoverageBar held={held} {...lines} marks="rungs" pin />
			<ul className={ROWS}>
				{rungs.map((rung) => (
					<Rung key={rung.band} rung={rung} standing={rung === standing} />
				))}
			</ul>
		</div>
	);
};

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";
import { WEIGHT } from "~/shared/lib/copy";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import {
	COVERAGE_BAND_COLOR,
	COVERAGE_BAND_WORD,
	CoverageBar,
	type CoverageBandId,
	type CoverageLadder,
} from "./CoverageBar.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";
import { Weight } from "./Weight.ui";

export const COPY = {
	build: "Build",
	weight: WEIGHT,
	free: "free",
	weightFree: (slots: number) => `${slots} ${WEIGHT} free`,
	nothingInstalled: "nothing installed",
	storage: "run storage",
	streak: "streak",
	best: "best",
	none: "—",
} as const;

const NEUTRAL: KantoColor = "pewter";
const PERCENT = "%";
const SEPARATOR = " · ";

const STANDING = "flex w-full flex-col gap-4";
const SECTION = "flex w-full flex-col gap-2";
const HEADING = "flex w-full flex-wrap items-center gap-2";
const HEADING_NAME = "text-sm font-bold text-theme-soft";
const HEADING_TRAIL = "ml-auto flex items-center gap-1.5";
const HEADING_META = "text-xs text-theme-muted";
const BUILD_MARK = "inline-block size-3.5 shrink-0 rounded-[3px] bg-pewter";

const CHIPS = "flex w-full flex-wrap items-stretch gap-1.5";
const FREE_CHIP =
	"inline-flex items-center gap-1.5 rounded-lg border border-dashed border-theme-faint px-1.5 py-1 text-sm text-theme-muted opacity-60";
const READER_ONLY = "sr-only";

const TILES = "grid grid-cols-3 rounded-xl border border-theme-faint";
const TILE =
	"flex min-w-0 flex-col items-start gap-1 border-l border-theme-faint px-3 py-2 first:border-l-0";

export type StandingStat = { label: string; value: string; color?: KantoColor };

export type StandingCoverage = CoverageLadder & {
	held: number;
	band: CoverageBandId;
};

export type StandingGate = {
	name: string;
	label: string;
	swatch: GateSwatch;
	coverage: StandingCoverage;
};

export type StandingProps = {
	gate: StandingGate;
	weight: string;
	build: readonly ConfigChipProps[];
	freeSlots: number;
	stats: readonly StandingStat[];
	withBuild?: boolean;
};

const readingOf = ({ held, band }: StandingCoverage) => {
	return {
		label: `${held}${PERCENT}${SEPARATOR}${COVERAGE_BAND_WORD[band]}`,
		color: COVERAGE_BAND_COLOR[band],
	};
};

const GateHeading = ({ name, label, swatch, coverage }: StandingGate) => {
	const reading = readingOf(coverage);

	return (
		<div className={HEADING}>
			<Swatch state="discovered" swatch={swatch} size="small" />
			<span className={HEADING_NAME}>{name}</span>
			<Badge color={NEUTRAL}>{label}</Badge>
			<span className={HEADING_TRAIL}>
				<Badge color={reading.color}>{reading.label}</Badge>
			</span>
		</div>
	);
};

const FreeSlot = ({ slots }: { slots: number }) => (
	<span className={FREE_CHIP}>
		<span className={READER_ONLY}>{COPY.weightFree(slots)}</span>
		<span aria-hidden>
			<Weight slots={slots} />
		</span>
		<span aria-hidden>{COPY.free}</span>
	</span>
);

type BuildBlockProps = Pick<StandingProps, "weight" | "build" | "freeSlots">;

const BuildBlock = ({ weight, build, freeSlots }: BuildBlockProps) => (
	<div className={SECTION}>
		<div className={HEADING}>
			<span aria-hidden className={BUILD_MARK} />
			<span className={HEADING_NAME}>{COPY.build}</span>
			<span className={HEADING_TRAIL}>
				<Badge color={NEUTRAL}>{weight}</Badge>
				<span className={HEADING_META}>{COPY.weight}</span>
			</span>
		</div>
		{build.length === 0 ? (
			<Typography variant="hint" as="span">
				{COPY.nothingInstalled}
			</Typography>
		) : null}
		<div className={CHIPS}>
			{build.map((config, index) =>
				config.locked === true ? (
					<ConfigChip key={index} locked compact />
				) : (
					<ConfigChip key={config.name} {...config} compact />
				)
			)}
			{freeSlots > 0 ? <FreeSlot slots={freeSlots} /> : null}
		</div>
	</div>
);

export const Standing = ({
	gate,
	weight,
	build,
	freeSlots,
	stats,
	withBuild = true,
}: StandingProps) => (
	<div className={STANDING}>
		<div className={SECTION}>
			<GateHeading {...gate} />
			<CoverageBar {...gate.coverage} pointer />
		</div>
		{withBuild ? (
			<BuildBlock weight={weight} build={build} freeSlots={freeSlots} />
		) : null}
		{stats.length === 0 ? null : (
			<div className={TILES}>
				{stats.map((stat) => (
					<div key={stat.label} className={TILE}>
						<Typography variant="hint" as="span">
							{stat.label}
						</Typography>
						<Badge color={stat.color ?? NEUTRAL}>{stat.value}</Badge>
					</div>
				))}
			</div>
		)}
	</div>
);

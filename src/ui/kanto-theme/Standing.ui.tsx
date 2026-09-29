import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

import { CoverageBar, type CoverageLadder } from "./CoverageBar.ui";

import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { SlotBox } from "./SlotBox.ui";
import { Swatch } from "./Swatch.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	build: "Build",
	nothingInstalled: "nothing installed",
	storage: "run storage",
	streak: "streak",
	best: "best",
	none: "—",
} as const;

const STANDING = "flex w-full flex-col gap-4";
const SECTION = "flex w-full flex-col gap-2";
const GATE_TAG = "flex flex-col gap-1";
const HEADING = "flex w-full flex-wrap items-center gap-2";
const HEADING_NAME = "text-sm font-bold text-theme-soft";
const HEADING_META = "ml-auto flex items-center gap-2 text-xs text-theme-muted";
const BUILD_MARK = "inline-block size-3.5 shrink-0 rounded-[3px] bg-pewter";

const CHIPS = "flex w-full flex-wrap items-stretch gap-2";
const FREE_SEAT = "flex min-w-32 grow";

const TILES = "grid grid-cols-3 rounded-xl border border-theme-faint";
const TILE =
	"flex min-w-0 flex-col gap-0.5 border-l border-theme-faint px-3 py-2 first:border-l-0";
const TILE_VALUE = "truncate text-sm font-bold text-theme-soft tabular-nums";

export type StandingStat = { label: string; value: string };

export type StandingCoverage = CoverageLadder & { held: number };

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
	namesGate?: boolean;
};

export const GateTag = ({
	name,
	label,
	swatch,
}: Pick<StandingGate, "name" | "label" | "swatch">) => (
	<div className={GATE_TAG}>
		<div className={HEADING}>
			<Swatch state="discovered" swatch={swatch} size="small" />
			<span className={HEADING_NAME}>{name}</span>
		</div>
		<Typography variant="hint" as="span">
			{label}
		</Typography>
	</div>
);

type BuildBlockProps = Pick<StandingProps, "weight" | "build" | "freeSlots">;

const BuildBlock = ({ weight, build, freeSlots }: BuildBlockProps) => (
	<div className={SECTION}>
		<div className={HEADING}>
			<span aria-hidden className={BUILD_MARK} />
			<span className={HEADING_NAME}>{COPY.build}</span>
			<span className={HEADING_META}>{weight}</span>
		</div>
		{build.length === 0 ? (
			<>
				<Typography variant="hint" as="span">
					{COPY.nothingInstalled}
				</Typography>
				{freeSlots > 0 ? <SlotBox slots={freeSlots} /> : null}
			</>
		) : (
			<div className={CHIPS}>
				{build.map((config, index) =>
					config.locked === true ? (
						<ConfigChip key={index} locked />
					) : (
						<ConfigChip key={config.name} {...config} />
					)
				)}
				{freeSlots > 0 ? (
					<div className={FREE_SEAT}>
						<SlotBox slots={freeSlots} />
					</div>
				) : null}
			</div>
		)}
	</div>
);

export const Standing = ({
	gate,
	weight,
	build,
	freeSlots,
	stats,
	namesGate = true,
}: StandingProps) => (
	<div className={STANDING}>
		<div className={SECTION}>
			{namesGate ? <GateTag {...gate} /> : null}
			<CoverageBar {...gate.coverage} pin />
		</div>
		<BuildBlock weight={weight} build={build} freeSlots={freeSlots} />
		{stats.length === 0 ? null : (
			<div className={TILES}>
				{stats.map((stat) => (
					<div key={stat.label} className={TILE}>
						<Typography variant="hint" as="span">
							{stat.label}
						</Typography>
						<span className={TILE_VALUE}>{stat.value}</span>
					</div>
				))}
			</div>
		)}
	</div>
);

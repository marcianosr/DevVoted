import { clsx } from "clsx";

import type { CoverageBandId } from "./CoverageBar.ui";
import { COVERAGE_BAND_COLOR, COVERAGE_BAND_WORD } from "./CoverageBar.ui";

import { Badge } from "./Badge.ui";
import { Button } from "./Button.ui";
import { Climber } from "./Climber.ui";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { Link } from "./Link.ui";
import { Typography } from "./Typography.ui";

export const COPY = {
	nothingInstalled: "nothing installed",
	coverage: "coverage",
	streak: "current streak",
	bestCategory: "best category",
	gate: "current gate",
	none: "—",
	privately: "answers, unanswered polls and prefetch stay private",
	close: "Close",
} as const;

const GITHUB = "https://github.com";
const CLOSE_GLYPH = "×";

export const CARD_PANEL =
	"fixed inset-x-4 bottom-4 z-30 sm:absolute sm:inset-x-auto sm:top-full sm:left-1/2 sm:mt-2 sm:w-112 sm:-translate-x-1/2";

const CARD =
	"flex max-h-[70vh] w-full flex-col gap-3 overflow-y-auto rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3";

const HEAD = "flex w-full items-center gap-3";
const NAMING = "flex min-w-0 flex-col";
const NAME = "text-sm font-bold text-theme-soft";
const CLOSE = "ml-auto shrink-0";

const STATUS = "flex flex-wrap items-center gap-2 text-xs text-theme-muted";
const LINE = "flex flex-wrap items-baseline gap-2 text-xs text-theme-muted";
const FIGURE = "font-bold text-theme-soft tabular-nums";

const BUILD = "flex flex-wrap items-center gap-1.5";

const TILES = "grid grid-cols-2 gap-2 sm:grid-cols-3";
const TILE = "flex flex-col gap-0.5 rounded-lg bg-theme-faint px-3 py-2";
const TILE_VALUE = "text-sm font-bold text-theme-soft tabular-nums";

const NOTE = "rounded-lg border border-theme-faint px-3 py-2";

export type ClimberCardStat = { label: string; value: string };

export type ClimberCardProps = {
	name: string;
	handle?: string;
	title?: string;
	photoUrl?: string;
	borderUrl?: string;
	you?: boolean;
	rival?: boolean;
	perfect?: boolean;
	shaky?: boolean;
	rescued?: boolean;
	gate: string;
	band?: CoverageBandId;
	coveragePercent?: number;
	weight: string;
	storage?: string;
	build: readonly ConfigChipProps[];
	stats: readonly ClimberCardStat[];
	onClose?: () => void;
};

const Naming = ({
	name,
	handle,
	title,
}: Pick<ClimberCardProps, "name" | "handle" | "title">) => (
	<span className={NAMING}>
		<span className={NAME}>
			{handle === undefined ? (
				name
			) : (
				<Link href={`${GITHUB}/${handle}`} external>
					{`@${handle}`}
				</Link>
			)}
		</span>
		{title === undefined ? null : (
			<Typography variant="hint" as="span">
				{title}
			</Typography>
		)}
	</span>
);

export const ClimberCard = ({
	name,
	handle,
	title,
	photoUrl,
	borderUrl,
	you = false,
	rival = false,
	perfect = false,
	shaky = false,
	rescued = false,
	gate,
	band,
	coveragePercent,
	weight,
	storage,
	build,
	stats,
	onClose,
}: ClimberCardProps) => (
	<div className={CARD}>
		<div className={HEAD}>
			<Climber
				name={name}
				photoUrl={photoUrl}
				borderUrl={borderUrl}
				you={you}
				rival={rival}
				perfect={perfect}
				shaky={shaky}
				rescued={rescued}
				size="md"
			/>
			<Naming name={name} handle={handle} title={title} />
			{onClose === undefined ? null : (
				<span className={CLOSE}>
					<Button
						tone="ambient"
						glyph={CLOSE_GLYPH}
						label={`${COPY.close} ${name}`}
						onPress={onClose}
					/>
				</span>
			)}
		</div>

		<div className={STATUS}>
			<span className={FIGURE}>{gate}</span>
			{band === undefined ? null : (
				<Badge color={COVERAGE_BAND_COLOR[band]}>
					{COVERAGE_BAND_WORD[band]}
				</Badge>
			)}
			{coveragePercent === undefined ? null : (
				<span>
					<span className={FIGURE}>{`${coveragePercent}%`}</span>
					{` ${COPY.coverage}`}
				</span>
			)}
		</div>

		<div className={LINE}>
			<span className={FIGURE}>{weight}</span>
			{storage === undefined ? null : (
				<>
					<span aria-hidden>·</span>
					<span className={FIGURE}>{storage}</span>
				</>
			)}
		</div>

		{build.length === 0 ? (
			<Typography variant="hint" as="span">
				{COPY.nothingInstalled}
			</Typography>
		) : (
			<div className={BUILD}>
				{build.map((config, index) =>
					config.locked === true ? (
						<ConfigChip key={index} locked />
					) : (
						<ConfigChip key={config.name} {...config} />
					)
				)}
			</div>
		)}

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

		<div className={clsx(NOTE)}>
			<Typography variant="hint" as="span">
				{COPY.privately}
			</Typography>
		</div>
	</div>
);

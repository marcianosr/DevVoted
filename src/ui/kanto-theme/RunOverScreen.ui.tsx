import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { ConfigChip, type ConfigChipProps } from "./ConfigChip.ui";
import { CoverageBar, type CoverageBarProps } from "./CoverageBar.ui";
import { Figures } from "./Figures.ui";
import { Meter } from "./Meter.ui";
import { Panel } from "./Panel.ui";
import { PollScores, type PollScoresProps } from "./PollScores.ui";
import { Screen, type ScreenWidth } from "./Screen.ui";
import { ScreenActions, type ScreenFooterProps } from "./ScreenFooter.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";
import { SwatchTrack } from "./SwatchTrack.ui";
import { Typography } from "./Typography.ui";
import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

const HEADER = "flex w-full flex-col gap-4";
const TITLE_ROW = "flex w-full items-start gap-4";
const NAMING = "flex min-w-0 flex-col gap-1";
const FIGURE = "ml-auto flex shrink-0 flex-col items-end gap-1";
const FIGURE_AMOUNT = "text-2xl font-extrabold tabular-nums text-theme";
const FIGURE_NOTE = "text-xs text-theme-muted";

const COLUMNS = "grid w-full gap-6 md:grid-cols-2";
const COLUMN = "flex w-full min-w-0 flex-col gap-6";

const CATEGORY_NAME = "w-28 shrink-0 truncate";
const CATEGORY_BAR = "min-w-0 flex-1";
const CHIPS = "flex w-full flex-wrap items-center gap-2";
const UNLOCK_MARKS = "flex shrink-0 items-center gap-1";
const UNLOCK_NAMING = "flex min-w-0 flex-wrap items-baseline gap-x-2";
const UNLOCK_DETAIL = "text-xs text-theme-muted";
const SPENT_ROW = "opacity-60";

const SWATCH_SIZE = "hero";
const TRACK_SIZE = "small";
const MARK_SIZE = "small";

const RUN_OVER_COLOR: KantoColor = "cinnabar";

const COVERAGE_TITLE = "coverage";
const GATES_TITLE = "gate by gate";
const CATEGORIES_TITLE = "by category";
const BUILD_TITLE = "the build at the end";
const STORAGE_TITLE = "storage";
const UNLOCKED_TITLE = "unlocked";

const TOTAL_LABEL = "total";

export type RunOverFigure = { amount: string; note: string };

export type RunOverHeader = {
	swatch: GateSwatch;
	swatches: readonly SwatchFill[];
	title: string;
	subtitle: string;
	figure: RunOverFigure;
	caption: string;
};

export type RunOverCoverage = {
	meta: string;
	badge: { label: string; color?: KantoColor };
	note: string;
};

export type RunOverTotal = {
	score: string;
	badge: { label: string; color?: KantoColor };
};

export type RunOverGates = {
	meta: string;
	payouts: PollScoresProps;
	total: RunOverTotal;
};

export type RunOverCategory = {
	name: string;
	correct: number;
	seen: number;
	score: string;
	theme?: KantoColor;
	tag?: { label: string; color?: KantoColor };
};

export type RunOverCategories = {
	meta: string;
	rows: readonly RunOverCategory[];
};

export type RunOverBuild = {
	meta: string;
	badge: { label: string; color?: KantoColor };
	configs: readonly ConfigChipProps[];
	note: string;
};

export type RunOverStorageRow = {
	label: string;
	figure: string;
	color?: KantoColor;
	spent?: boolean;
};

export type RunOverStorage = { rows: readonly RunOverStorageRow[] };

/** A row names either a plain thing the run kept or the config chip it registered. */
type RunOverUnlockBody =
	{ label: string; chip?: never } | { chip: ConfigChipProps; label?: never };

export type RunOverUnlock = RunOverUnlockBody & {
	detail?: string;
	marks?: readonly SwatchFill[];
	badge: { label: string; color?: KantoColor };
	spent?: boolean;
};

export type RunOverUnlocked = {
	badge: { label: string; color?: KantoColor };
	rows: readonly RunOverUnlock[];
};

export type RunOverScreenProps = {
	header: RunOverHeader;
	bar: CoverageBarProps;
	coverage: RunOverCoverage;
	gates: RunOverGates;
	categories: RunOverCategories;
	build: RunOverBuild;
	storage: RunOverStorage;
	unlocked: RunOverUnlocked;
	footer: ScreenFooterProps;
	/** A summited run keeps its gate's colour; a dead one turns the screen red. */
	won?: boolean;
	width?: ScreenWidth;
};

type MetaBadge = { label: string; color?: KantoColor };

const Meta = ({ reading, badge }: { reading?: string; badge?: MetaBadge }) => (
	<>
		{reading === undefined ? null : <span>{reading}</span>}
		{badge === undefined ? null : (
			<Badge color={badge.color}>{badge.label}</Badge>
		)}
	</>
);

const RunOverHeading = ({
	swatch,
	swatches,
	title,
	subtitle,
	figure,
	caption,
}: RunOverHeader) => (
	<header className={HEADER}>
		<div className={TITLE_ROW}>
			<Swatch state="current" swatch={swatch} size={SWATCH_SIZE} />
			<span className={NAMING}>
				<Typography variant="headline" as="h1">
					{title}
				</Typography>
				<Typography variant="hint" as="span">
					{subtitle}
				</Typography>
			</span>
			<span className={FIGURE}>
				<span className={FIGURE_AMOUNT}>{figure.amount}</span>
				<span className={FIGURE_NOTE}>{figure.note}</span>
			</span>
		</div>

		<SwatchTrack swatches={swatches} size={TRACK_SIZE} />

		<Typography variant="hint">{caption}</Typography>
	</header>
);

const CoveragePanel = ({
	bar,
	meta,
	badge,
	note,
}: RunOverCoverage & { bar: CoverageBarProps }) => (
	<Panel>
		<Panel.Header
			label={COVERAGE_TITLE}
			meta={<Meta reading={meta} badge={badge} />}
		/>
		<Panel.Body>
			<CoverageBar {...bar} pin marks="rungs" />
			<Typography variant="hint">{note}</Typography>
		</Panel.Body>
	</Panel>
);

const GatesPanel = ({ meta, payouts, total }: RunOverGates) => (
	<Panel>
		<Panel.Header label={GATES_TITLE} meta={<Meta reading={meta} />} />
		<Panel.Body>
			<PollScores {...payouts} />
		</Panel.Body>
		<Panel.Footer
			trailing={
				<>
					<Typography variant="hint" as="span">
						{total.score}
					</Typography>
					<Badge color={total.badge.color}>{total.badge.label}</Badge>
				</>
			}
		>
			<Typography variant="caption">{TOTAL_LABEL}</Typography>
		</Panel.Footer>
	</Panel>
);

const CategoryRow = ({ row }: { row: RunOverCategory }) => (
	<Panel.Row
		theme={row.theme}
		trailing={
			<>
				<Typography variant="hint" as="span">
					{row.score}
				</Typography>
				{row.tag === undefined ? null : (
					<Badge color={row.tag.color}>{row.tag.label}</Badge>
				)}
			</>
		}
	>
		<span className={CATEGORY_NAME}>
			<Typography variant="caption">{row.name}</Typography>
		</span>
		<span className={CATEGORY_BAR}>
			<Meter value={row.correct} max={row.seen} />
		</span>
	</Panel.Row>
);

const CategoriesPanel = ({ meta, rows }: RunOverCategories) => (
	<Panel>
		<Panel.Header label={CATEGORIES_TITLE} meta={<Meta reading={meta} />} />
		<Panel.Rows>
			{rows.map((row) => (
				<CategoryRow key={row.name} row={row} />
			))}
		</Panel.Rows>
	</Panel>
);

const BuildPanel = ({ meta, badge, configs, note }: RunOverBuild) => (
	<Panel>
		<Panel.Header
			label={BUILD_TITLE}
			meta={<Meta reading={meta} badge={badge} />}
		/>
		<Panel.Body>
			<div className={CHIPS}>
				{configs.map((config, index) => (
					<ConfigChip key={index} {...config} />
				))}
			</div>
			<Typography variant="hint">
				<Figures text={note} />
			</Typography>
		</Panel.Body>
	</Panel>
);

const StoragePanel = ({ rows }: RunOverStorage) => (
	<Panel>
		<Panel.Header label={STORAGE_TITLE} />
		<Panel.Rows>
			{rows.map((row) => (
				<Panel.Row
					key={row.label}
					className={row.spent === true ? SPENT_ROW : undefined}
					trailing={<Badge color={row.color}>{row.figure}</Badge>}
				>
					<Typography variant="caption">{row.label}</Typography>
				</Panel.Row>
			))}
		</Panel.Rows>
	</Panel>
);

const UnlockRow = ({ row }: { row: RunOverUnlock }) => (
	<Panel.Row
		className={row.spent === true ? SPENT_ROW : undefined}
		trailing={<Badge color={row.badge.color}>{row.badge.label}</Badge>}
	>
		{row.marks === undefined ? null : (
			<span aria-hidden className={UNLOCK_MARKS}>
				{row.marks.map((mark, index) => (
					<Swatch key={index} size={MARK_SIZE} {...mark} />
				))}
			</span>
		)}

		{row.chip === undefined ? null : <ConfigChip {...row.chip} />}

		<span className={UNLOCK_NAMING}>
			{row.label === undefined ? null : (
				<Typography variant="subtitle" as="span">
					{row.label}
				</Typography>
			)}
			{row.detail === undefined ? null : (
				<span className={UNLOCK_DETAIL}>{row.detail}</span>
			)}
		</span>
	</Panel.Row>
);

const UnlockedPanel = ({ badge, rows }: RunOverUnlocked) => (
	<Panel>
		<Panel.Header label={UNLOCKED_TITLE} meta={<Meta badge={badge} />} />
		<Panel.Rows>
			{rows.map((row, index) => (
				<UnlockRow key={index} row={row} />
			))}
		</Panel.Rows>
	</Panel>
);

export const RunOverScreen = ({
	header,
	bar,
	coverage,
	gates,
	categories,
	build,
	storage,
	unlocked,
	footer,
	won = false,
	width = "default",
}: RunOverScreenProps) => {
	const body = (
		<>
			<RunOverHeading {...header} />

			<CoveragePanel bar={bar} {...coverage} />

			<GatesPanel {...gates} />

			<div className={COLUMNS}>
				<div className={COLUMN}>
					<CategoriesPanel {...categories} />
				</div>

				<div className={COLUMN}>
					<BuildPanel {...build} />
					<StoragePanel {...storage} />
				</div>
			</div>

			<UnlockedPanel {...unlocked} />

			<ScreenActions {...footer} />
		</>
	);

	if (won) {
		return (
			<Screen gate={header.swatch.theme} width={width} ground="bare">
				{body}
			</Screen>
		);
	}

	return (
		<Screen theme={RUN_OVER_COLOR} width={width} ground="bare">
			{body}
		</Screen>
	);
};

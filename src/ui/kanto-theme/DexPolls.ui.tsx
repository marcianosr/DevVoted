import { clsx } from "clsx";

import type { PollEntryState } from "~/modules/collection/dex/domain/polldex.model";

import { Badge } from "./Badge.ui";
import type { KantoColor } from "./colors";
import { Panel } from "./Panel.ui";
import { Redaction, type Redactable } from "./Redaction.ui";
import { Segmented, type SegmentedItem } from "./Segmented.ui";

const BODY = "grid w-full lg:grid-cols-2";
const LIST = "flex min-w-0 flex-col border-theme-faint lg:border-r";
const ROW =
	"flex w-full cursor-pointer items-center gap-4 border-b border-l-4 border-theme-faint border-l-transparent px-6 py-4 text-left transition-colors hover:bg-theme-raised";
const ROW_PICKED = "border-l-theme bg-theme-raised";
const NUMBER = "shrink-0 text-xs tabular-nums text-theme-muted";
const QUESTION = "min-w-0 flex-1 truncate text-sm text-theme-soft";
const NOTHING = "px-6 py-4 text-sm text-theme-muted";
const ROSTER = "flex flex-col gap-4 px-6 py-5";
const ROSTER_HEAD = "flex items-center justify-between gap-2";
const ROSTER_LABEL = "text-sm text-theme-muted";
const GRID = "grid grid-cols-8 gap-1.5 sm:grid-cols-16";
const TILE =
	"flex h-7 cursor-pointer items-center justify-center rounded-md text-[0.625rem] font-bold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme";
const TILE_MET = "badge-theme";
const TILE_UNSEEN = "bg-theme-raised text-theme-muted opacity-60";
const TILE_PICKED = "outline-2 outline-offset-1 outline-theme";
const DETAIL = "flex flex-col gap-4 px-6 py-8 lg:sticky lg:top-4";
const DETAIL_HEAD = "text-sm tabular-nums text-theme-muted";
const DETAIL_QUESTION =
	"text-xl font-extrabold leading-snug text-theme-soft sm:text-2xl";
const FACTS = "flex flex-wrap items-center gap-2";

const NOTHING_YET = "—";
const LOCKED_LABEL = "Unseen poll";
const FILTER_LABEL = "Category";
const GRID_LABEL = "Every poll";
const NOTHING_SEEN = "Nothing seen here yet.";
const NOTHING_HERE = "No poll in this category yet.";
const HEAD_DIVIDER = " · ";

export const STATE_LABEL: Record<PollEntryState, string> = {
	unseen: "unseen",
	seen: "seen",
	caught: "caught",
};

const STATE_COLOR: Record<PollEntryState, KantoColor | undefined> = {
	unseen: undefined,
	seen: "saffron",
	caught: "viridian",
};

export const answeredLabelOf = (answered: number): string =>
	`answered ×${answered}`;

export const scoreLabelOf = (correct: number, answered: number): string =>
	`${correct}/${answered}`;

export const seenLabelOf = (timesSeen: number): string => `dealt ×${timesSeen}`;

export const rightLabelOf = (correct: number, answered: number): string =>
	`right${HEAD_DIVIDER}${scoreLabelOf(correct, answered)}`;

type PollFacts = {
	question: string;
	timesSeen: number;
	answered: number;
	correct: number;
};

export type DexPollRow = {
	id: string;
	number: string;
	question: string;
	answered: number;
	correct: number;
	state: PollEntryState;
};

export type DexPollTile = {
	id: string;
	number: string;
	state: PollEntryState;
};

export type DexPollGrid = {
	label: string;
	seen: string;
	tiles: readonly DexPollTile[];
};

export type DexPollDetail = {
	number: string;
	category: string;
	state: PollEntryState;
} & Redactable<PollFacts>;

export type DexPollsData = {
	filters: readonly SegmentedItem<string>[];
	filter: string;
	rows: readonly DexPollRow[];
	grid: DexPollGrid;
	selectedId: string | null;
	detail: DexPollDetail | null;
};

export type DexPollsProps = DexPollsData & {
	onSelect?: (id: string) => void;
	onFilter?: (filter: string) => void;
};

type Picking = { selectedId: string | null; onSelect?: (id: string) => void };

const Score = ({ row }: { row: DexPollRow }) =>
	row.answered === 0 ? (
		<span className={NUMBER}>{NOTHING_YET}</span>
	) : (
		<Badge color={STATE_COLOR[row.state]}>
			{scoreLabelOf(row.correct, row.answered)}
		</Badge>
	);

const PollRow = ({
	row,
	selectedId,
	onSelect,
}: { row: DexPollRow } & Picking) => (
	<button
		type="button"
		aria-current={row.id === selectedId}
		onClick={() => onSelect?.(row.id)}
		className={clsx(ROW, row.id === selectedId && ROW_PICKED)}
	>
		<span className={NUMBER}>{row.number}</span>
		<span className={QUESTION}>{row.question}</span>
		<Score row={row} />
	</button>
);

const Tile = ({
	tile,
	selectedId,
	onSelect,
}: { tile: DexPollTile } & Picking) => (
	<button
		type="button"
		data-screen-theme={STATE_COLOR[tile.state]}
		aria-label={`#${tile.number} ${STATE_LABEL[tile.state]}`}
		aria-pressed={tile.id === selectedId}
		onClick={() => onSelect?.(tile.id)}
		className={clsx(
			TILE,
			tile.state === "unseen" ? TILE_UNSEEN : TILE_MET,
			tile.id === selectedId && TILE_PICKED
		)}
	>
		{tile.number}
	</button>
);

const Roster = ({
	grid,
	selectedId,
	onSelect,
}: { grid: DexPollGrid } & Picking) => (
	<div className={ROSTER}>
		<div className={ROSTER_HEAD}>
			<span className={ROSTER_LABEL}>{grid.label}</span>
			<Badge color={STATE_COLOR.caught}>{grid.seen}</Badge>
		</div>
		<div role="group" aria-label={GRID_LABEL} className={GRID}>
			{grid.tiles.map((tile) => (
				<Tile
					key={tile.id}
					tile={tile}
					selectedId={selectedId}
					onSelect={onSelect}
				/>
			))}
		</div>
	</div>
);

const Facts = ({
	detail,
}: {
	detail: PollFacts & { state: PollEntryState };
}) => (
	<span className={FACTS}>
		<Badge>{seenLabelOf(detail.timesSeen)}</Badge>
		<Badge>{answeredLabelOf(detail.answered)}</Badge>
		{detail.answered === 0 ? null : (
			<Badge color={STATE_COLOR[detail.state]}>
				{rightLabelOf(detail.correct, detail.answered)}
			</Badge>
		)}
	</span>
);

const Detail = ({ detail }: { detail: DexPollDetail | null }) => {
	if (detail === null)
		return (
			<div className={DETAIL}>
				<span className={DETAIL_HEAD}>{NOTHING_HERE}</span>
			</div>
		);

	return (
		<div className={DETAIL}>
			<h2 className={DETAIL_HEAD}>
				{`${detail.number}${HEAD_DIVIDER}${detail.category}`}
			</h2>
			{detail.locked ? (
				<Redaction label={LOCKED_LABEL} />
			) : (
				<>
					<p className={DETAIL_QUESTION}>{detail.question}</p>
					<Facts detail={detail} />
				</>
			)}
		</div>
	);
};

export const DexPolls = ({
	filters,
	filter,
	rows,
	grid,
	selectedId,
	detail,
	onSelect,
	onFilter,
}: DexPollsProps) => (
	<Panel>
		{onFilter === undefined ? null : (
			<Segmented
				label={FILTER_LABEL}
				look="strip"
				items={filters}
				value={filter}
				onSelect={onFilter}
			/>
		)}
		<div className={BODY}>
			<div className={LIST}>
				{rows.length === 0 ? (
					<p className={NOTHING}>{NOTHING_SEEN}</p>
				) : (
					rows.map((row) => (
						<PollRow
							key={row.id}
							row={row}
							selectedId={selectedId}
							onSelect={onSelect}
						/>
					))
				)}
				<Roster grid={grid} selectedId={selectedId} onSelect={onSelect} />
			</div>
			<div>
				<Detail detail={detail} />
			</div>
		</div>
	</Panel>
);

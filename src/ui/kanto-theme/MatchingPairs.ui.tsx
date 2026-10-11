import { clsx } from "clsx";

import { letterAt } from "~/shared/lib/letters";

import { CodeSpans } from "./CodeText.ui";
import type { KantoColor } from "./colors";
import { Keycap } from "./Keycap.ui";

const COPY = {
	left: "left tiles",
	right: "right tiles",
	clear: "clear",
	check: "Check pairs",
} as const;

const BLOCK = "flex w-full flex-col gap-3";
const GRID =
	"grid w-full auto-rows-fr grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]";
const COLUMN = "contents";
const CELL = "flex py-1";
const LEFT_CELL = "col-start-1";
const RIGHT_CELL = "col-start-3";
const ROW_START = [
	"row-start-1",
	"row-start-2",
	"row-start-3",
	"row-start-4",
	"row-start-5",
	"row-start-6",
] as const;
const ROW_SPAN = [
	"row-span-1",
	"row-span-1",
	"row-span-2",
	"row-span-3",
	"row-span-4",
	"row-span-5",
	"row-span-6",
] as const;

const rowSpanOf = (rows: number): string => ROW_SPAN[rows] ?? ROW_SPAN[4];
const LINES =
	"pointer-events-none col-start-2 row-start-1 h-full w-full overflow-visible";
const LINE = "fill-none stroke-2 text-theme";
const TILE =
	"relative flex min-h-14 w-full min-w-0 items-center gap-2 rounded-lg border p-2 text-left text-xs font-bold wrap-break-word transition-colors sm:gap-3 sm:p-3 sm:text-sm";
const LABEL = "min-w-0";
const TILE_IDLE = "border-theme-faint bg-theme-dim";
const TILE_TONED = "border-theme bg-theme-dim";
const TILE_PICKABLE = "cursor-pointer hover:bg-theme-raised";
const DOT =
	"absolute top-1/2 size-3 -translate-y-1/2 rounded-full border-2 bg-theme-dim";
const DOT_SIDE = { left: "-right-1.5", right: "-left-1.5" } as const;
const DOT_IDLE = "border-edge-strong";
const DOT_TONED = "border-theme bg-theme-lit";
const PRESSES = "flex w-full items-center gap-3";
const CHECK =
	"segment-theme press-raised ml-auto rounded-lg px-4 py-2 text-sm font-extrabold tracking-wide whitespace-nowrap transition enabled:cursor-pointer enabled:hover:brightness-110 enabled:active:press-sunk disabled:cursor-not-allowed disabled:opacity-40";
const CLEAR =
	"self-start text-sm text-theme-muted underline underline-offset-4 hover:text-theme";

const LINE_Y_SCALE = 100;
const LINE_X_END = 100;
const LINE_BEND = LINE_X_END / 2;

const LINK_COLORS = [
	"cerulean",
	"saffron",
	"lavender",
	"vermillion",
	"fuchsia",
	"seafoam",
] as const satisfies readonly KantoColor[];

export type PairVerdict = "matched" | "missed";

const VERDICT_COLOR = {
	matched: "viridian",
	missed: "cinnabar",
} satisfies Record<PairVerdict, KantoColor>;

const VERDICT_GLYPH = {
	matched: "✓",
	missed: "✗",
} satisfies Record<PairVerdict, string>;

const VERDICT_MARK =
	"badge-theme ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-theme text-xs leading-none";
const MISSED_DASH = "4 4";

export type PairTile = { id: string; label: string; verdict?: PairVerdict };

export type TileLink = { left: string; right: string; verdict?: PairVerdict };

export type MatchingPairsProps = {
	left: readonly PairTile[];
	right: readonly PairTile[];
	links?: readonly TileLink[];
	pendingId?: string;
	onPick?: (id: string) => void;
	onClear?: () => void;
	onCheck?: () => void;
};

type Side = keyof typeof DOT_SIDE;

type PlacedTile = {
	tile: PairTile;
	side: Side;
	row: number;
	cap: string;
	color?: KantoColor;
	mark?: PairVerdict;
};

const linkColorOf = (row: number): KantoColor =>
	LINK_COLORS[row % LINK_COLORS.length];

const toneOf = (
	tile: PairTile,
	linkedRow: number | undefined
): KantoColor | undefined => {
	if (tile.verdict !== undefined) return VERDICT_COLOR[tile.verdict];
	return linkedRow === undefined ? undefined : linkColorOf(linkedRow);
};

const rowOfLeft = (left: readonly PairTile[], id: string): number =>
	left.findIndex((tile) => tile.id === id);

const linkedLeftRowOf = (
	left: readonly PairTile[],
	links: readonly TileLink[],
	rightId: string
): number | undefined => {
	const link = links.find((candidate) => candidate.right === rightId);
	return link === undefined ? undefined : rowOfLeft(left, link.left);
};

const isLinked = (links: readonly TileLink[], leftId: string) =>
	links.some((link) => link.left === leftId);

const capNumberOf = (row: number) => String(row + 1);

const placedLeftOf = (
	left: readonly PairTile[],
	links: readonly TileLink[]
): readonly PlacedTile[] =>
	left.map((tile, row) => ({
		tile,
		side: "left",
		row,
		cap: capNumberOf(row),
		color: toneOf(tile, isLinked(links, tile.id) ? row : undefined),
	}));

const placedRightOf = (
	left: readonly PairTile[],
	right: readonly PairTile[],
	links: readonly TileLink[]
): readonly PlacedTile[] =>
	right.map((tile, row) => {
		const linkedRow = linkedLeftRowOf(left, links, tile.id);
		const mark = links.find((link) => link.right === tile.id)?.verdict;
		return {
			tile,
			side: "right",
			row,
			cap: linkedRow === undefined ? letterAt(row) : capNumberOf(linkedRow),
			color: toneOf(tile, linkedRow),
			...(mark === undefined ? {} : { mark }),
		};
	});

const TileFace = ({ placed }: { placed: PlacedTile }) => (
	<>
		<span aria-hidden>
			<Keycap
				letter={placed.cap}
				answerType="pairs"
				size="fit"
				filled={placed.color !== undefined}
			/>
		</span>
		<span className={LABEL}>
			<CodeSpans text={placed.tile.label} />
		</span>
		{placed.mark === undefined ? null : (
			<span
				data-screen-theme={VERDICT_COLOR[placed.mark]}
				className={VERDICT_MARK}
			>
				{VERDICT_GLYPH[placed.mark]}
			</span>
		)}
		<span
			aria-hidden
			className={clsx(
				DOT,
				DOT_SIDE[placed.side],
				placed.color === undefined ? DOT_IDLE : DOT_TONED
			)}
		/>
	</>
);

const Tile = ({
	placed,
	pending,
	onPick,
}: {
	placed: PlacedTile;
	pending: boolean;
	onPick?: (id: string) => void;
}) => {
	const toned = placed.color !== undefined || pending;
	const shared = {
		"data-tile": true,
		"data-screen-theme": placed.color,
	};
	if (onPick === undefined || placed.tile.verdict !== undefined)
		return (
			<span {...shared} className={clsx(TILE, toned ? TILE_TONED : TILE_IDLE)}>
				<TileFace placed={placed} />
			</span>
		);
	return (
		<button
			{...shared}
			type="button"
			aria-pressed={pending}
			onClick={() => onPick(placed.tile.id)}
			className={clsx(TILE, TILE_PICKABLE, toned ? TILE_TONED : TILE_IDLE)}
		>
			<TileFace placed={placed} />
		</button>
	);
};

const Column = ({
	label,
	tiles,
	pendingId,
	onPick,
}: {
	label: string;
	tiles: readonly PlacedTile[];
	pendingId?: string;
	onPick?: (id: string) => void;
}) => (
	<div role="group" aria-label={label} className={COLUMN}>
		{tiles.map((placed) => (
			<div
				key={placed.tile.id}
				className={clsx(
					CELL,
					placed.side === "left" ? LEFT_CELL : RIGHT_CELL,
					ROW_START[placed.row]
				)}
			>
				<Tile
					placed={placed}
					pending={placed.tile.id === pendingId}
					onPick={onPick}
				/>
			</div>
		))}
	</div>
);

const rowCentreOf = (row: number) => row * LINE_Y_SCALE + LINE_Y_SCALE / 2;

const curveBetween = (fromRow: number, toRow: number) => {
	const from = rowCentreOf(fromRow);
	const to = rowCentreOf(toRow);
	return `M0 ${from} C${LINE_BEND} ${from} ${LINE_BEND} ${to} ${LINE_X_END} ${to}`;
};

const Lines = ({
	left,
	right,
	links,
}: {
	left: readonly PlacedTile[];
	right: readonly PlacedTile[];
	links: readonly TileLink[];
}) => (
	<svg
		aria-hidden
		className={clsx(LINES, rowSpanOf(left.length))}
		viewBox={`0 0 ${LINE_X_END} ${left.length * LINE_Y_SCALE}`}
		preserveAspectRatio="none"
	>
		{links.map((link) => {
			const from = left.find((placed) => placed.tile.id === link.left);
			const to = right.find((placed) => placed.tile.id === link.right);
			if (from === undefined || to === undefined) return null;
			return (
				<path
					key={link.left}
					data-link
					data-screen-theme={from.color}
					className={LINE}
					stroke="currentColor"
					vectorEffect="non-scaling-stroke"
					strokeDasharray={link.verdict === "missed" ? MISSED_DASH : undefined}
					d={curveBetween(from.row, to.row)}
				/>
			);
		})}
	</svg>
);

type Board = Pick<MatchingPairsProps, "left" | "right" | "links">;

const PairsBoard = ({
	left,
	right,
	links = [],
	pendingId,
	onPick,
}: Board & Pick<MatchingPairsProps, "pendingId" | "onPick">) => {
	const placedLeft = placedLeftOf(left, links);
	const placedRight = placedRightOf(left, right, links);
	return (
		<div className={GRID}>
			<Column
				label={COPY.left}
				tiles={placedLeft}
				pendingId={pendingId}
				onPick={onPick}
			/>
			<Lines left={placedLeft} right={placedRight} links={links} />
			<Column
				label={COPY.right}
				tiles={placedRight}
				pendingId={pendingId}
				onPick={onPick}
			/>
		</div>
	);
};

const Presses = ({
	links,
	onClear,
	onCheck,
}: {
	links: readonly TileLink[];
	onClear?: () => void;
	onCheck?: () => void;
}) => (
	<div className={PRESSES}>
		{onClear === undefined || links.length === 0 ? null : (
			<button type="button" onClick={onClear} className={CLEAR}>
				{COPY.clear}
			</button>
		)}
		<button
			type="button"
			disabled={onCheck === undefined}
			onClick={onCheck}
			className={CHECK}
		>
			{COPY.check}
		</button>
	</div>
);

export const MatchingPairs = ({
	onClear,
	onCheck,
	...board
}: MatchingPairsProps) => (
	<div className={BLOCK}>
		<PairsBoard {...board} />
		{board.onPick === undefined ? null : (
			<Presses links={board.links ?? []} onClear={onClear} onCheck={onCheck} />
		)}
	</div>
);

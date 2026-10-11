import { clsx } from "clsx";

import { CodeSpans } from "./CodeText.ui";
import type { KantoColor } from "./colors";

const COPY = {
	left: "left tiles",
	right: "right tiles",
	pairs: "pairs",
	link: "⟷",
} as const;

const COLUMNS = "grid w-full grid-cols-2 gap-2";
const COLUMN = "flex min-w-0 flex-col gap-2";
const ROWS = "flex w-full flex-col gap-2";
const ROW = "grid w-full grid-cols-[1fr_auto_1fr] items-stretch gap-2";
const LINK = "self-center text-theme-soft";
const TILE =
	"flex min-h-14 min-w-0 items-center justify-center rounded-lg border px-2 py-3 text-center text-sm font-bold wrap-anywhere transition-colors";
const TILE_OPEN = "border-theme-faint bg-theme-dim";
const TILE_PICKABLE = "cursor-pointer hover:bg-theme-raised";
const TILE_TONED = "border-theme bg-theme-soft text-theme";

export type PairTileState = "open" | "matched" | "missed";

const RESOLVED_COLOR = {
	matched: "viridian",
	missed: "cinnabar",
} satisfies Record<Exclude<PairTileState, "open">, KantoColor>;

export type PairTile = { id: string; label: string; state: PairTileState };

export type MatchingPairsProps = {
	left: readonly PairTile[];
	right: readonly PairTile[];
	pickedIds?: readonly string[];
	onPick?: (id: string) => void;
	linked?: boolean;
};

const ResolvedTile = ({
	tile,
	state,
}: {
	tile: PairTile;
	state: Exclude<PairTileState, "open">;
}) => (
	<span
		data-screen-theme={RESOLVED_COLOR[state]}
		data-pair={state}
		className={clsx(TILE, TILE_TONED)}
	>
		<CodeSpans text={tile.label} />
	</span>
);

const Tile = ({
	tile,
	picked,
	onPick,
}: {
	tile: PairTile;
	picked: boolean;
	onPick?: (id: string) => void;
}) => {
	if (tile.state !== "open")
		return <ResolvedTile tile={tile} state={tile.state} />;
	if (onPick === undefined)
		return (
			<span className={clsx(TILE, TILE_OPEN)}>
				<CodeSpans text={tile.label} />
			</span>
		);
	return (
		<button
			type="button"
			aria-pressed={picked}
			onClick={() => onPick(tile.id)}
			className={clsx(TILE, TILE_PICKABLE, picked ? TILE_TONED : TILE_OPEN)}
		>
			<CodeSpans text={tile.label} />
		</button>
	);
};

const Column = ({
	label,
	tiles,
	pickedIds,
	onPick,
}: {
	label: string;
	tiles: readonly PairTile[];
	pickedIds: readonly string[];
	onPick?: (id: string) => void;
}) => (
	<div role="group" aria-label={label} className={COLUMN}>
		{tiles.map((tile) => (
			<Tile
				key={tile.id}
				tile={tile}
				picked={pickedIds.includes(tile.id)}
				onPick={onPick}
			/>
		))}
	</div>
);

const LinkedPairs = ({
	left,
	right,
}: Pick<MatchingPairsProps, "left" | "right">) => (
	<ul aria-label={COPY.pairs} className={ROWS}>
		{left.map((tile, index) => {
			const partner = right[index];
			return (
				<li key={tile.id} className={ROW}>
					<Tile tile={tile} picked={false} />
					<span aria-hidden className={LINK}>
						{COPY.link}
					</span>
					{partner === undefined ? null : (
						<Tile tile={partner} picked={false} />
					)}
				</li>
			);
		})}
	</ul>
);

export const MatchingPairs = ({
	left,
	right,
	pickedIds = [],
	onPick,
	linked = false,
}: MatchingPairsProps) =>
	linked ? (
		<LinkedPairs left={left} right={right} />
	) : (
		<div className={COLUMNS}>
			<Column
				label={COPY.left}
				tiles={left}
				pickedIds={pickedIds}
				onPick={onPick}
			/>
			<Column
				label={COPY.right}
				tiles={right}
				pickedIds={pickedIds}
				onPick={onPick}
			/>
		</div>
	);

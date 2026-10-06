import { clsx } from "clsx";

import { Button } from "./Button.ui";
import type { KantoColor } from "./colors";

const COPY = {
	unnamed: "???",
	hint: "?",
	shuffle: "shuffle",
	groups: "groups to find",
	tiles: "tiles",
} as const;

const BLOCK = "flex w-full flex-col gap-3";
const HINTS = "flex flex-wrap gap-2";
const HINT =
	"rounded-md border border-dashed border-theme-faint px-2.5 py-1 text-sm text-theme-soft";
const GROUP = "flex flex-col gap-0.5 rounded-lg border px-4 py-3 text-center";
const GROUP_TONE = "border-theme bg-theme-soft text-theme";
const GROUP_LABEL = "text-sm font-bold text-theme-soft";
const GROUP_TILES = "text-sm";
const TILES = "grid grid-cols-3 gap-2 sm:grid-cols-4";
const TILE =
	"flex min-h-14 min-w-0 items-center justify-center rounded-lg border px-2 py-3 text-center text-sm font-bold wrap-anywhere transition-colors";
const TILE_IDLE = "border-theme-faint bg-theme-dim";
const TILE_PICKABLE = "cursor-pointer hover:bg-theme-raised";
const TILE_PICKED = "border-theme bg-theme-soft text-theme";
const FOOT = "flex justify-end";
const TILE_SEPARATOR = ", ";

export type GridVerdict = "right" | "wrong";

const VERDICT_COLOR = {
	right: "viridian",
	wrong: "cinnabar",
} satisfies Record<GridVerdict, KantoColor>;

export type GridTile = { id: string; label: string };

export type GridGroupRow = {
	label: string;
	tiles: readonly string[];
	verdict?: GridVerdict;
};

export type DependencyGridProps = {
	tiles: readonly GridTile[];
	groups: readonly GridGroupRow[];
	hints: readonly (string | null)[];
	pickedIds?: readonly string[];
	onPick?: (id: string) => void;
	onShuffle?: () => void;
};

const Hints = ({ hints }: { hints: readonly (string | null)[] }) =>
	hints.length === 0 ? null : (
		<ul aria-label={COPY.groups} className={HINTS}>
			{hints.map((hint, index) => (
				<li key={`${index}-${hint ?? COPY.unnamed}`} className={HINT}>
					{COPY.hint} {hint ?? COPY.unnamed}
				</li>
			))}
		</ul>
	);

const GroupRow = ({ label, tiles, verdict = "right" }: GridGroupRow) => (
	<div
		data-screen-theme={VERDICT_COLOR[verdict]}
		data-answer={verdict}
		className={clsx(GROUP, GROUP_TONE)}
	>
		<span className={GROUP_LABEL}>{label}</span>
		<span className={GROUP_TILES}>{tiles.join(TILE_SEPARATOR)}</span>
	</div>
);

const Tile = ({
	tile,
	picked,
	onPick,
}: {
	tile: GridTile;
	picked: boolean;
	onPick?: (id: string) => void;
}) =>
	onPick === undefined ? (
		<span className={clsx(TILE, TILE_IDLE)}>{tile.label}</span>
	) : (
		<button
			type="button"
			aria-pressed={picked}
			onClick={() => onPick(tile.id)}
			className={clsx(TILE, TILE_PICKABLE, picked ? TILE_PICKED : TILE_IDLE)}
		>
			{tile.label}
		</button>
	);

export const DependencyGrid = ({
	tiles,
	groups,
	hints,
	pickedIds = [],
	onPick,
	onShuffle,
}: DependencyGridProps) => (
	<div className={BLOCK}>
		<Hints hints={hints} />

		{groups.map((group) => (
			<GroupRow key={group.label} {...group} />
		))}

		{tiles.length === 0 ? null : (
			<div role="group" aria-label={COPY.tiles} className={TILES}>
				{tiles.map((tile) => (
					<Tile
						key={tile.id}
						tile={tile}
						picked={pickedIds.includes(tile.id)}
						onPick={onPick}
					/>
				))}
			</div>
		)}

		{onShuffle === undefined ? null : (
			<div className={FOOT}>
				<Button label={COPY.shuffle} onPress={onShuffle} />
			</div>
		)}
	</div>
);

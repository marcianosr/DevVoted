import type { CSSProperties } from "react";

import { Badge } from "./Badge.ui";
import { LedgerRows, type LedgerRow } from "./LedgerRows.ui";
import { Panel } from "./Panel.ui";
import { PanelTable } from "./PanelTable.ui";
import type { Redactable } from "./Redaction.ui";

const COPY = {
	sealed: "?",
	sealedLabel: "Sealed poll",
} as const;

const TILES = "grid grid-cols-5 gap-1.5";
const TILE =
	"seal-wiggle flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl border-[1.5px] border-dashed border-theme px-0.5 py-2 text-center text-theme";
const SEALED_MARK = "text-base font-extrabold";
const CATEGORY =
	"w-full text-[0.6875rem] leading-tight font-bold hyphens-auto wrap-anywhere";
const READER_ONLY = "sr-only";
const RULED = "border-t border-theme-faint";
const SHAPE =
	"w-full text-[0.625rem] leading-tight hyphens-auto wrap-anywhere text-theme-muted";

export type PollTile = Redactable<{ category: string; shape?: string }>;

export type PollTilesProps = {
	title: string;
	state: string;
	tiles: readonly PollTile[];
	after?: readonly LedgerRow[];
};

type TileStyle = CSSProperties & Record<"--tile-index", number>;

const tileStyleAt = (index: number): TileStyle => ({ "--tile-index": index });

const TileFace = ({ tile }: { tile: PollTile }) => {
	if (tile.locked === true)
		return (
			<>
				<span aria-hidden className={SEALED_MARK}>
					{COPY.sealed}
				</span>
				<span className={READER_ONLY}>{COPY.sealedLabel}</span>
			</>
		);

	return (
		<>
			<span className={CATEGORY}>{tile.category}</span>
			{tile.shape === undefined ? null : (
				<span className={SHAPE}>{tile.shape}</span>
			)}
		</>
	);
};

export const PollTiles = ({ title, state, tiles, after }: PollTilesProps) => (
	<Panel>
		<Panel.Header label={title} trailing={<Badge>{state}</Badge>} />
		<Panel.Body>
			<ol lang="en" className={TILES}>
				{tiles.map((tile, index) => (
					<li key={index} className={TILE} style={tileStyleAt(index)}>
						<TileFace tile={tile} />
					</li>
				))}
			</ol>
		</Panel.Body>
		{after === undefined || after.length === 0 ? null : (
			<Panel.Body className={RULED}>
				<PanelTable>
					<LedgerRows rows={after} tabled />
				</PanelTable>
			</Panel.Body>
		)}
	</Panel>
);

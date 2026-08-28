import { clsx } from "clsx";

import { type Rarity, RARITY_TONE } from "./rarity";

const CELL_SIZE = 2.6;
const CELL_RADIUS = 0.6;

const CELLS = {
	bit: [[6.7, 6.7]],
	crumb: [
		[4.9, 6.7],
		[8.5, 6.7],
	],
	nibble: [
		[4.9, 4.9],
		[8.5, 4.9],
		[4.9, 8.5],
		[8.5, 8.5],
	],
	byte: [
		[1.3, 4.9],
		[4.9, 4.9],
		[8.5, 4.9],
		[12.1, 4.9],
		[1.3, 8.5],
		[4.9, 8.5],
		[8.5, 8.5],
		[12.1, 8.5],
	],
} as const satisfies Record<Rarity, readonly (readonly [number, number])[]>;

export type RarityGlyphSize = "row" | "header";

const GLYPH = {
	row: "size-4",
	header: "size-6",
} as const satisfies Record<RarityGlyphSize, string>;

const SLOT = {
	row: "flex w-[22px] shrink-0 items-center justify-center",
	header: "flex w-9 shrink-0 items-center justify-center",
} as const satisfies Record<RarityGlyphSize, string>;

export type RarityGlyphProps = {
	rarity: Rarity;
	size?: RarityGlyphSize;
};

const CELLS_ROW = "flex w-16 shrink-0 items-center gap-[2px]";
const CELL_BOX = "size-1.5 shrink-0 rounded-[1px] bg-current";

export const RarityCells = ({ rarity }: { rarity: Rarity }) => (
	<span aria-hidden className={clsx(CELLS_ROW, RARITY_TONE[rarity])}>
		{CELLS[rarity].map(([x, y]) => (
			<span key={`${x}-${y}`} className={CELL_BOX} />
		))}
	</span>
);

export const RarityGlyph = ({ rarity, size = "row" }: RarityGlyphProps) => (
	<span className={SLOT[size]}>
		<svg
			viewBox="0 0 16 16"
			aria-hidden
			className={clsx(GLYPH[size], "shrink-0", RARITY_TONE[rarity])}
			fill="currentColor"
		>
			{CELLS[rarity].map(([x, y]) => (
				<rect
					key={`${x}-${y}`}
					x={x}
					y={y}
					width={CELL_SIZE}
					height={CELL_SIZE}
					rx={CELL_RADIUS}
				/>
			))}
		</svg>
		<span className="sr-only">{rarity}</span>
	</span>
);

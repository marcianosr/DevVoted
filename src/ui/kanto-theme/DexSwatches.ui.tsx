import { clsx } from "clsx";

import { DexPanel } from "./DexPanel.ui";
import { Panel } from "./Panel.ui";
import { Swatch, type SwatchFill } from "./Swatch.ui";

const GRID = "grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7";
const CARD =
	"flex flex-col items-start gap-2 rounded-lg border border-theme-faint bg-theme-raised p-3";
const NAME = "text-sm font-bold";
const EARNED_NAME = "text-theme-faint";
const UNEARNED_NAME = "text-theme-muted";
const NOTE = "text-xs text-theme-muted";
const SIZE = "hero";

export const SWEPT_NOTE = "swept";

export const gateNoteOf = (gate: number): string => `gate ${gate}`;

export type DexSwatchCard = {
	gate: number;
	name: string;
	swatch: SwatchFill;
	note: string;
};

export type DexSwatchesProps = {
	cards: readonly DexSwatchCard[];
	count: string;
	meta: string;
	note: string;
};

const isEarned = (card: DexSwatchCard): boolean =>
	card.swatch.state === "discovered";

export const DexSwatches = ({ cards, count, meta, note }: DexSwatchesProps) => (
	<DexPanel label="swatches" count={count} meta={meta} note={note}>
		<Panel.Body>
			<div className={GRID}>
				{cards.map((card) => (
					<div key={card.gate} className={CARD}>
						<Swatch {...card.swatch} size={SIZE} />
						<span
							className={clsx(
								NAME,
								isEarned(card) ? EARNED_NAME : UNEARNED_NAME
							)}
						>
							{card.name}
						</span>
						<span className={NOTE}>{card.note}</span>
					</div>
				))}
			</div>
		</Panel.Body>
	</DexPanel>
);

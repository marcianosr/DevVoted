import type { ReactNode } from "react";

import { Dot } from "./Dot.ui";
import { RARITY_ORDER } from "./rarity";
import { Text } from "./Text.ui";

const LEGEND = "flex flex-wrap items-center gap-4 border-t border-edge pt-3";
const ITEM = "inline-flex items-center gap-2";

/** `marker` is optional: a legend also keys columns, which have no swatch to show
 * — naming them is the whole entry. */
export type LegendItem = { id: string; marker?: ReactNode; label: string };

export type LegendProps = { items: readonly LegendItem[] };

/** Keyed in the rail the rows themselves wear, not in a dot: a legend that shows
 * a different marker from the thing it explains is one more thing to decode. */
export const RARITY_LEGEND: readonly LegendItem[] = RARITY_ORDER.map(
	(rarity) => ({
		id: rarity,
		marker: <Dot rarity={rarity} shape="bar" />,
		label: rarity,
	})
);

export const Legend = ({ items }: LegendProps) => (
	<ul className={LEGEND}>
		{items.map(({ id, marker, label }) => (
			<li key={id} className={ITEM}>
				{marker}
				<Text size="meta" tone="muted">
					{label}
				</Text>
			</li>
		))}
	</ul>
);

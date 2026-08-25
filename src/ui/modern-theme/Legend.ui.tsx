import type { ReactNode } from "react";

import { Dot } from "./Dot.ui";
import { RARITY_ORDER, RARITY_TEXT } from "./rarity";
import { Text } from "./Text.ui";

const LEGEND = "flex flex-wrap items-center gap-4 border-t border-edge pt-3";
const ITEM = "inline-flex items-center gap-2";

/** `marker` is optional: a legend also keys columns, which have no swatch to show
 * — naming them is the whole entry. `labelClassName` colours the word itself,
 * for keys whose name is the colour it explains. */
export type LegendItem = {
	id: string;
	marker?: ReactNode;
	label: string;
	labelClassName?: string;
};

export type LegendProps = { items: readonly LegendItem[] };

/** Keyed in the rail the rows themselves wear, not in a dot: a legend that shows
 * a different marker from the thing it explains is one more thing to decode.
 * The word takes the tier's colour too, the way RarityWord sets it elsewhere. */
export const RARITY_LEGEND: readonly LegendItem[] = RARITY_ORDER.map(
	(rarity) => ({
		id: rarity,
		marker: <Dot rarity={rarity} shape="bar" />,
		label: rarity,
		labelClassName: RARITY_TEXT[rarity],
	})
);

/** The colour sits on a span inside `Text`, never on `Text` itself: a second
 * `text-*` utility on the same element is settled by Tailwind's source order,
 * and the tone wins. */
export const Legend = ({ items }: LegendProps) => (
	<ul className={LEGEND}>
		{items.map(({ id, marker, label, labelClassName }) => (
			<li key={id} className={ITEM}>
				{marker}
				<Text size="meta" tone="muted">
					<span className={labelClassName}>{label}</span>
				</Text>
			</li>
		))}
	</ul>
);

import { clsx } from "clsx";

import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";

export type SwatchTrackLayout = "inline" | "stacked";

/**
 * Which question the row answers. A header asks how far up the climb you are; a
 * reward screen asks how much of the set you own. Same squares, and the sentence
 * stays derived from them either way so the two cannot drift.
 */
export type SwatchTrackCounting = "gates" | "swatches";

const TRACK = "flex items-center";

const LAYOUT = {
	inline: "flex-wrap gap-3",
	stacked: "flex-col gap-2",
} satisfies Record<SwatchTrackLayout, string>;

const CELLS = "flex flex-wrap items-center justify-center gap-1.5";

export type SwatchTrackItem = { gate: number } & (
	| { state: "earned" | "current"; theme: string }
	// Locked was never reached and pending was reached and not won: neither owns
	// a colour, so neither may name one.
	| { state: "locked" | "pending"; theme?: never }
);

export type SwatchTrackProps = {
	items: readonly SwatchTrackItem[];
	layout?: SwatchTrackLayout;
	counting?: SwatchTrackCounting;
};

const earnedCount = (items: readonly SwatchTrackItem[]) =>
	items.filter(({ state }) => state === "earned").length;

// Gates carry their own number and count from 0, so the climb label reads
// against the last gate on the ladder, not against how many squares are drawn.
const describe = (
	items: readonly SwatchTrackItem[],
	counting: SwatchTrackCounting
) => {
	if (counting === "swatches")
		return `${earnedCount(items)} of ${items.length} collected`;

	const current = items.find(({ state }) => state === "current");
	if (current) return `gate ${current.gate} / ${items[items.length - 1].gate}`;

	return `${earnedCount(items)} / ${items.length} gates cleared`;
};

export const SwatchTrack = ({
	items,
	layout = "inline",
	counting = "gates",
}: SwatchTrackProps) => (
	<div className={clsx(TRACK, LAYOUT[layout])}>
		<span className={CELLS} aria-hidden="true">
			{items.map(({ gate, state, theme }) => (
				<Swatch key={gate} size="pip" state={state} theme={theme} />
			))}
		</span>
		<Text size="meta" tone="muted">
			{describe(items, counting)}
		</Text>
	</div>
);

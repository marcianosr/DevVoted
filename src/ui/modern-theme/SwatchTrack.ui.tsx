import { clsx } from "clsx";

import { Swatch } from "./Swatch.ui";
import { Text } from "./Text.ui";

export type SwatchTrackLayout = "inline" | "stacked";

export type SwatchTrackCounting = "gates" | "swatches";

const TRACK = "flex items-center";

const LAYOUT = {
	inline: "flex-wrap gap-3",
	stacked: "flex-col gap-2",
} satisfies Record<SwatchTrackLayout, string>;

const CELLS = "flex flex-wrap items-center justify-center gap-1.5";

export type SwatchTrackItem = { gate: number } & (
	| { state: "earned" | "current"; theme: string }
	| { state: "locked" | "pending"; theme?: never }
);

export type SwatchTrackProps = {
	items: readonly SwatchTrackItem[];
	layout?: SwatchTrackLayout;
	counting?: SwatchTrackCounting;
};

const earnedCount = (items: readonly SwatchTrackItem[]) =>
	items.filter(({ state }) => state === "earned").length;

const describe = (
	items: readonly SwatchTrackItem[],
	counting: SwatchTrackCounting
) => {
	if (counting === "swatches")
		return `${earnedCount(items)} of ${items.length} collected`;

	const current = items.find(({ state }) => state === "current");
	// Gates count from 0, so this reads against the last gate's number, not the
	// number of squares drawn.
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

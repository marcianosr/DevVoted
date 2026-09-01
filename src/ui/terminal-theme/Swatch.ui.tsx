import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type {
	SwatchFinish,
	SwatchTheme,
} from "~/modules/run/gate/domain/swatch.model";
import { swatchTheme } from "~/ui/theme/swatchTheme";

export type { SwatchFinish };

export type SwatchState = "earned" | "current" | "locked" | "pending";
export type SwatchSize = "pip" | "badge" | "tile" | "card" | "hero";

const SIZE = {
	pip: "size-3.5 rounded",
	badge: "size-5 rounded-md",
	tile: "size-10 rounded-lg @max-md:size-5 @max-md:rounded-md",
	// The only size that takes its width from the grid rather than setting one:
	// a paint chip in a catalogue is a swatch of colour, not a token.
	card: "h-14 w-full rounded-lg @max-md:h-10",
	hero: "size-14 rounded-xl",
} satisfies Record<SwatchSize, string>;

const STATE = {
	earned: "bg-theme",
	current: "border-2 border-theme bg-theme-soft",
	locked: "bg-zinc-800",
	pending: "border-2 border-dashed border-zinc-600",
} satisfies Record<SwatchState, string>;

// The summit pair, where the palette runs out: indigo needs a rim to read
// against the page, and the Champion has no single colour to set at all.
const FINISH = {
	flat: "",
	plate: "ring-1 ring-pewter",
	fill: "bg-legendary",
} satisfies Record<SwatchFinish, string>;

const swatchVariants = cva("inline-block shrink-0", {
	variants: { size: SIZE, state: STATE, finish: FINISH },
});

const glowOf = (state: SwatchState, size: SwatchSize) => {
	if (state === "locked" || state === "pending") return undefined;
	return size === "hero" ? "glow-theme" : "glow-theme-soft";
};

export type SwatchProps = {
	theme?: SwatchTheme;
	state?: SwatchState;
	size?: SwatchSize;
	finish?: SwatchFinish;
	className?: string;
};

export const Swatch = ({
	theme,
	state = "earned",
	size = "pip",
	finish = "flat",
	className,
}: SwatchProps) => (
	<span
		{...swatchTheme(theme)}
		className={clsx(
			swatchVariants({ size, state, finish }),
			glowOf(state, size),
			className
		)}
	/>
);

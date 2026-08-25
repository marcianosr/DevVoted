import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { SwatchFinish } from "~/modules/run/gate/domain/swatch.model";

export type SwatchSize = "pip" | "badge" | "award";
export type SwatchState = "earned" | "current" | "locked" | "pending";

export type { SwatchFinish };

const SWATCH = "inline-block shrink-0";

const SIZE = {
	pip: "size-4 rounded",
	badge: "size-5 rounded-md",
	award: "size-24 rounded-3xl glow-theme",
} satisfies Record<SwatchSize, string>;

// Only `earned` is filled. Standing on a gate is not clearing it, so `current`
// is the outline of the swatch on offer — its colour, ringed to mark the place,
// and hollow until the gate hands it over.
const STATE = {
	earned: "bg-theme",
	current: "outline-2 outline-offset-2 outline-theme",
	locked: "bg-zinc-800",
	pending: "border-2 border-dashed border-zinc-600",
} satisfies Record<SwatchState, string>;

const FINISH = {
	flat: "",
	plate: "ring-1 ring-pewter",
	fill: "bg-legendary",
} satisfies Record<SwatchFinish, string>;

const swatchVariants = cva(SWATCH, {
	variants: { size: SIZE, state: STATE, finish: FINISH },
});

export type SwatchProps = {
	size?: SwatchSize;
	state?: SwatchState;
	finish?: SwatchFinish;
	theme?: string;
	className?: string;
};

const themeAttribute = (theme?: string) =>
	theme ? { "data-swatch-theme": theme } : {};

export const Swatch = ({
	size = "badge",
	state = "earned",
	finish = "flat",
	theme,
	className,
}: SwatchProps) => (
	<span
		{...themeAttribute(theme)}
		className={clsx(swatchVariants({ size, state, finish }), className)}
	/>
);

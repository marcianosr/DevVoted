import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type SwatchSize = "pip" | "badge" | "award";
export type SwatchState = "earned" | "current" | "locked" | "pending";

/** The domain's own word for it (swatch.model.ts): Champion is a "fill", the one
 * swatch app.css gives no --theme-color because it wears the Kanto gradient. */
export type SwatchFinish = "flat" | "fill";

const SWATCH = "inline-block shrink-0";

const SIZE = {
	pip: "size-4 rounded",
	badge: "size-5 rounded-md",
	award: "size-24 rounded-3xl glow-theme",
} satisfies Record<SwatchSize, string>;

const STATE = {
	earned: "bg-theme",
	current: "bg-theme outline-2 outline-offset-2 outline-theme",
	locked: "bg-zinc-800",
	pending: "border-2 border-dashed border-zinc-600",
} satisfies Record<SwatchState, string>;

// bg-legendary is a background-image, so it paints over the state's background
// colour without either having to know about the other.
const FINISH = {
	flat: "",
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

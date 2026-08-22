import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type SwatchSize = "pip" | "badge";
export type SwatchState = "earned" | "current" | "locked";

const SWATCH = "inline-block shrink-0 rounded";

const SIZE = {
	pip: "size-4",
	badge: "size-6",
} satisfies Record<SwatchSize, string>;

const STATE = {
	earned: "bg-theme",
	current: "border-2 border-theme bg-theme-soft",
	locked: "bg-zinc-800",
} satisfies Record<SwatchState, string>;

const swatchVariants = cva(SWATCH, {
	variants: { size: SIZE, state: STATE },
});

export type SwatchProps = {
	state: SwatchState;
	size?: SwatchSize;
	theme?: string;
};

// Overrides the ambient gate colour for this square only (app.css owns the values).
const themeAttribute = (theme?: string) =>
	theme ? { "data-swatch-theme": theme } : {};

export const Swatch = ({ state, size = "pip", theme }: SwatchProps) => (
	<span
		{...themeAttribute(theme)}
		className={clsx(swatchVariants({ size, state }))}
	/>
);

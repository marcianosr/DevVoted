import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type SwatchSize = "pip" | "badge" | "award";
export type SwatchState = "earned" | "current" | "locked" | "pending";

const SWATCH = "inline-block shrink-0";

// The glow belongs to the award size rather than a prop of its own: nothing
// smaller is big enough to carry one, so a glowing pip is not worth expressing.
const SIZE = {
	pip: "size-4 rounded",
	badge: "size-5 rounded-md",
	award: "size-24 rounded-3xl glow-theme",
} satisfies Record<SwatchSize, string>;

// The current square is filled, not hollow: on a track of twelve it has to read
// as one of the earned ones plus a marker, not as a gap between them. Pending is
// the one hollow state — a gate reached and not won, which is neither a square
// you own nor one you have never seen.
const STATE = {
	earned: "bg-theme",
	current: "bg-theme outline-2 outline-offset-2 outline-theme",
	locked: "bg-zinc-800",
	pending: "border-2 border-dashed border-zinc-600",
} satisfies Record<SwatchState, string>;

const swatchVariants = cva(SWATCH, { variants: { size: SIZE, state: STATE } });

export type SwatchProps = {
	size?: SwatchSize;
	state?: SwatchState;
	theme?: string;
	className?: string;
};

const themeAttribute = (theme?: string) =>
	theme ? { "data-swatch-theme": theme } : {};

export const Swatch = ({
	size = "badge",
	state = "earned",
	theme,
	className,
}: SwatchProps) => (
	<span
		{...themeAttribute(theme)}
		className={clsx(swatchVariants({ size, state }), className)}
	/>
);

import { clsx } from "clsx";

import type { GateSwatch } from "~/modules/run/gate/domain/swatch.model";

export type SwatchSize = "small" | "large" | "hero";

export type SwatchFill =
	| { state: "discovered"; swatch: GateSwatch; marked?: boolean }
	| { state: "current"; swatch: GateSwatch }
	| { state: "undiscovered" };

export type SwatchState = SwatchFill["state"];

/** A fill that may carry a figure in its well. See `count` on `SwatchProps`. */
export type SwatchMark = SwatchFill & { count?: number };

/** How light the surface behind the mark is. Everything here is pitched at `dark`. */
export type SwatchGround = "dark" | "bright";

const BASE = "inline-block shrink-0";

const SIZE = {
	small: "size-3.5 rounded-xs",
	large: "size-7 rounded-md",
	hero: "size-10 rounded-lg",
} satisfies Record<SwatchSize, string>;

const FILL = {
	discovered: "bg-theme",
	current: "border-2 border-dashed border-theme bg-theme-raised",
	undiscovered: "bg-theme-raised",
} satisfies Record<SwatchState, string>;

/**
 * The same three marks on a ground lighter than they are. Every fill above is
 * pitched against the near-black screen and inverts badly on a bright one: the
 * well the dashes enclose becomes a dark chip, and `border-theme` is the raw
 * theme colour, which on a surface wearing that colour is the ground itself.
 *
 * `current` rather than a second set of theme rungs, because the only bright
 * ground in the kit is the primary press, and the utility painting it ships an
 * ink already tuned to clear AA against its own fill across all twelve hues.
 * Borrowing that ink is how the mark stays legible without the swatch having to
 * learn which hue it is standing on.
 */
const ON_BRIGHT = {
	discovered: "bg-current",
	current: "border-2 border-dashed border-current",
	undiscovered: "bg-current/25",
} satisfies Record<SwatchState, string>;

/**
 * A `current` mark is an empty dashed well, which is room a figure can sit in
 * without the mark losing its shape. Only applied when there is one, so every
 * swatch that carries nothing keeps its `inline-block` box exactly as it was.
 */
const COUNTED = "inline-flex items-center justify-center text-xs leading-none";

const PLATE = "ring-1 ring-pewter";
const MARK = "legendary-ring";
const PRISMATIC = {
	discovered: "bg-legendary",
	current: "legendary-ring",
} as const;

export type SwatchProps = SwatchFill & {
	size?: SwatchSize;
	ground?: SwatchGround;
	/** A figure to stand in the mark's well. Sized for `large` and up. */
	count?: number;
};

export const Swatch = (props: SwatchProps) => {
	const size = SIZE[props.size ?? "large"];
	const fill = props.ground === "bright" ? ON_BRIGHT : FILL;
	const counted = props.count === undefined ? undefined : COUNTED;

	if (props.state === "undiscovered") {
		return (
			<span className={clsx(BASE, size, fill.undiscovered, counted)}>
				{props.count}
			</span>
		);
	}

	if (props.swatch.finish === "fill") {
		return (
			<span className={clsx(BASE, size, PRISMATIC[props.state], counted)}>
				{props.count}
			</span>
		);
	}

	return (
		<span
			data-swatch-theme={props.swatch.theme}
			className={clsx(
				BASE,
				size,
				fill[props.state],
				props.swatch.finish === "plate" && PLATE,
				props.state === "discovered" && props.marked === true && MARK,
				counted
			)}
		>
			{props.count}
		</span>
	);
};

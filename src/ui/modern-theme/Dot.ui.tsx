import { clsx } from "clsx";

import { RARITY_FILL, type Rarity } from "./rarity";

const DOT = "inline-block shrink-0";

export type DotTone = "theme" | "celadon" | "saffron" | "cinnabar" | "muted";

/** Mark's two words for the same distinction, declared here rather than imported
 * so the two primitives stay uncoupled, plus `bar` — the shape a config row
 * wears its rarity in, so a legend can key the rows in their own marker.
 *
 * The size sits in the variant, not the base: two width utilities on one element
 * leaves the winner to Tailwind's source order. */
export type DotShape = "disc" | "box" | "bar";

const SHAPE = {
	disc: "size-1.5 rounded-full",
	box: "size-1.5 rounded-xs",
	bar: "h-4 w-1 rounded-full",
} satisfies Record<DotShape, string>;

const TONE_FILL = {
	theme: "bg-theme",
	celadon: "bg-celadon",
	saffron: "bg-saffron",
	cinnabar: "bg-cinnabar",
	muted: "bg-zinc-700",
} satisfies Record<DotTone, string>;

const TONE_RING = {
	theme: "border border-theme",
	celadon: "border border-celadon",
	saffron: "border border-saffron",
	cinnabar: "border border-cinnabar",
	muted: "border border-zinc-600",
} satisfies Record<DotTone, string>;

export type DotProps = { shape?: DotShape } & (
	| { rarity: Rarity; tone?: never; hollow?: never }
	| { tone: DotTone; rarity?: never; hollow?: boolean }
);

const fill = (props: DotProps) => {
	if (props.rarity) return RARITY_FILL[props.rarity];
	return props.hollow ? TONE_RING[props.tone] : TONE_FILL[props.tone];
};

// Props stay whole rather than destructured: a rest spread off a discriminated
// union drops the discriminant, and `fill` needs it.
export const Dot = (props: DotProps) => (
	<span
		aria-hidden
		className={clsx(DOT, SHAPE[props.shape ?? "disc"], fill(props))}
	/>
);

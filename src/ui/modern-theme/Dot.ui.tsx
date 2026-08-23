import { clsx } from "clsx";

import { RARITY_FILL, type Rarity } from "./rarity";

const DOT = "inline-block size-1.5 shrink-0";

export type DotTone = "theme" | "celadon" | "saffron" | "cinnabar" | "muted";

/** Same two words Mark uses for the same distinction, declared here rather than
 * imported so the two primitives stay uncoupled. A legend keying chips wants the
 * chip's shape; a legend keying rarity wants the dot's. */
export type DotShape = "disc" | "box";

const SHAPE = {
	disc: "rounded-full",
	box: "rounded-xs",
} satisfies Record<DotShape, string>;

const TONE_FILL = {
	theme: "bg-theme",
	celadon: "bg-celadon",
	saffron: "bg-saffron",
	cinnabar: "bg-cinnabar",
	muted: "bg-zinc-700",
} satisfies Record<DotTone, string>;

export type DotProps = { shape?: DotShape } & (
	{ rarity: Rarity; tone?: never } | { tone: DotTone; rarity?: never }
);

const fill = (props: DotProps) =>
	props.rarity ? RARITY_FILL[props.rarity] : TONE_FILL[props.tone];

// Props stay whole rather than destructured: a rest spread off a discriminated
// union drops the discriminant, and `fill` needs it.
export const Dot = (props: DotProps) => (
	<span
		aria-hidden
		className={clsx(DOT, SHAPE[props.shape ?? "disc"], fill(props))}
	/>
);

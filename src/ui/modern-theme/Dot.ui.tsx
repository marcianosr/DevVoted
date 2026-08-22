import { clsx } from "clsx";

import { RARITY_FILL, type Rarity } from "./rarity";

const DOT = "inline-block size-1.5 shrink-0 rounded-full";

export type DotTone = "theme" | "celadon" | "saffron" | "cinnabar" | "muted";

const TONE_FILL = {
	theme: "bg-theme",
	celadon: "bg-celadon",
	saffron: "bg-saffron",
	cinnabar: "bg-cinnabar",
	muted: "bg-zinc-700",
} satisfies Record<DotTone, string>;

export type DotProps =
	{ rarity: Rarity; tone?: never } | { tone: DotTone; rarity?: never };

const fill = (props: DotProps) =>
	props.rarity ? RARITY_FILL[props.rarity] : TONE_FILL[props.tone];

export const Dot = (props: DotProps) => (
	<span aria-hidden className={clsx(DOT, fill(props))} />
);

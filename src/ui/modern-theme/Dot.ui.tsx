import { clsx } from "clsx";

const DOT = "inline-block shrink-0";

export type DotTone = "theme" | "celadon" | "saffron" | "cinnabar" | "muted";

export type DotShape = "disc" | "box";

const SHAPE = {
	disc: "size-1.5 rounded-full",
	box: "size-1.5 rounded-xs",
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

export type DotProps = {
	tone: DotTone;
	shape?: DotShape;
	hollow?: boolean;
};

export const Dot = ({ tone, shape = "disc", hollow }: DotProps) => (
	<span
		aria-hidden
		className={clsx(
			DOT,
			SHAPE[shape],
			hollow ? TONE_RING[tone] : TONE_FILL[tone]
		)}
	/>
);

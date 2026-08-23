import type { ReactNode } from "react";

import { clsx } from "clsx";

import { RARITY_BORDER, type Rarity } from "./rarity";
import { Text } from "./Text.ui";

const CHIP = "inline-flex shrink-0 items-center";

// A rarity chip is an outline round a config's name; a category chip is a tinted
// label. Same pill, opposite jobs — the union keeps a caller from asking for both.
const OUTLINE = "border";

export type ChipSize = "sm" | "lg";

// lg is a figure the eye is meant to land on rather than a label it reads in
// passing, so it grows in both axes and softens its corner to match.
const SIZE = {
	sm: "rounded-md px-2 py-0.5",
	lg: "rounded-lg px-4 py-2",
} satisfies Record<ChipSize, string>;

export type ChipTone =
	| "theme"
	| "cerulean"
	| "celadon"
	| "saffron"
	| "cinnabar"
	| "muted"
	| "raised";

// raised is the one tone that carries no meaning: a surface for a figure that
// states its own colour inside, the way a coverage total does.
const TINT = {
	theme: "bg-theme-soft text-theme",
	cerulean: "bg-cerulean/15 text-cerulean",
	celadon: "bg-celadon/15 text-celadon",
	saffron: "bg-saffron/15 text-saffron",
	cinnabar: "bg-cinnabar/15 text-cinnabar",
	muted: "bg-zinc-100/10 text-zinc-400",
	raised: "bg-surface-raised text-zinc-100",
} satisfies Record<ChipTone, string>;

export type ChipProps = { children: ReactNode } & (
	| { rarity: Rarity; tone?: never; size?: never }
	| { tone: ChipTone; size?: ChipSize; rarity?: never }
);

export const Chip = (props: ChipProps) => {
	if ("tone" in props && props.tone) {
		const { size = "sm" } = props;

		return (
			<span className={clsx(CHIP, SIZE[size], TINT[props.tone])}>
				<Text size={size === "lg" ? "body" : "meta"} tone="inherit">
					{props.children}
				</Text>
			</span>
		);
	}

	return (
		<span className={clsx(CHIP, SIZE.sm, OUTLINE, RARITY_BORDER[props.rarity])}>
			<Text size="body">{props.children}</Text>
		</span>
	);
};

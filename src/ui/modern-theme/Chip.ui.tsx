import type { ReactNode } from "react";

import { clsx } from "clsx";

import { RARITY_BORDER, type Rarity } from "./rarity";
import { Text } from "./Text.ui";

const CHIP = "inline-flex shrink-0 items-center rounded-md px-2 py-0.5";

// A rarity chip is an outline round a config's name; a category chip is a tinted
// label. Same pill, opposite jobs — the union keeps a caller from asking for both.
const OUTLINE = "border";

export type ChipTone =
	"theme" | "cerulean" | "viridian" | "saffron" | "cinnabar" | "muted";

const TINT = {
	theme: "bg-theme-soft text-theme",
	cerulean: "bg-cerulean/15 text-cerulean",
	viridian: "bg-viridian/15 text-viridian",
	saffron: "bg-saffron/15 text-saffron",
	cinnabar: "bg-cinnabar/15 text-cinnabar",
	muted: "bg-zinc-100/10 text-zinc-400",
} satisfies Record<ChipTone, string>;

export type ChipProps = { children: ReactNode } & (
	{ rarity: Rarity; tone?: never } | { tone: ChipTone; rarity?: never }
);

export const Chip = (props: ChipProps) => {
	if ("tone" in props && props.tone) {
		return (
			<span className={clsx(CHIP, TINT[props.tone])}>
				<Text size="meta" tone="inherit">
					{props.children}
				</Text>
			</span>
		);
	}

	return (
		<span className={clsx(CHIP, OUTLINE, RARITY_BORDER[props.rarity])}>
			<Text size="body">{props.children}</Text>
		</span>
	);
};

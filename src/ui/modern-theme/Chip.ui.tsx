import type { ReactNode } from "react";

import { clsx } from "clsx";

import { RARITY_BORDER, type Rarity } from "./rarity";
import { Text } from "./Text.ui";

const CHIP = "inline-flex shrink-0 items-center";

/** A badge is a figure, and a figure is read before the prose around it. */
const FIGURE = "font-bold";

const OUTLINE = "border";

export type ChipSize = "sm" | "lg";

const SIZE = {
	sm: "rounded-md px-2 py-0.5",
	lg: "rounded-lg px-4 py-2",
} satisfies Record<ChipSize, string>;

export type ChipTone =
	| "theme"
	| "cerulean"
	| "celadon"
	| "saffron"
	| "vermillion"
	| "cinnabar"
	| "muted"
	| "raised";

const TINT = {
	theme: "bg-theme-soft text-theme",
	cerulean: "bg-cerulean/15 text-cerulean",
	celadon: "bg-celadon/15 text-celadon",
	saffron: "bg-saffron/15 text-saffron",
	vermillion: "bg-vermillion/15 text-vermillion",
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
				<Text
					size={size === "lg" ? "body" : "meta"}
					tone="inherit"
					className={FIGURE}
				>
					{props.children}
				</Text>
			</span>
		);
	}

	return (
		<span className={clsx(CHIP, SIZE.sm, OUTLINE, RARITY_BORDER[props.rarity])}>
			<Text size="body" className={FIGURE}>
				{props.children}
			</Text>
		</span>
	);
};

/** Signs and multipliers only. A bare integer stays prose: "1 in 4 gate clears"
 * counts gates, and chipping the 1 would badge the wrong half of the odds. */
const FIGURE_TOKEN =
	/(\d+(?:\.\d+)?×|×\d+(?:\.\d+)?|[+−-]\d+(?:\.\d+)?(?:%|\s?KB)?)/;

const figureTone = (token: string): ChipTone =>
	token.startsWith("−") || token.startsWith("-") ? "cinnabar" : "celadon";

/**
 * A sentence with its figures chipped, so the number in the prose and the badge
 * at the end of the row are recognisably the same fact. Colour follows Delta's
 * rule rather than a second one: a multiplier is celadon, a signed figure takes
 * the colour of its sign.
 */
export const chipFigures = (text: string): ReactNode =>
	text.split(FIGURE_TOKEN).map((part, index) =>
		index % 2 === 0 ? (
			part
		) : (
			<Chip key={`${part}-${index}`} tone={figureTone(part)}>
				{part}
			</Chip>
		)
	);

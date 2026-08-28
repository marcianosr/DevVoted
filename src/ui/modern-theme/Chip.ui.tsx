import type { ReactNode } from "react";

import { clsx } from "clsx";

import { type Rarity } from "./rarity";
import { RarityGlyph } from "./RarityGlyph.ui";
import { Text } from "./Text.ui";

const CHIP = "inline-flex shrink-0 items-center";
const KEYED = "gap-1";

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

const OUTLINE_TINT = {
	theme: "border-theme/50 text-theme",
	cerulean: "border-cerulean/50 text-cerulean",
	celadon: "border-celadon/50 text-celadon",
	saffron: "border-saffron/50 text-saffron",
	vermillion: "border-vermillion/50 text-vermillion",
	cinnabar: "border-cinnabar/50 text-cinnabar",
	muted: "border-edge-strong text-zinc-400",
	raised: "border-control-edge text-zinc-100",
} satisfies Record<ChipTone, string>;

export type ChipProps = { children: ReactNode } & (
	| { rarity: Rarity; size?: ChipSize; tone?: never; outline?: never }
	| { tone: ChipTone; size?: ChipSize; outline?: boolean; rarity?: never }
);

export const Chip = (props: ChipProps) => {
	if ("tone" in props && props.tone) {
		const { size = "sm" } = props;

		return (
			<span
				className={clsx(
					CHIP,
					SIZE[size],
					props.outline
						? clsx(OUTLINE, OUTLINE_TINT[props.tone])
						: TINT[props.tone]
				)}
			>
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

	const { size = "sm" } = props;
	return (
		<span className={clsx(CHIP, KEYED, SIZE[size], TINT.raised)}>
			{size === "lg" ? <RarityGlyph rarity={props.rarity} /> : null}
			<Text size={size === "lg" ? "body" : "meta"} className={FIGURE}>
				{props.children}
			</Text>
		</span>
	);
};

const FIGURE_TOKEN =
	/(\d+(?:\.\d+)?×|×\d+(?:\.\d+)?|[+−-]\d+(?:\.\d+)?(?:%|\s?KB)?)/;

const figureTone = (token: string): ChipTone =>
	token.startsWith("−") || token.startsWith("-") ? "cinnabar" : "celadon";

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

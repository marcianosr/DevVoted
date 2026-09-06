import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { TERMINAL_TONE, type TerminalTone } from "./tones";

export type TextSize = "caption" | "base" | "lead" | "title" | "score" | "hero";
export type TextWeight = "thin";

const SIZE = {
	caption: "text-xs",
	base: "text-sm",
	lead: "text-sm",
	title: "text-base",
	score: "text-xl",
	hero: "text-2xl",
} satisfies Record<TextSize, string>;

const WEIGHT = {
	thin: "font-normal",
} satisfies Record<TextWeight, string>;

const textVariants = cva("tabular-nums", {
	variants: { size: SIZE, tone: TERMINAL_TONE, weight: WEIGHT },
});

export type TextProps = {
	children: ReactNode;
	as?: ElementType;
	size?: TextSize;
	tone?: TerminalTone;
	weight?: TextWeight;
	className?: string;
	"aria-hidden"?: boolean;
};

export const Text = ({
	children,
	as: Tag = "span",
	size = "base",
	tone = "default",
	weight,
	className,
	"aria-hidden": ariaHidden,
}: TextProps) => (
	<Tag
		aria-hidden={ariaHidden}
		className={clsx(textVariants({ size, tone, weight }), className)}
	>
		{children}
	</Tag>
);

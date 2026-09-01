import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { TERMINAL_TONE, type TerminalTone } from "./tones";

export type TextSize = "caption" | "base" | "lead" | "title" | "score" | "hero";

const SIZE = {
	caption: "text-xs",
	base: "text-sm",
	lead: "text-sm",
	title: "text-base",
	score: "text-xl",
	hero: "text-2xl",
} satisfies Record<TextSize, string>;

const textVariants = cva("tabular-nums", {
	variants: { size: SIZE, tone: TERMINAL_TONE },
});

export type TextProps = {
	children: ReactNode;
	as?: ElementType;
	size?: TextSize;
	tone?: TerminalTone;
	className?: string;
};

export const Text = ({
	children,
	as: Tag = "span",
	size = "base",
	tone = "default",
	className,
}: TextProps) => (
	<Tag className={clsx(textVariants({ size, tone }), className)}>
		{children}
	</Tag>
);

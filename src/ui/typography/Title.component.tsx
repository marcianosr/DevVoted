import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { TEXT_TONE, type TextTone } from "./textTone";

type TitleLevel = "h1" | "h2" | "h3";

/**
 * Size is keyed off `as` rather than a prop of its own: the level a screen
 * reader announces and the size a sighted reader sees are one decision, and
 * splitting them is how they drifted apart before — every level rendered at
 * body size because the class naming them (`text-md`) does not exist in
 * Tailwind, so h1 and h3 were announced as different and looked identical.
 */
const title = cva("font-semibold tracking-tight", {
	variants: {
		as: {
			h1: "text-lg",
			h2: "text-base",
			h3: "text-sm",
		} satisfies Record<TitleLevel, string>,
		tone: TEXT_TONE,
	},
});

type TitleProps = {
	children: ReactNode;
	as?: TitleLevel;
	tone?: TextTone;
	className?: string;
};

export const Title = ({
	children,
	as: Tag = "h1",
	tone = "default",
	className = "",
}: TitleProps) => (
	<Tag className={clsx(title({ as: Tag, tone }), className)}>{children}</Tag>
);

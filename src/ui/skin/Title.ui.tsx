import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type TitleLevel = "h1" | "h2" | "h3";

const TITLE = "font-semibold tracking-tight text-zinc-300";

// Size is keyed off `as` so the announced level and the rendered size stay one decision.
const SIZE = {
	h1: "text-base",
	h2: "text-sm",
	h3: "text-xs",
} satisfies Record<TitleLevel, string>;

const titleVariants = cva(TITLE, { variants: { as: SIZE } });

export type TitleProps = {
	children: ReactNode;
	as?: TitleLevel;
	className?: string;
};

export const Title = ({ children, as: Tag = "h2", className }: TitleProps) => (
	<Tag className={clsx(titleVariants({ as: Tag }), className)}>{children}</Tag>
);

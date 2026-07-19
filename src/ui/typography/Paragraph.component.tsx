import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type ParagraphSize = "xs" | "sm";
export type ParagraphTone =
	| "default"
	| "theme"
	| "pewter"
	| "muted"
	| "celadon"
	| "vermillion"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "lavender"
	| "gradient";

const paragraph = cva("tracking-tight", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
		} satisfies Record<ParagraphSize, string>,
		tone: {
			default: "text-zinc-100",
			theme: "text-theme",
			pewter: "text-pewter",
			celadon: "text-celadon",
			vermillion: "text-vermillion",
			viridian: "text-viridian",
			cinnabar: "text-cinnabar",
			saffron: "text-saffron",
			lavender: "text-lavender",
			muted: "text-zinc-400",
			gradient: "text-gradient-green",
		} satisfies Record<ParagraphTone, string>,
	},
});

type ParagraphProps = {
	children: ReactNode;
	as?: ElementType;
	size?: ParagraphSize;
	tone?: ParagraphTone;
	className?: string;
};

export const Paragraph = ({
	children,
	as: Tag = "p",
	size = "xs",
	tone = "default",
	className = "",
}: ParagraphProps) => (
	<Tag className={clsx(paragraph({ size, tone }), className)}>{children}</Tag>
);

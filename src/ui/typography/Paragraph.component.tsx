import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type ParagraphSize = "xs" | "sm";
type ParagraphTone =
	| "default"
	| "theme"
	| "pewter"
	| "muted"
	| "celadon"
	| "vermillion"
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

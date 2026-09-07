import type { ElementType, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { TEXT_TONE, type TextTone } from "./textTone";

type ParagraphSize = "xs" | "sm";

const paragraph = cva("tracking-tight", {
	variants: {
		size: {
			xs: "text-xs",
			sm: "text-sm",
		} satisfies Record<ParagraphSize, string>,
		tone: TEXT_TONE,
	},
});

type ParagraphProps = {
	children: ReactNode;
	as?: ElementType;
	size?: ParagraphSize;
	tone?: TextTone;
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

import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { TEXT_TONE, type TextTone } from "./textTone";

const subtitle = cva("text-xs font-medium tracking-tight", {
	variants: {
		tone: TEXT_TONE,
	},
});

type SubtitleProps = {
	children: ReactNode;
	as?: "h2" | "h3" | "p";
	tone?: TextTone;
	className?: string;
};

export const Subtitle = ({
	children,
	as: Tag = "h2",
	tone = "muted",
	className = "",
}: SubtitleProps) => (
	<Tag className={clsx(subtitle({ tone }), className)}>{children}</Tag>
);

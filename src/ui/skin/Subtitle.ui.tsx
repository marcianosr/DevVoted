import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import { SKIN_TONE, type SkinTone } from "./tones";

const SUBTITLE = "text-xs tracking-tight";

const subtitleVariants = cva(SUBTITLE, { variants: { tone: SKIN_TONE } });

export type SubtitleProps = {
	children: ReactNode;
	tone?: SkinTone;
	as?: "span" | "p";
	className?: string;
};

export const Subtitle = ({
	children,
	tone = "muted",
	as: Tag = "span",
	className,
}: SubtitleProps) => (
	<Tag className={clsx(subtitleVariants({ tone }), className)}>{children}</Tag>
);

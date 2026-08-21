import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type SubtitleTone = "muted" | "default";

const subtitle = cva("text-xs tracking-tight", {
	variants: {
		tone: {
			muted: "text-pewter",
			default: "text-zinc-300",
		} satisfies Record<SubtitleTone, string>,
	},
});

export type SubtitleProps = {
	children: ReactNode;
	tone?: SubtitleTone;
	as?: "span" | "p";
	className?: string;
};

export const Subtitle = ({
	children,
	tone = "muted",
	as: Tag = "span",
	className,
}: SubtitleProps) => (
	<Tag className={clsx(subtitle({ tone }), className)}>{children}</Tag>
);

import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type BadgeTone =
	| "neutral"
	| "muted"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "celadon"
	| "cerulean"
	| "lavender";

export type BadgeSize = "sm" | "md";

const TONE = {
	neutral: "border-edge-strong text-zinc-200",
	muted: "border-edge text-zinc-400",
	viridian: "border-viridian/40 bg-viridian/10 text-viridian",
	cinnabar: "border-cinnabar/40 bg-cinnabar/10 text-cinnabar",
	saffron: "border-saffron/40 bg-saffron/10 text-saffron",
	celadon: "border-celadon/40 bg-celadon/10 text-celadon",
	cerulean: "border-cerulean/40 bg-cerulean/10 text-cerulean",
	lavender: "border-lavender/40 bg-lavender/10 text-lavender",
} satisfies Record<BadgeTone, string>;

const SIZE = {
	sm: "px-1.5 py-px text-xs",
	md: "px-2 py-0.5 text-sm",
} satisfies Record<BadgeSize, string>;

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-md border tabular-nums whitespace-nowrap",
	{ variants: { tone: TONE, size: SIZE } }
);

export type BadgeProps = {
	children: ReactNode;
	tone?: BadgeTone;
	size?: BadgeSize;
	className?: string;
};

export const Badge = ({
	children,
	tone = "neutral",
	size = "sm",
	className,
}: BadgeProps) => (
	<span className={clsx(badgeVariants({ tone, size }), className)}>
		{children}
	</span>
);

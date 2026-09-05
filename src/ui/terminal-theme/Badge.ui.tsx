import type { ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

import type { SwatchTheme } from "~/modules/run/gate/domain/swatch.model";

export type BadgeTone =
	| "neutral"
	| "muted"
	| "viridian"
	| "cinnabar"
	| "saffron"
	| "celadon"
	| "cerulean"
	| "lavender"
	| "theme";

export type BadgeSize = "sm" | "md";

export const themeToneFor = (theme: SwatchTheme | undefined): BadgeTone =>
	theme === undefined || theme === "champion" ? "neutral" : "theme";

const TONE = {
	neutral: "bg-zinc-100/10 text-zinc-200",
	muted: "bg-zinc-100/5 text-zinc-400",
	viridian: "bg-viridian/15 text-viridian",
	cinnabar: "bg-cinnabar/15 text-cinnabar",
	saffron: "bg-saffron/15 text-saffron",
	celadon: "bg-celadon/15 text-celadon",
	cerulean: "bg-cerulean/15 text-cerulean",
	lavender: "bg-lavender/15 text-lavender",
	theme: "bg-theme-soft text-theme",
} satisfies Record<BadgeTone, string>;

const SIZE = {
	sm: "px-1.5 py-px text-xs",
	md: "px-2 py-0.5 text-sm",
} satisfies Record<BadgeSize, string>;

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-md tabular-nums whitespace-nowrap",
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

const FACT_NUMBER = /([×+−]?\d[\d.]*(?:\s?(?:%|KB|MB))?×?)/;

export const badgeNumbers = (
	text: string,
	tone: BadgeTone = "neutral"
): ReactNode =>
	text.split(FACT_NUMBER).map((part, index) =>
		index % 2 === 1 ? (
			<Badge key={`${part}-${index}`} tone={tone}>
				{part}
			</Badge>
		) : (
			part
		)
	);

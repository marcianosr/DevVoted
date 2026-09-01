import type { ReactNode } from "react";

import { clsx } from "clsx";

export type DotVariant = "on" | "off" | "action" | "blocked";

export const DOT_VARIANTS = [
	"on",
	"action",
	"blocked",
	"off",
] as const satisfies readonly DotVariant[];

const DISC = "size-2 rounded-full";
const CHAR = "text-xs leading-none";

const MARK = {
	on: <span className={clsx(DISC, "bg-viridian")} />,
	off: <span className={clsx(DISC, "border border-zinc-500")} />,
	action: <span className={clsx(CHAR, "text-saffron")}>⚡</span>,
	blocked: <span className={clsx(CHAR, "font-bold text-cinnabar")}>!</span>,
} satisfies Record<DotVariant, ReactNode>;

export const DOT_LABEL = {
	on: "running",
	off: "sitting out",
	action: "usable",
	blocked: "stopped",
} as const satisfies Record<DotVariant, string>;

export type DotProps = {
	variant: DotVariant;
	className?: string;
};

export const Dot = ({ variant, className }: DotProps) => (
	<span
		role="img"
		aria-label={DOT_LABEL[variant]}
		className={clsx(
			"inline-flex size-3 shrink-0 items-center justify-center",
			className
		)}
	>
		{MARK[variant]}
	</span>
);

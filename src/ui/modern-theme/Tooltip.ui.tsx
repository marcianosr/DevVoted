import type { ReactNode } from "react";

import { clsx } from "clsx";

import { Text } from "./Text.ui";

const TOOLTIP = "group/tip relative inline-flex";

const PANEL =
	"pointer-events-none absolute z-50 hidden w-max max-w-56 rounded-lg border border-edge-strong bg-surface-raised px-2 py-1 shadow-lg group-hover/tip:block group-has-[:focus-visible]/tip:block";

export type TooltipAlign = "left" | "right";

const ALIGN = {
	left: "left-0",
	right: "right-0",
} as const satisfies Record<TooltipAlign, string>;

export type TooltipSide = "below" | "above";

const SIDE = {
	below: "top-full mt-2",
	above: "bottom-full mb-2",
} as const satisfies Record<TooltipSide, string>;

export type TooltipProps = {
	hint: string;
	children: ReactNode;
	className?: string;
	align?: TooltipAlign;
	side?: TooltipSide;
};

export const Tooltip = ({
	hint,
	children,
	className,
	align = "left",
	side = "below",
}: TooltipProps) => (
	<span className={clsx(TOOLTIP, className)}>
		{children}
		<span aria-hidden className={clsx(PANEL, SIDE[side], ALIGN[align])}>
			<Text size="meta" tone="muted">
				{hint}
			</Text>
		</span>
	</span>
);

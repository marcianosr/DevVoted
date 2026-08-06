import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type BadgeTone = "neutral" | "positive" | "price";
/**
 * `corner` is for badges pinned to a chip's edge: they overhang their chip, so
 * they stay small enough not to swallow the label underneath or collide with the
 * next chip's badge.
 */
type BadgeSize = "default" | "corner";

const badge = cva("rounded font-bold", {
	variants: {
		tone: {
			neutral: "border-2 border-pewter bg-black text-pewter",
			positive: "bg-viridian text-black",
			price: "bg-saffron text-black",
		} satisfies Record<BadgeTone, string>,
		size: {
			default: "px-1.5 py-0.5 text-sm",
			corner: "px-1 py-0 text-[0.625rem] leading-4",
		} satisfies Record<BadgeSize, string>,
	},
});

type BadgeProps = {
	children: ReactNode;
	tone?: BadgeTone;
	size?: BadgeSize;
};

export const Badge = ({
	children,
	tone = "neutral",
	size = "default",
}: BadgeProps) => <span className={badge({ tone, size })}>{children}</span>;

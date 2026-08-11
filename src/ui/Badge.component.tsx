import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type BadgeTone = "neutral" | "positive" | "price";

type BadgeSize = "default" | "corner" | "pill";

const badge = cva("font-bold", {
	variants: {
		tone: {
			neutral: "border-2 border-pewter bg-black text-pewter",
			positive: "bg-celadon text-black",
			price: "bg-saffron text-black",
		} satisfies Record<BadgeTone, string>,
		size: {
			default: "rounded px-1.5 py-0.5 text-sm",
			corner: "rounded px-1 py-0 text-[0.625rem] leading-4",
			pill: "rounded-full px-2.5 py-1 text-[10px]",
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

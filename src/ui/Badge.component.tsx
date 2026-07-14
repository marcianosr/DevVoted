import type { ReactNode } from "react";

type BadgeTone = "neutral" | "positive" | "price";

const TONE: Record<BadgeTone, string> = {
	neutral: "bg-pewter text-black",
	positive: "bg-viridian text-black",
	price: "bg-saffron text-black",
};

type BadgeProps = {
	children: ReactNode;
	tone?: BadgeTone;
};

/** A small pill pinned to the top-right corner of a `relative` parent — for "fixed"/"new"/price tags. */
export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
	<span
		className={`absolute -right-1 -top-2 z-10 rounded px-1.5 py-0.5 text-[10px] font-bold ${TONE[tone]}`}
	>
		{children}
	</span>
);

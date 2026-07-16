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

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
	<span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${TONE[tone]}`}>
		{children}
	</span>
);

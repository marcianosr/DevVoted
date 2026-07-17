import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type BadgeTone = "neutral" | "positive" | "price";

const badge = cva("rounded px-1.5 py-0.5 text-[10px] font-bold", {
	variants: {
		tone: {
			neutral: "bg-pewter text-black",
			positive: "bg-viridian text-black",
			price: "bg-saffron text-black",
		} satisfies Record<BadgeTone, string>,
	},
});

type BadgeProps = {
	children: ReactNode;
	tone?: BadgeTone;
};

export const Badge = ({ children, tone = "neutral" }: BadgeProps) => (
	<span className={badge({ tone })}>{children}</span>
);

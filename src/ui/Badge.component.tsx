import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type BadgeTone = "neutral" | "positive" | "price";

const badge = cva("rounded px-1.5 py-0.5 text-sm font-bold", {
	variants: {
		tone: {
			neutral: "border-2 border-pewter bg-black text-pewter",
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

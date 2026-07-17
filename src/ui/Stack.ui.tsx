import type { ReactNode } from "react";

import { cva } from "class-variance-authority";

type StackGap = "4" | "6" | "8";

const stack = cva("flex flex-col", {
	variants: {
		gap: {
			"4": "gap-4",
			"6": "gap-6",
			"8": "gap-8",
		} satisfies Record<StackGap, string>,
	},
});

export const Stack = ({
	gap = "6",
	children,
}: {
	gap?: StackGap;
	children: ReactNode;
}) => <div className={stack({ gap })}>{children}</div>;

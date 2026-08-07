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
		// A rule between children, not around them — divide-y skips the first, so a
		// one-child stack stays a plain stack.
		divided: {
			true: "divide-y divide-zinc-800",
			false: "",
		},
	},
	// Flex gap sits entirely above the rule, which would hang the line off the
	// next section's forehead. Matching top padding to the gap centres it.
	compoundVariants: [
		{ divided: true, gap: "4", class: "[&>*+*]:pt-4" },
		{ divided: true, gap: "6", class: "[&>*+*]:pt-6" },
		{ divided: true, gap: "8", class: "[&>*+*]:pt-8" },
	],
});

export const Stack = ({
	gap = "6",
	divided = false,
	children,
}: {
	gap?: StackGap;
	/** Separate the children with a hairline rule. */
	divided?: boolean;
	children: ReactNode;
}) => <div className={stack({ gap, divided })}>{children}</div>;

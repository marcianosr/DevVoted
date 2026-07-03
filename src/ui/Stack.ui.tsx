import type { ReactNode } from "react";

import { clsx } from "clsx";

type StackGap = "4" | "6" | "8";

const GAP_CLASSES: Record<StackGap, string> = {
	"4": "gap-4",
	"6": "gap-6",
	"8": "gap-8",
};

export const Stack = ({
	gap = "6",
	children,
}: {
	gap?: StackGap;
	children: ReactNode;
}) => <div className={clsx("flex flex-col", GAP_CLASSES[gap])}>{children}</div>;

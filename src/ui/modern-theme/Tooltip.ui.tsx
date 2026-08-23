import type { ReactNode } from "react";

import { Text } from "./Text.ui";

const TOOLTIP = "group/tip relative inline-flex";

// Hover is read off this wrapper, not off the child, so a disabled button —
// which fires no mouse events of its own — still shows its hint.
const PANEL =
	"pointer-events-none absolute top-full left-0 z-50 mt-2 hidden w-max max-w-56 rounded-lg border border-edge-strong bg-surface-raised px-2 py-1 shadow-lg group-hover/tip:block group-focus-within/tip:block";

export type TooltipProps = {
	hint: string;
	children: ReactNode;
};

export const Tooltip = ({ hint, children }: TooltipProps) => (
	<span className={TOOLTIP}>
		{children}
		{/* Hidden from assistive tech: the trigger the caller supplies carries the
		    same words as its label, and a floating copy would be read twice. */}
		<span aria-hidden className={PANEL}>
			<Text size="meta" tone="muted">
				{hint}
			</Text>
		</span>
	</span>
);

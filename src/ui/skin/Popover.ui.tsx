import type { ReactNode } from "react";

import { clsx } from "clsx";

const ANCHOR = "group/pop relative inline-flex";

// Hidden by default and revealed by hover OR focus-within, so a keyboard reaches
// it too. Namespaced group/pop: a popover inside a fold must not answer to the
// fold's own group.
const PANEL =
	"pointer-events-none absolute top-full left-0 z-20 mt-2 hidden w-max max-w-xs rounded-lg border border-edge-strong bg-surface p-3 text-left group-focus-within/pop:block group-hover/pop:block";

export type PopoverProps = {
	children: ReactNode;
	content: ReactNode;
	className?: string;
};

export const Popover = ({ children, content, className }: PopoverProps) => (
	<span className={clsx(ANCHOR, className)}>
		{children}
		<span role="tooltip" className={PANEL}>
			{content}
		</span>
	</span>
);

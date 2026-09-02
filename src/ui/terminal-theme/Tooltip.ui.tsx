import type { ReactNode } from "react";

import { clsx } from "clsx";

const WRAP = "group/tip relative inline-flex";
const BUBBLE =
	"pointer-events-none invisible absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 rounded-md border border-edge-strong bg-zinc-900 px-2 py-1 text-xs whitespace-nowrap text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover/tip:visible group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:visible group-has-[:focus-visible]/tip:opacity-100";
const ARROW =
	"absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 border-r border-b border-edge-strong bg-zinc-900";

export type TooltipProps = {
	hint?: string;
	children: ReactNode;
	className?: string;
};

export const Tooltip = ({ hint, children, className }: TooltipProps) => {
	if (hint === undefined) return <>{children}</>;

	return (
		<span className={clsx(WRAP, className)}>
			{children}
			<span aria-hidden className={BUBBLE}>
				{hint}
				<span className={ARROW} />
			</span>
		</span>
	);
};

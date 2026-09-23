import type { ReactNode } from "react";

import { clsx } from "clsx";

const WRAP = "group/tip relative inline-flex";
const BUBBLE =
	"pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-72 -translate-x-1/2 rounded-md border border-edge-strong bg-zinc-900 px-2 py-1 text-xs text-zinc-100 shadow-lg transition-opacity";
const ON_HOVER =
	"invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:visible group-has-[:focus-visible]/tip:opacity-100";
const PINNED = "visible opacity-100";
const ARROW =
	"absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 border-r border-b border-edge-strong bg-zinc-900";

export type TooltipProps = {
	hint?: ReactNode;
	/** Holds the bubble open after a press, for a pointer that cannot hover. */
	open?: boolean;
	children: ReactNode;
	className?: string;
};

export const Tooltip = ({
	hint,
	open = false,
	children,
	className,
}: TooltipProps) => {
	if (hint === undefined) return <>{children}</>;

	return (
		<span className={clsx(WRAP, className)}>
			{children}
			<span aria-hidden className={clsx(BUBBLE, open ? PINNED : ON_HOVER)}>
				{hint}
				<span className={ARROW} />
			</span>
		</span>
	);
};

import type { ReactNode } from "react";

type TooltipProps = {
	content: ReactNode;
	children: ReactNode;
};

/** CSS-only hover/focus tooltip: wraps a trigger and reveals `content` beneath it. */
export const Tooltip = ({ content, children }: TooltipProps) => (
	<span className="group relative inline-flex">
		{children}
		<span
			role="tooltip"
			className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-left shadow-lg group-hover:block group-focus-within:block"
		>
			{content}
		</span>
	</span>
);

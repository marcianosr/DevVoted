import type { ReactNode } from "react";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type TooltipProps = {
	content: ReactNode;
	children: ReactNode;
	surfaceClassName?: string;
	/** Extra classes for the wrapper — e.g. `w-full` to let the trigger stretch. */
	className?: string;
	/** Fit-content one-liner surface (a voter's name) instead of the w-64 panel. */
	compact?: boolean;
};

export const Tooltip = ({
	content,
	children,
	surfaceClassName = "border-zinc-700 bg-zinc-900",
	className = "",
	compact = false,
}: TooltipProps) => (
	// span, not the default <p>: block-level children (Avatar renders a div)
	// inside a <p> get reparented by the HTML parser and break hydration.
	<Paragraph as="span" className={`group relative inline-flex ${className}`}>
		{children}
		<span
			role="tooltip"
			className={`pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 rounded-lg border text-left shadow-lg group-hover:block group-focus-within:block ${compact ? "w-max px-2 py-1" : "w-64 p-3"} ${surfaceClassName}`}
		>
			{content}
		</span>
	</Paragraph>
);

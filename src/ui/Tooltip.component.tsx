import type { ReactNode } from "react";
import { Paragraph } from "~/ui/typography/Paragraph.component";

type TooltipProps = {
	content: ReactNode;
	children: ReactNode;
	surfaceClassName?: string;
	/** Extra classes for the wrapper — e.g. `w-full` to let the trigger stretch. */
	className?: string;
};

export const Tooltip = ({
	content,
	children,
	surfaceClassName = "border-zinc-700 bg-zinc-900",
	className = "",
}: TooltipProps) => (
	<Paragraph className={`group relative inline-flex ${className}`}>
		{children}
		<span
			role="tooltip"
			className={`pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border p-3 text-left shadow-lg group-hover:block group-focus-within:block ${surfaceClassName}`}
		>
			{content}
		</span>
	</Paragraph>
);

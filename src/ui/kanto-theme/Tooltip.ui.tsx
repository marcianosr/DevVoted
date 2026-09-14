import type { ReactNode } from "react";

const WRAP = "group/tip relative inline-flex";
const TRIGGER = "cursor-help underline decoration-dotted underline-offset-4";
const PANEL =
	"pointer-events-none absolute top-full z-30 mt-2 w-72 transition-opacity";
const PANEL_SHUT =
	"invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100 group-has-[:focus-visible]/tip:visible group-has-[:focus-visible]/tip:opacity-100";
const BODY =
	"flex w-full flex-col gap-2 rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3 text-xs text-theme-soft";

export type TooltipAlign = "start" | "end";

const ALIGN = {
	start: "left-0",
	end: "right-0",
} satisfies Record<TooltipAlign, string>;

export type TooltipProps = {
	hint?: ReactNode;
	label: string;
	align?: TooltipAlign;
	children: ReactNode;
};

export const Tooltip = ({
	hint,
	label,
	align = "start",
	children,
}: TooltipProps) => {
	if (hint === undefined) return <>{children}</>;

	return (
		<span className={WRAP}>
			<button type="button" aria-label={label} className={TRIGGER}>
				{children}
			</button>
			<span aria-hidden className={`${PANEL} ${ALIGN[align]} ${PANEL_SHUT}`}>
				<span className={BODY}>{hint}</span>
			</span>
		</span>
	);
};

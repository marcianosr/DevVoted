import { type ReactNode, useState } from "react";

const WRAP = "group/tip relative inline-flex";
const TRIGGER = "cursor-help underline decoration-dotted underline-offset-4";
const TRIGGER_BARE = "cursor-help";
const PANEL = "pointer-events-none absolute z-30 transition-opacity";
const PANEL_SHUT =
	"invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100";
const PANEL_OPEN = "visible opacity-100";
const BODY =
	"flex w-full flex-col gap-2 rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3 text-xs text-theme-soft";

export type TooltipAlign = "start" | "center" | "end";
export type TooltipSide = "top" | "bottom";
export type TooltipWidth = "default" | "wide";

const ALIGN = {
	start: "left-0",
	center: "left-1/2 -translate-x-1/2",
	end: "right-0",
} satisfies Record<TooltipAlign, string>;

const SIDE = {
	top: "bottom-full mb-2",
	bottom: "top-full mt-2",
} satisfies Record<TooltipSide, string>;

const WIDTH = {
	default: "w-72",
	wide: "w-72 sm:w-112",
} satisfies Record<TooltipWidth, string>;

export type TooltipProps = {
	hint?: ReactNode;
	label: string;
	align?: TooltipAlign;
	side?: TooltipSide;
	width?: TooltipWidth;
	/** A trigger that already reads as one — a badge — wants no dotted underline. */
	bare?: boolean;
	children: ReactNode;
};

/**
 * Hover reveals it on a pointer; a press holds it open for everyone else. Touch
 * has no hover at all, and Safari does not focus a button on tap, so a
 * CSS-only reveal keyed on `:hover` or `:focus-visible` is simply dead on a
 * phone. The press takes focus explicitly, which is what lets the blur close it
 * when the next tap lands somewhere else.
 */
export const Tooltip = ({
	hint,
	label,
	align = "start",
	side = "bottom",
	width = "default",
	bare = false,
	children,
}: TooltipProps) => {
	const [held, setHeld] = useState(false);

	if (hint === undefined) return <>{children}</>;

	return (
		<span className={WRAP}>
			<button
				type="button"
				aria-label={label}
				aria-expanded={held}
				className={bare ? TRIGGER_BARE : TRIGGER}
				onClick={(event) => {
					event.currentTarget.focus();
					setHeld(!held);
				}}
				onBlur={() => setHeld(false)}
			>
				{children}
			</button>
			<span
				aria-hidden
				className={`${PANEL} ${SIDE[side]} ${WIDTH[width]} ${ALIGN[align]} ${held ? PANEL_OPEN : PANEL_SHUT}`}
			>
				<span className={BODY}>{hint}</span>
			</span>
		</span>
	);
};

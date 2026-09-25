import { type ReactNode, useState } from "react";

const WRAP = "group/tip relative inline-flex";
const TRIGGER = "cursor-help underline decoration-dotted underline-offset-4";
const TRIGGER_BARE = "cursor-help";
/**
 * A phone gets a sheet, not a popup: the panel is wider than the gap between a
 * chip and the screen's edge, so anchoring it to the trigger put half of it
 * past the viewport with nothing to scroll it back. Fixed to the bottom of the
 * screen it fits by construction. From `sm` there is room to anchor it again,
 * which keeps the panel beside the thing it explains.
 */
const PANEL =
	"fixed inset-x-4 bottom-4 z-30 transition-opacity sm:absolute sm:inset-x-auto sm:bottom-auto";
const PANEL_SHUT =
	"pointer-events-none invisible opacity-0 group-hover/tip:visible group-hover/tip:opacity-100";
/**
 * Pointer events come back when it opens. They were switched off on the panel
 * itself and never switched on again, so a sheet too tall to fit could not be
 * scrolled — the one case where the reader most needs to reach it.
 */
const PANEL_OPEN = "pointer-events-auto visible opacity-100";
/**
 * Capped and scrollable. The sheet is pinned by its bottom edge, so without a
 * ceiling a long hint grows upward past the top of the screen and takes its
 * first line with it.
 */
const BODY =
	"flex max-h-[70vh] w-full flex-col gap-2 overflow-y-auto rounded-2xl border border-theme-faint bg-theme-raised px-4 py-3 text-xs text-theme-soft";

export type TooltipAlign = "start" | "center" | "end";
export type TooltipSide = "top" | "bottom";
export type TooltipWidth = "default" | "wide";

const ALIGN = {
	start: "sm:left-0",
	center: "sm:left-1/2 sm:-translate-x-1/2",
	end: "sm:right-0",
} satisfies Record<TooltipAlign, string>;

const SIDE = {
	top: "sm:bottom-full sm:mb-2",
	bottom: "sm:top-full sm:mt-2",
} satisfies Record<TooltipSide, string>;

const WIDTH = {
	default: "sm:w-72",
	wide: "sm:w-72 md:w-112",
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

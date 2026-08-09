import {
	useState,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
} from "react";
import { clsx } from "clsx";

export type Fold = {
	/**
	 * Whether a tap has pinned this row open. Undefined until one has, because
	 * until then the breakpoint decides and the row cannot honestly claim either.
	 */
	expanded?: boolean;
	toggle: () => void;
	/** Visibility classes for the caller's own detail cell. */
	detailClass: string;
	/**
	 * Visibility classes for summary content that repeats something the detail
	 * already shows once open (a progress counter, say) — the exact inverse of
	 * `detailClass` at every breakpoint, so the value shows in exactly one place.
	 */
	summaryOnlyClass: string;
	/** The disclosure caret, placed by the caller inside its own layout. */
	marker: ReactNode;
};

const hitsRowControl = (event: { target: EventTarget }): boolean =>
	event.target instanceof HTMLElement &&
	event.target.closest("button") !== null;

/**
 * Rows read as sentences on a wide screen, but a phone fits only two or three
 * that way — so the *default* fold is a breakpoint rather than state: CSS keeps
 * the detail shut below `sm` and open above it. No media query to read, no
 * hydration flash, and a window that changes width still gets the right default.
 * A tap then pins the row on every width.
 *
 * `defaultOpen` overrides that breakpoint when the caller knows which rows are
 * worth reading — then the answer is the same at every width, because a row
 * singled out for attention deserves it on a phone too.
 */
const detailVisibility = (
	foldable: boolean,
	pinned: boolean | null,
	defaultOpen?: boolean
): string => {
	if (!foldable) return "flex";
	if (pinned !== null) return pinned ? "flex" : "hidden";
	if (defaultOpen === undefined) return "hidden sm:flex";
	return defaultOpen ? "flex" : "hidden";
};

// The exact inverse of detailVisibility: visible wherever the detail is not,
// so a value shown in the detail's own rows drops out of the summary there.
const summaryOnlyVisibility = (
	foldable: boolean,
	pinned: boolean | null,
	defaultOpen?: boolean
): string => {
	if (!foldable) return "hidden";
	if (pinned !== null) return pinned ? "hidden" : "inline";
	if (defaultOpen === undefined) return "inline sm:hidden";
	return defaultOpen ? "hidden" : "inline";
};

/** The caret points right while shut, down while open — following the same rule. */
const markerRotation = (
	foldable: boolean,
	pinned: boolean | null,
	defaultOpen?: boolean
): string => {
	if (!foldable) return "rotate-90";
	if (pinned !== null) return pinned ? "rotate-90" : "rotate-0";
	if (defaultOpen === undefined) return "sm:rotate-90";
	return defaultOpen ? "rotate-90" : "rotate-0";
};

/**
 * Decorative: the row itself is the hit target, which on a phone is the whole
 * point — a caret-sized tap area would be a miss waiting to happen.
 */
const FoldMarker = ({ rotation }: { rotation: string }) => (
	<span
		aria-hidden
		className={clsx(
			"inline-block shrink-0 text-xs text-zinc-500 transition-transform",
			rotation
		)}
	>
		▸
	</span>
);

type FoldableRowProps = {
	summary: (fold: Fold) => ReactNode;
	detail: (fold: Fold) => ReactNode;
	onActivate?: () => void;
	foldable?: boolean;
	/**
	 * Whether this row starts open, overriding the breakpoint default. Omit and
	 * the row follows the screen width, which is the right answer for a list where
	 * every row matters equally.
	 */
	defaultOpen?: boolean;
	className?: string;
	/** Spoken name for an activatable row — required for it to be operable. */
	activateLabel?: string;
	/**
	 * Where the row sits in its parent grid. Defaults to the whole three-column
	 * table; a numbered list passes the offset span so the number stays a sibling
	 * cell outside the row's own box. The subgrid renumbers from 1 either way, so
	 * the cells inside never change.
	 */
	placement?: string;
};

export const FoldableRow = ({
	summary,
	detail,
	onActivate,
	foldable = true,
	defaultOpen,
	className,
	activateLabel,
	placement = "col-span-3",
}: FoldableRowProps) => {
	const [pinned, setPinned] = useState<boolean | null>(null);
	// A first tap flips the row away from wherever it started, so a shut-by-
	// default row opens on tap instead of needing two.
	const toggle = () => setPinned((open) => !(open ?? defaultOpen ?? true));

	const fold: Fold = {
		expanded: pinned ?? undefined,
		toggle,
		detailClass: detailVisibility(foldable, pinned, defaultOpen),
		summaryOnlyClass: summaryOnlyVisibility(foldable, pinned, defaultOpen),
		marker: foldable ? (
			<FoldMarker rotation={markerRotation(foldable, pinned, defaultOpen)} />
		) : null,
	};

	const handleClick = (event: MouseEvent<HTMLDivElement>) => {
		if (hitsRowControl(event)) return;
		if (onActivate) {
			onActivate();
			return;
		}
		if (!foldable) return;
		toggle();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			onActivate?.();
		}
	};

	return (
		<div
			className={clsx(
				placement,
				"grid grid-cols-subgrid items-start gap-x-4 py-2",
				"cursor-pointer transition-colors hover:bg-zinc-900/60",
				className
			)}
			onClick={handleClick}
			role={onActivate ? "button" : undefined}
			aria-label={onActivate ? activateLabel : undefined}
			tabIndex={onActivate ? 0 : undefined}
			onKeyDown={onActivate ? handleKeyDown : undefined}
		>
			{summary(fold)}
			{detail(fold)}
		</div>
	);
};

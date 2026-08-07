import { clsx } from "clsx";
import {
	useEffect,
	useRef,
	useState,
	type PointerEvent,
	type ReactNode,
} from "react";
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

/**
 * Hover and focus reveal the panel on a pointer device. A touch screen has
 * neither — iOS does not focus a button on tap and emulated hover is unreliable —
 * so a tap pins the panel open instead, and holds it until the next gesture:
 * another tap on the trigger, a tap anywhere else, or Escape.
 *
 * A mouse click deliberately does NOT pin: hover already covers the mouse, and
 * pinning would leave a panel hanging over the page after every click on a
 * tooltipped button.
 */
export const Tooltip = ({
	content,
	children,
	surfaceClassName = "border-zinc-700 bg-zinc-900",
	className = "",
	compact = false,
}: TooltipProps) => {
	const [pinned, setPinned] = useState(false);
	const triggerRef = useRef<HTMLSpanElement>(null);

	// The outside-tap listener ignores taps on the trigger, so it never races the
	// toggle below: closing on pointerdown and reopening on pointerup would make
	// a pinned panel impossible to dismiss by tapping its own trigger again.
	useEffect(() => {
		if (!pinned) return;
		const closeOnOutsideTap = (event: globalThis.PointerEvent) => {
			const target = event.target;
			if (target instanceof Node && triggerRef.current?.contains(target))
				return;
			setPinned(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setPinned(false);
		};
		document.addEventListener("pointerdown", closeOnOutsideTap);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsideTap);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [pinned]);

	const togglePin = (event: PointerEvent<HTMLSpanElement>) => {
		if (event.pointerType === "mouse") return;
		setPinned((open) => !open);
	};

	return (
		// span, not the default <p>: block-level children (Avatar renders a div)
		// inside a <p> get reparented by the HTML parser and break hydration.
		<Paragraph
			as="span"
			className={clsx("group relative inline-flex", className)}
		>
			{/* display:contents leaves the trigger's own layout untouched while
			    giving the tap a node to hang on and to test containment against. */}
			<span ref={triggerRef} className="contents" onPointerUp={togglePin}>
				{children}
			</span>
			<span
				role="tooltip"
				className={clsx(
					"pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 rounded-lg border text-left shadow-lg",
					pinned
						? "block"
						: "hidden group-hover:block group-focus-within:block",
					compact ? "w-max px-2 py-1" : "w-64 p-3",
					surfaceClassName
				)}
			>
				{content}
			</span>
		</Paragraph>
	);
};

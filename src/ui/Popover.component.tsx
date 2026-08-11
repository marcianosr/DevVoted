import { useEffect, useId, useRef, useState } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type OpenSource = "none" | "hover" | "sticky";

type PopoverProps = {
	content: React.ReactNode;
	ariaLabel: string;
	children: React.ReactNode;
	triggerAs?: "button" | "span";
	className?: string;
};

const popoverTrigger = cva(
	"cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
	{
		variants: {
			as: {
				span: "inline-flex rounded-md",
				button: "rounded-full",
			},
		},
	}
);

export const Popover = ({
	content,
	ariaLabel,
	children,
	triggerAs = "button",
	className,
}: PopoverProps) => {
	const [openSource, setOpenSource] = useState<OpenSource>("none");
	const popoverRef = useRef<HTMLDivElement>(null);

	// Placement is entirely CSS (`.popover-anchored` in app.css). The only thing
	// React contributes is this name, because `anchor-name` idents are
	// document-scoped: two Popovers sharing one static name would both resolve to
	// whichever trigger came last in the DOM. useId gives one per instance;
	// non-word characters are stripped so it's a valid dashed-ident.
	const anchorName = `--popover-${useId().replace(/\W/g, "")}`;

	const isOpen = openSource !== "none";

	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) return;

		if (!isOpen) {
			popover.hidePopover();
			return;
		}
		popover.showPopover();
	}, [isOpen]);

	// Browser-initiated close (ESC, light-dismiss) — sync state so React knows
	// the popover is no longer open. Otherwise the next hover wouldn't reopen.
	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) return;

		const handleToggle = (e: Event) => {
			const toggle = e as ToggleEvent;
			if (toggle.newState === "closed") {
				setOpenSource("none");
			}
		};

		popover.addEventListener("toggle", handleToggle);
		return () => popover.removeEventListener("toggle", handleToggle);
	}, []);

	const handleClick = () => {
		setOpenSource((prev) => (prev === "sticky" ? "none" : "sticky"));
	};
	const handleMouseEnter = () => {
		setOpenSource((prev) => (prev === "none" ? "hover" : prev));
	};
	const handleMouseLeave = () => {
		setOpenSource((prev) => (prev === "hover" ? "none" : prev));
	};
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		handleClick();
	};

	const triggerProps = {
		onClick: handleClick,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		onFocus: handleMouseEnter,
		onBlur: handleMouseLeave,
		style: { anchorName },
		"aria-haspopup": "dialog" as const,
		"aria-expanded": isOpen,
		"aria-label": ariaLabel,
	};

	return (
		<>
			{triggerAs === "span" ? (
				<span
					role="button"
					tabIndex={0}
					onKeyDown={handleKeyDown}
					className={clsx(popoverTrigger({ as: "span" }), className)}
					{...triggerProps}
				>
					{children}
				</span>
			) : (
				<button
					type="button"
					className={popoverTrigger({ as: "button" })}
					{...triggerProps}
				>
					{children}
				</button>
			)}
			<div
				ref={popoverRef}
				popover="auto"
				style={{ positionAnchor: anchorName }}
				className="popover-anchored border border-theme bg-gray-900 p-3"
			>
				{content}
			</div>
		</>
	);
};

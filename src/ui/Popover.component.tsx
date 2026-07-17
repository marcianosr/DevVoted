import { useCallback, useEffect, useRef, useState } from "react";

import { cva } from "class-variance-authority";

type OpenSource = "none" | "hover" | "sticky";

type Position = { top: number; left: number };

type PopoverProps = {
	content: React.ReactNode;
	ariaLabel: string;
	children: React.ReactNode;
	triggerAs?: "button" | "span";
};

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 8;

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
}: PopoverProps) => {
	const [openSource, setOpenSource] = useState<OpenSource>("none");
	const [position, setPosition] = useState<Position | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const popoverRef = useRef<HTMLDivElement>(null);

	const isOpen = openSource !== "none";

	const computePosition = useCallback(() => {
		const trigger = triggerRef.current;
		const popover = popoverRef.current;
		if (!trigger || !popover) return;

		const t = trigger.getBoundingClientRect();
		const p = popover.getBoundingClientRect();

		const preferredTop = t.top - p.height - TRIGGER_GAP;
		const top =
			preferredTop < VIEWPORT_MARGIN ? t.bottom + TRIGGER_GAP : preferredTop;

		const centered = t.left + t.width / 2 - p.width / 2;
		const left = Math.max(
			VIEWPORT_MARGIN,
			Math.min(centered, window.innerWidth - p.width - VIEWPORT_MARGIN)
		);

		setPosition({ top, left });
	}, []);

	useEffect(() => {
		const popover = popoverRef.current;
		if (!popover) return;

		if (isOpen) {
			popover.showPopover();
			computePosition();
		} else {
			popover.hidePopover();
		}
	}, [isOpen, computePosition]);

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

	const setTriggerRef = (element: HTMLElement | null) => {
		triggerRef.current = element;
	};

	const triggerProps = {
		onClick: handleClick,
		onMouseEnter: handleMouseEnter,
		onMouseLeave: handleMouseLeave,
		onFocus: handleMouseEnter,
		onBlur: handleMouseLeave,
		"aria-haspopup": "dialog" as const,
		"aria-expanded": isOpen,
		"aria-label": ariaLabel,
	};

	return (
		<>
			{triggerAs === "span" ? (
				<span
					ref={setTriggerRef}
					role="button"
					tabIndex={0}
					onKeyDown={handleKeyDown}
					className={popoverTrigger({ as: "span" })}
					{...triggerProps}
				>
					{children}
				</span>
			) : (
				<button
					ref={setTriggerRef}
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
				style={
					position
						? {
								position: "fixed",
								top: position.top,
								left: position.left,
								margin: 0,
							}
						: undefined
				}
				className="border border-theme bg-gray-900 p-3"
			>
				{content}
			</div>
		</>
	);
};

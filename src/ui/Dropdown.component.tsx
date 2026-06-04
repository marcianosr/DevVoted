import { type ReactNode, useEffect, useRef, useState } from "react";

import { clsx } from "clsx";

type DropdownProps = {
	trigger: (props: { isOpen: boolean }) => ReactNode;
	children: (props: { close: () => void }) => ReactNode;
	align?: "left" | "right";
	panelClassName?: string;
};

export const Dropdown = ({
	trigger,
	children,
	align = "right",
	panelClassName,
}: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	const close = () => setIsOpen(false);

	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) {
				close();
			}
		};
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen]);

	return (
		<div ref={rootRef} className="relative inline-block">
			<button
				type="button"
				onClick={() => setIsOpen((open) => !open)}
				aria-haspopup="menu"
				aria-expanded={isOpen}
				className="inline-flex items-center cursor-pointer"
			>
				{trigger({ isOpen })}
			</button>
			{isOpen && (
				<div
					role="menu"
					className={clsx(
						"absolute top-full mt-2 min-w-[180px] border border-theme bg-gray-900 shadow-lg py-1 z-50",
						align === "right" ? "right-0" : "left-0",
						panelClassName
					)}
				>
					{children({ close })}
				</div>
			)}
		</div>
	);
};

type DropdownItemProps = {
	onClick?: () => void;
	disabled?: boolean;
	children: ReactNode;
	variant?: "default" | "danger";
};

export const DropdownItem = ({
	onClick,
	disabled,
	children,
	variant = "default",
}: DropdownItemProps) => {
	return (
		<button
			type="button"
			role="menuitem"
			onClick={onClick}
			disabled={disabled}
			className={clsx(
				"w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed",
				variant === "danger" ? "text-red-300" : "text-gray-200"
			)}
		>
			{children}
		</button>
	);
};

export const DropdownDivider = () => <hr className="my-1 border-gray-800" />;

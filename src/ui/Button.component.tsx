import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "theme" | "danger" | "neutral";
type ButtonSize = "default" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	// Persistent "on" state for toggle/filter buttons; also sets aria-pressed.
	isSelected?: boolean;
};

// Variants carry color only; spacing lives in `size` so every variant shrinks.
const button = cva(
	"rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				primary: "",
				secondary:
					"border border-theme text-theme hover:bg-theme-soft disabled:opacity-40",
				// text color is set per isSelected below so the selected fill wins.
				theme:
					"border-2 border-theme hover:bg-theme hover:text-black disabled:opacity-40",
				danger:
					"border-2 border-cinnabar text-white hover:bg-cinnabar/40 disabled:opacity-40",
				// The no-drama option next to a loud one (e.g. a dialog's cancel).
				neutral:
					"border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:bg-white/5 disabled:opacity-40",
			},
			size: {
				default: "px-4 py-2 text-sm",
				small: "px-3 py-1.5 text-sm",
			},
			isDisabled: {
				true: "",
				false: "",
			},
			isSelected: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
			// Theme toggle: outline (colored text) when off, filled (black text) when on.
			{ variant: "theme", isSelected: false, class: "text-theme" },
			{ variant: "theme", isSelected: true, class: "bg-theme text-black" },
			{ variant: "secondary", isSelected: true, class: "bg-theme-soft" },
			{ variant: "primary", size: "default", class: "text-base px-6 py-3.5" },
			{ variant: "primary", size: "small", class: "text-sm px-3 py-2" },
			{
				variant: "primary",
				isDisabled: true,
				class: "bg-zinc-800 text-gray-500",
			},
			{
				variant: "primary",
				isDisabled: false,
				class: "bg-theme text-black hover:opacity-90",
			},
		],
		defaultVariants: {
			variant: "primary",
			size: "default",
			isDisabled: false,
			isSelected: false,
		},
	}
);

export const Button = ({
	children,
	variant = "primary",
	size = "default",
	disabled,
	isLoading,
	isSelected,
	className,
	type = "button",
	...props
}: ButtonProps) => {
	const isDisabled = disabled || isLoading;

	return (
		<button
			type={type}
			disabled={isDisabled}
			aria-pressed={isSelected}
			className={clsx(
				button({ variant, size, isDisabled, isSelected }),
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
};

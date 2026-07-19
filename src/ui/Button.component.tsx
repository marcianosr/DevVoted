import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "theme" | "danger";
type ButtonSize = "default" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
};

// Variants carry color only; spacing lives in `size` so every variant shrinks.
const button = cva(
	"rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				primary: "",
				secondary:
					"border border-cerulean text-cerulean hover:bg-cerulean/15 disabled:opacity-40",
				theme:
					"border-2 border-theme text-theme hover:bg-theme hover:text-black disabled:opacity-40",
				danger:
					"border-2 border-cinnabar text-white hover:bg-cinnabar/40 disabled:opacity-40",
			},
			size: {
				default: "px-4 py-2 text-sm",
				small: "px-3 py-1.5 text-sm",
			},
			isDisabled: {
				true: "",
				false: "",
			},
		},
		compoundVariants: [
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
		},
	}
);

export const Button = ({
	children,
	variant = "primary",
	size = "default",
	disabled,
	isLoading,
	className,
	type = "button",
	...props
}: ButtonProps) => {
	const isDisabled = disabled || isLoading;

	return (
		<button
			type={type}
			disabled={isDisabled}
			className={clsx(button({ variant, size, isDisabled }), className)}
			{...props}
		>
			{children}
		</button>
	);
};

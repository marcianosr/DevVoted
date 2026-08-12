import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cva } from "class-variance-authority";
import { clsx } from "clsx";

export type ButtonVariant =
	"primary" | "secondary" | "theme" | "danger" | "neutral";
type ButtonSize = "default" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
	isSelected?: boolean;
};

const button = cva(
	"rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
	{
		variants: {
			variant: {
				primary: "",
				secondary:
					"border border-theme text-theme hover:bg-theme-soft disabled:opacity-40",
				theme:
					"border-2 border-theme hover:bg-theme hover:text-black disabled:opacity-40",
				danger:
					"border-2 border-cinnabar text-white hover:bg-cinnabar/40 disabled:opacity-40",
				neutral:
					"border border-zinc-600 text-zinc-300 hover:border-zinc-400 hover:bg-white/5 disabled:opacity-40",
			},
			size: {
				default: "",
				small: "",
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
			// Sizing — primary is the CTA, one step larger than the rest
			{ variant: "primary", size: "default", class: "px-6 py-3.5 text-xs" },
			{ variant: "primary", size: "small", class: "px-3 py-2 text-sm" },
			{
				variant: ["secondary", "theme", "danger", "neutral"],
				size: "default",
				class: "px-4 py-2 text-sm",
			},
			{
				variant: ["secondary", "theme", "danger", "neutral"],
				size: "small",
				class: "px-3 py-1.5 text-sm",
			},
			// Primary fill — swaps entirely between enabled and disabled
			{
				variant: "primary",
				isDisabled: true,
				class: "bg-zinc-800 text-gray-500",
			},
			{
				variant: "primary",
				isDisabled: false,
				class:
					"border border-theme bg-theme-soft text-theme hover:bg-theme hover:text-black",
			},
			// Toggle state
			{ variant: "theme", isSelected: false, class: "text-theme" },
			{ variant: "theme", isSelected: true, class: "bg-theme text-black" },
			{ variant: "secondary", isSelected: true, class: "bg-theme-soft" },
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

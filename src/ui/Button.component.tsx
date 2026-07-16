import type { ButtonHTMLAttributes, ReactNode } from "react";

import { clsx } from "clsx";

type ButtonVariant = "primary" | "secondary" | "theme" | "danger";
type ButtonSize = "default" | "small";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: ReactNode;
	variant?: ButtonVariant;
	size?: ButtonSize;
	isLoading?: boolean;
};

const SIZE: Record<ButtonSize, string> = {
	default: "text-base px-6 py-3.5",
	small: "text-sm px-3 py-2",
};

const OUTLINE = "border-2 px-4 py-2 text-sm";
const OUTLINE_VARIANT: Record<Exclude<ButtonVariant, "primary">, string> = {
	secondary:
		"border-blue-500 text-white hover:bg-blue-500/40 disabled:bg-blue-200",
	theme:
		"border-theme text-theme hover:bg-theme hover:text-black disabled:opacity-40",
	danger: "border-red-500 text-white hover:bg-red-500/40 disabled:bg-red-200",
};

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
	const variantClass =
		variant === "primary"
			? clsx(
					SIZE[size],
					isDisabled
						? "bg-zinc-800 text-gray-500"
						: "bg-theme text-black hover:opacity-90"
				)
			: clsx(OUTLINE, OUTLINE_VARIANT[variant]);

	return (
		<button
			type={type}
			disabled={isDisabled}
			className={clsx(
				"rounded cursor-pointer transition-colors disabled:cursor-not-allowed",
				variantClass,
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
};

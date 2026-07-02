import { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	isLoading?: boolean;
	size?: "default" | "small";
};

const SIZE_CLASSES = {
	default: "text-base px-6 py-3.5",
	small: "text-sm px-3 py-2",
} as const;

/**
 * The app's primary action button: a solid, theme-colored fill (bg-theme
 * resolves to the surrounding category, or the default cyan on un-themed
 * screens). Greys out when disabled or loading.
 */
export const PrimaryButton = ({
	children,
	disabled,
	isLoading,
	className,
	size = "default",
	type = "button",
	...props
}: PrimaryButtonProps) => {
	const isDisabled = disabled || isLoading;
	const buttonClass = clsx(
		"font-semibold transition-colors",
		SIZE_CLASSES[size],
		isDisabled
			? "bg-zinc-800 text-gray-500 cursor-not-allowed"
			: "bg-theme text-black cursor-pointer hover:opacity-90",
		className
	);

	return (
		<button
			type={type}
			disabled={isDisabled}
			className={buttonClass}
			{...props}
		>
			{children}
		</button>
	);
};

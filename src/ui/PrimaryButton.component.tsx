import { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	isLoading?: boolean;
	size?: "default" | "small";
};

const SIZE_CLASSES = {
	default: "text-2xl px-4 py-4",
	small: "text-sm px-3 py-2",
} as const;

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
		"border-solid border-2 text-white transition-colors btn-color-cycle",
		SIZE_CLASSES[size],
		isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
		isLoading && "bg-blue-300",
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

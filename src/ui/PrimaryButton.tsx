import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	isLoading?: boolean;
};

export const PrimaryButton = ({
	children,
	disabled,
	isLoading,
	className,
	type = "button",
	...props
}: PrimaryButtonProps) => (
	<button
		type={type}
		disabled={disabled || isLoading}
		className={clsx(
			"border-solid border-2 text-white px-4 py-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors cursor-pointer btn-color-cycle",
			className
		)}
		{...props}
	>
		{children}
	</button>
);

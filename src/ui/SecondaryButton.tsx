import { ButtonHTMLAttributes } from "react";

import { clsx } from "clsx";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	isLoading?: boolean;
	variant?: "default" | "danger";
};

export const SecondaryButton = ({
	children,
	disabled,
	isLoading,
	className,
	type = "button",
	variant = "default",
	...props
}: SecondaryButtonProps) => {
	const variantStyles = {
		default:
			"border-blue-500 hover:bg-blue-500/40 text-white disabled:bg-blue-200",
		danger: "border-red-500 hover:bg-red-500/40 text-white disabled:bg-red-200",
	};

	return (
		<button
			type={type}
			disabled={disabled || isLoading}
			className={clsx(
				variantStyles.default,
				variantStyles[variant],
				"px-4 py-2 border-2 transition-colors disabled:cursor-not-allowed cursor-pointer",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
};

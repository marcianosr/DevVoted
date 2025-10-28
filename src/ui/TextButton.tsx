import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	variant?: "success" | "danger";
};

export const TextButton = ({
	children,
	disabled,
	className,
	type = "button",
	variant = "success",
	...props
}: TextButtonProps) => {
	const variantStyles = {
		success: "text-green-500 hover:underline disabled:text-gray-400",
		danger: "text-red-500 hover:underline disabled:text-gray-400",
	};

	return (
		<button
			type={type}
			disabled={disabled}
			className={clsx(
				"text-sm transition-colors disabled:cursor-not-allowed cursor-pointer",
				variantStyles[variant],
				className
			)}
			{...props}
		>
			[ {children} ]
		</button>
	);
};

import { clsx } from "clsx";

type CardProps = {
	borderClass: string;
	bgClass: string;
	size?: "small" | "large";
	disabled?: boolean;
	className?: string;
	children: React.ReactNode;
};

export const Card = ({
	borderClass,
	bgClass,
	size = "large",
	disabled,
	className,
	children,
}: CardProps) => (
	<article
		className={clsx(
			"border",
			borderClass,
			bgClass,
			size === "small" ? "p-2 min-w-40" : "p-4 w-52 min-h-52",
			disabled && "opacity-50 cursor-not-allowed",
			className
		)}
	>
		{children}
	</article>
);

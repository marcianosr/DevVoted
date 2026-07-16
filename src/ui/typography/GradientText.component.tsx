import type { ElementType, ReactNode } from "react";

type GradientTextProps = {
	children: ReactNode;
	as?: ElementType;
	className?: string;
};

export const GradientText = ({
	children,
	as: Tag = "span",
	className = "",
}: GradientTextProps) => (
	<Tag className={`text-gradient-green ${className}`}>{children}</Tag>
);
